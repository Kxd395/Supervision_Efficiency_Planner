import type {
    GlobalAssumptions,
    DemandAssumptions,
    SupervisionRules,
    HRRiskAssumptions,
    Scenario,
    ComputedMetrics
} from './types';

/**
 * Calculates the fully loaded hourly cost for a role.
 */
export function calculateFullyLoadedCost(
    baseHourly: number,
    benefitLoad: number
): number {
    return baseHourly * (1 + benefitLoad);
}

/**
 * Calculates the total monthly payroll for a scenario.
 */
export function calculatePayroll(
    scenario: Scenario,
    global: GlobalAssumptions
): { base: number; loaded: number } {
    const { crsBaseHourly, crssBaseHourly, supervisorBaseHourly, benefitLoad, fteHoursPerMonth } = global;

    // Apply overrides if present
    const crsRate = scenario.overrides?.wages?.crs ?? crsBaseHourly;
    const crssRate = scenario.overrides?.wages?.crss ?? crssBaseHourly;
    const supervisorRate = scenario.overrides?.wages?.supervisor ?? supervisorBaseHourly;
    const load = scenario.overrides?.benefitLoad ?? benefitLoad;

    const crsCost = scenario.frontlineCrsCount * crsRate * fteHoursPerMonth;
    const crssCost = scenario.crssCount * crssRate * fteHoursPerMonth;
    const supervisorCost = scenario.supervisorFte * supervisorRate * fteHoursPerMonth;

    const base = crsCost + crssCost + supervisorCost;
    const loaded = base * (1 + load);

    return { base, loaded };
}

/**
 * Calculates the Supervisor's Load (Hours/Month) for a given scenario.
 */
/**
 * Calculates the Supervisor's Load (Hours/Month) for a given scenario.
 */
export function calculateSupervisorLoad(
    scenario: Scenario,
    rules: SupervisionRules
): number {
    // Scenario A (Baseline)
    if (scenario.id === 'A') {
        return (scenario.frontlineCrsCount * rules.baselineIndivHrsPerStaff) + rules.baselineGroupHrsPerTeam;
    }

    // Scenario B (Internal Promotion) -> Use Tiered B Rules
    if (scenario.id === 'B') {
        const config = rules.tieredB;
        const directWork = (scenario.frontlineCrsCount * config.supervisorIndivPerStaff);
        const groupWork = config.supervisorGroupOnly + config.groupCoFacilitated;
        const managementWork = (scenario.crssCount * config.crssSupervisionHrs);
        return directWork + groupWork + managementWork;
    }

    // Scenario C (External Hire) -> Use Tiered C Rules
    if (scenario.id === 'C') {
        const config = rules.tieredC;
        const directWork = (scenario.frontlineCrsCount * config.supervisorIndivPerStaff);
        const groupWork = config.supervisorGroupOnly + config.groupCoFacilitated;
        const managementWork = (scenario.crssCount * config.crssSupervisionHrs);
        return directWork + groupWork + managementWork;
    }

    return 0; // Fallback
}

/**
 * Calculates the actual supervision hours delivered and compliance status.
 */
export function calculateCompliance(
    scenario: Scenario,
    rules: SupervisionRules,
    _global: GlobalAssumptions
): {
    requiredHours: number;
    actualHours: number;
    effectiveRatio: number;
    status: 'OK' | 'Margin' | 'Non-Compliant';
    safety: 'OK' | 'Overloaded';
    freedHours: number;
} {
    // 1. Calculate Baseline Load (What the Supervisor does TODAY)
    // Formula: (Frontline * Baseline_Indiv) + Baseline_Group
    const baselineLoad = (scenario.frontlineCrsCount * rules.baselineIndivHrsPerStaff) + rules.baselineGroupHrsPerTeam;

    // 2. Calculate Scenario Load (What the Supervisor does in FUTURE)
    const scenarioSupervisorLoad = calculateSupervisorLoad(scenario, rules);

    // 3. Freed Hours
    // Freed_Hours = Baseline_Load - New_Scenario_Load
    const freedSupervisorHours = Math.max(0, baselineLoad - scenarioSupervisorLoad);

    // 4. Calculate Required Hours (Total Demand)
    // In Tiered model, Demand is: (Frontline * (Sup_Indiv + CRSS_Indiv)) + Group_Director + Group_CRSS
    let totalDemandHours = baselineLoad;
    if (scenario.id === 'B') {
        const config = rules.tieredB;
        totalDemandHours = (scenario.frontlineCrsCount * (config.supervisorIndivPerStaff + config.crssIndivPerStaff))
            + config.supervisorGroupOnly
            + config.groupCrssOnly
            + config.groupCoFacilitated;
    } else if (scenario.id === 'C') {
        const config = rules.tieredC;
        totalDemandHours = (scenario.frontlineCrsCount * (config.supervisorIndivPerStaff + config.crssIndivPerStaff))
            + config.supervisorGroupOnly
            + config.groupCrssOnly
            + config.groupCoFacilitated;
    }

    const requiredHours = totalDemandHours;

    // 5. Actual Capacity (Simple FTE calc)
    const supervisorCapacity = scenario.supervisorFte * 160;
    const crssCapacity = scenario.crssCount * 160;
    const actualHours = supervisorCapacity + crssCapacity;

    const effectiveRatio = scenario.crssCount > 0
        ? scenario.frontlineCrsCount / scenario.crssCount
        : 0;

    const safety = (scenario.crssCount > 0 && effectiveRatio > rules.internalMaxRatio)
        ? 'Overloaded'
        : 'OK';

    const status = safety === 'Overloaded' ? 'Non-Compliant' : 'OK';

    return {
        requiredHours,
        actualHours,
        effectiveRatio,
        status,
        safety,
        freedHours: freedSupervisorHours
    };
}

/**
 * Calculates the realized billable impact (revenue) of freeing up supervisor time.
 */
export function calculateBillableImpact(
    freedHours: number,
    global: GlobalAssumptions,
    demand: DemandAssumptions,
    scenario: Scenario
): { realizedHours: number; realizedRevenue: number } {
    const billableRate = scenario.overrides?.billableRate ?? global.supervisorBillableRate;
    const utilization = scenario.overrides?.utilization ?? global.utilizationPercent;

    // Cap new hours by demand capacity
    const potentialHours = Math.min(freedHours, demand.utilizationCap);

    // Apply utilization factor (efficiency)
    const realizedHours = potentialHours * utilization;

    const realizedRevenue = realizedHours * billableRate;

    return { realizedHours, realizedRevenue };
}

/**
 * Calculates one-time onboarding costs.
 */
export function calculateOnboardingCost(
    scenario: Scenario,
    hr: HRRiskAssumptions,
    baseline: Scenario
): number {
    const newCrs = Math.max(0, scenario.frontlineCrsCount - baseline.frontlineCrsCount);
    const newCrss = Math.max(0, scenario.crssCount - baseline.crssCount);

    let cost = 0;

    // CRS Hires
    cost += newCrs * hr.onboardingCostCRS;

    // CRSS Hires
    if (scenario.isInternalPromotion) {
        // If promoting, we technically hired a replacement CRS (already counted in newCrs if headcount grew)
    } else {
        cost += newCrss * hr.onboardingCostCRSS;
    }

    return cost;
}

/**
 * Master function to compute all metrics for a scenario.
 */
export function computeScenarioMetrics(
    scenario: Scenario,
    global: GlobalAssumptions,
    rules: SupervisionRules,
    hr: HRRiskAssumptions,
    baseline: Scenario,
    baselinePayrollLoaded: number,
    enabledFactors: { includeRevenue: boolean; includeRetention: boolean; includeTransitionCost: boolean } = { includeRevenue: true, includeRetention: true, includeTransitionCost: true }
): ComputedMetrics {
    // 1. Compliance
    const compliance = calculateCompliance(scenario, rules, global);

    // 2. Payroll
    const payroll = calculatePayroll(scenario, global);
    const payrollLoaded = payroll.loaded;
    const payrollDeltaLoaded = payrollLoaded - baselinePayrollLoaded;

    // 3. Freed Hours
    const freedSupervisorHours = compliance.freedHours;

    // 4. Financials (CFO-Proof Logic)
    // Revenue = Freed Hours * Utilization * Rate
    let realizedRevenue = freedSupervisorHours * global.supervisorBillableRate * global.utilizationPercent;

    // SENSITIVITY TOGGLE: Revenue
    if (!enabledFactors.includeRevenue) {
        realizedRevenue = 0;
    }

    // 5. Labor Efficiency Savings (Arbitrage)
    const supervisorLoadedRate = global.supervisorBaseHourly * (1 + global.benefitLoad);
    const crssLoadedRate = global.crssBaseHourly * (1 + global.benefitLoad);
    const arbitragePerHour = Math.max(0, supervisorLoadedRate - crssLoadedRate);
    const laborEfficiencySavings = freedSupervisorHours * arbitragePerHour;

    // 6. Hard Labor Savings (Cost Avoidance)
    // Logic: If we are realizing revenue, we can't also claim we are saving the supervisor's salary (double dip).
    // Efficiency savings (Hard) only exist if we are NOT repurposing the hours for revenue (e.g. cutting FTE).
    // However, for this model, we assume "Freed Hours" are repurposed.
    // If Revenue > 0, then Hard Labor Savings = 0.
    // If Revenue == 0, then Hard Labor Savings = Freed Hours * Supervisor Hourly (Cost Avoidance/Reduction).
    // Wait, the prompt says: "Hard_Efficiency = Revenue > 0 ? 0 : Arbitrage".
    // Arbitrage is `laborEfficiencySavings`.
    // So if Revenue > 0, Hard Efficiency is 0. If Revenue == 0, Hard Efficiency is `laborEfficiencySavings`.
    // But wait, the prompt also says: "Net_Impact = Revenue - Payroll_Delta + Hard_Efficiency".

    const hardLaborSavings = realizedRevenue > 0
        ? 0
        : laborEfficiencySavings;

    // 7. Net Monthly Steady State (Hard)
    const netMonthlySteadyStateHard = realizedRevenue - payrollDeltaLoaded + hardLaborSavings;

    // 8. Onboarding
    const onboardingCost = calculateOnboardingCost(scenario, hr, baseline);

    // 9. Retention Savings (Soft)
    let retentionSavings = 0;
    if (scenario.id !== 'A') {
        const totalStaff = scenario.frontlineCrsCount + scenario.crssCount;
        const reductionRate = 0.10;
        const costPerDeparture = hr.turnoverCostPerDeparture ?? 5000;
        const annualSavings = totalStaff * reductionRate * costPerDeparture;
        retentionSavings = annualSavings / 12;
    }

    // SENSITIVITY TOGGLE: Retention
    if (!enabledFactors.includeRetention) {
        retentionSavings = 0;
    }

    // 10. Soft Value Total
    // If Revenue > 0, Efficiency is Soft.
    const softEfficiency = realizedRevenue > 0 ? laborEfficiencySavings : 0;
    const softValueTotal = retentionSavings + softEfficiency;

    // 11. Aggregates
    const netMonthlySteadyStateSoft = softValueTotal;
    const netMonthlySteadyStateTotal = netMonthlySteadyStateHard + netMonthlySteadyStateSoft;

    // Legacy support
    const netMonthlySteadyState = netMonthlySteadyStateHard;

    // 12. Transition Cost (One-Time)
    let transitionCost = 0;
    if (scenario.isInternalPromotion) {
        transitionCost = global.crsBaseHourly * 1.5 * 160;
    }

    // SENSITIVITY TOGGLE: Transition Cost
    if (!enabledFactors.includeTransitionCost) {
        transitionCost = 0;
    }

    // Annual Steady State
    const netAnnualSteadyState = netMonthlySteadyState * 12;

    // Year 1 Net
    const netYearOne = netAnnualSteadyState - onboardingCost - transitionCost;

    // Compliance Status Override for Baseline
    let finalComplianceStatus: 'OK' | 'Margin' | 'Non-Compliant' | 'High Risk' | 'At Capacity' = compliance.status;
    if (scenario.id === 'A') {
        if (compliance.safety === 'Overloaded') {
            finalComplianceStatus = 'High Risk';
        } else {
            finalComplianceStatus = 'At Capacity';
        }
    }

    return {
        totalFte: scenario.frontlineCrsCount + scenario.crssCount + scenario.supervisorFte,
        payrollBase: payroll.base,
        payrollLoaded: payroll.loaded,
        payrollDeltaLoaded,

        freedSupervisorHours,
        clinicalHoursRepurposed: freedSupervisorHours,

        realizedRevenue,
        retentionSavings,
        laborEfficiencySavings,


        // New CFO Metrics
        hardMonthlyCashFlow: realizedRevenue - payrollDeltaLoaded,
        hardLaborSavings,
        softValueTotal,
        netMonthlySteadyStateHard,
        netMonthlySteadyStateSoft,
        netMonthlySteadyStateTotal,

        netMonthlySteadyState,
        netAnnualSteadyState,
        transitionCost,
        netYearOne,
        requiredHours: compliance.requiredHours,
        weightedRequiredHours: 0, // Deprecated
        actualSupervisionHours: compliance.actualHours,
        effectiveRatio: compliance.effectiveRatio,
        complianceStatus: finalComplianceStatus as any,
        safetyStatus: compliance.safety,
        riskFactors: compliance.safety === 'Overloaded' ? ['High Turnover Risk'] : [],
        breakEvenMonths: netMonthlySteadyStateHard > 0 ? transitionCost / netMonthlySteadyStateHard : 0,
    };
}
