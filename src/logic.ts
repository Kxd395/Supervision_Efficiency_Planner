import type {
    GlobalAssumptions,
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
    scenario: Scenario
): { realizedHours: number; realizedRevenue: number } {
    const billableRate = scenario.overrides?.billableRate ?? global.supervisorBillableRate;
    const utilization = scenario.overrides?.utilization ?? global.utilizationPercent;

    // Apply utilization factor (efficiency) to freed hours
    const realizedHours = freedHours * utilization;

    const realizedRevenue = realizedHours * billableRate;

    return { realizedHours, realizedRevenue };
}

/**
 * Calculates grant offset using "First-In Priority" logic.
 * Returns the monthly cost savings from grant-funded slots.
 */
export function calculateGrantOffset(
    totalCRS: number,
    totalCRSS: number,
    grantSlotsCRS: number,
    grantSlotsCRSS: number,
    crsWage: number,
    crssWage: number,
    benefitLoad: number,
    fteHours: number
): { grantUsed: number; grantSavings: number; billableFTEs: number } {
    // 1. Frontline CRS Grants
    const crsGrantUsed = Math.min(totalCRS, grantSlotsCRS);
    const crsLoadedWage = crsWage * (1 + benefitLoad);
    const crsSavings = crsGrantUsed * crsLoadedWage * fteHours;

    // 2. Supervisor CRSS Grants
    const crssGrantUsed = Math.min(totalCRSS, grantSlotsCRSS);
    const crssLoadedWage = crssWage * (1 + benefitLoad);
    const crssSavings = crssGrantUsed * crssLoadedWage * fteHours;

    // 3. Totals
    const grantUsed = crsGrantUsed + crssGrantUsed;
    const grantSavings = crsSavings + crssSavings;

    // Billable FTEs (CRSS only, for Peer Revenue)
    // Only non-grant CRSS can bill? Or can grant-funded CRSS bill?
    // Usually grant-funded positions CANNOT bill Medicaid (double dipping).
    // So Billable CRSS = Total CRSS - Grant CRSS.
    const billableFTEs = Math.max(0, totalCRSS - grantSlotsCRSS);

    return { grantUsed, grantSavings, billableFTEs };
}

/**
 * Calculates peer-generated revenue (e.g., H0038 billing).
 * Uses "Gap Fill" logic: only billable FTEs generate revenue.
 */
export function calculatePeerRevenue(
    billableCRSS: number,
    peerRate: number,
    peerUtilization: number,
    fteHours: number,
    enablePeerBilling: boolean,
    credentialedFTEs?: number
): number {
    // Safety Valve: If billing is disabled, return 0
    if (!enablePeerBilling) return 0;

    // Credentialing Filter: Limit billable staff to credentialed count (if specified)
    // If credentialedFTEs is undefined, assume ALL billable CRSS are credentialed.
    const eligibleFTEs = credentialedFTEs !== undefined
        ? Math.min(billableCRSS, credentialedFTEs)
        : billableCRSS;

    const billableHoursPerFTE = fteHours * peerUtilization;
    const peerRevenue = eligibleFTEs * billableHoursPerFTE * peerRate;

    return peerRevenue;
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

    // 4. NEW: Grant Offset & Peer Revenue (Hybrid Funding)
    // 4. NEW: Grant Offset & Peer Revenue (Hybrid Funding)
    const grantOffset = calculateGrantOffset(
        scenario.frontlineCrsCount,
        scenario.crssCount,
        global.grantSlotsCRS,
        global.grantSlotsCRSS,
        global.crsBaseHourly,
        global.crssBaseHourly,
        global.benefitLoad,
        global.fteHoursPerMonth
    );

    // 5. Revenue Streams (Dual Source)
    // A. Supervisor Revenue (from freed hours)
    let supervisorRevenue = freedSupervisorHours * global.supervisorBillableRate * global.utilizationPercent;

    // B. Peer Revenue (from billable CRSS only - "Gap Fill" logic)
    let peerRevenue = calculatePeerRevenue(
        grantOffset.billableFTEs,
        global.peerBillableRate,
        global.peerUtilization,
        global.fteHoursPerMonth,
        global.enablePeerBilling,
        global.credentialedPeerFTEs
    );

    // SENSITIVITY TOGGLE: Revenue
    if (!enabledFactors.includeRevenue) {
        supervisorRevenue = 0;
        peerRevenue = 0;
    }

    // C. Total Realized Revenue
    const realizedRevenue = supervisorRevenue + peerRevenue;

    // 6. Labor Efficiency Savings (Arbitrage)
    const supervisorLoadedRate = global.supervisorBaseHourly * (1 + global.benefitLoad);
    const crssLoadedRate = global.crssBaseHourly * (1 + global.benefitLoad);
    const arbitragePerHour = Math.max(0, supervisorLoadedRate - crssLoadedRate);
    const laborEfficiencySavings = freedSupervisorHours * arbitragePerHour;

    // 7. Hard Labor Savings (Cost Avoidance)
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

    // 8. Net Monthly Steady State (Hard)
    // Formula: Revenue - (Payroll_Increase - Grant_Savings) + Hard_Labor_Savings
    // We break it down to be explicit as requested:
    const totalNewIncome = realizedRevenue + grantOffset.grantSavings;
    const totalNewCost = payrollDeltaLoaded; // This is the GROSS increase

    // Final Net calculation
    const netMonthlySteadyStateHard = (totalNewIncome - totalNewCost) + hardLaborSavings;

    // 9. Onboarding
    const onboardingCost = calculateOnboardingCost(scenario, hr, baseline);

    // 10. Retention Savings (Soft)
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

    // 11. Soft Value Total
    // If Revenue > 0, Efficiency is Soft.
    const softEfficiency = realizedRevenue > 0 ? laborEfficiencySavings : 0;
    const softValueTotal = retentionSavings + softEfficiency;

    // 12. Aggregates
    const netMonthlySteadyStateSoft = softValueTotal;
    const netMonthlySteadyStateTotal = netMonthlySteadyStateHard + netMonthlySteadyStateSoft;

    // Legacy support
    const netMonthlySteadyState = netMonthlySteadyStateHard;

    // 13. Transition Cost (One-Time)
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
        supervisorRevenue, // NEW: Breakdown
        peerRevenue, // NEW: Breakdown
        retentionSavings,
        laborEfficiencySavings,

        // NEW: Grant/Hybrid Funding Metrics
        grantSavings: grantOffset.grantSavings,
        grantFTEsUsed: grantOffset.grantUsed,

        // New CFO Metrics
        hardMonthlyCashFlow: totalNewIncome - totalNewCost,
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
