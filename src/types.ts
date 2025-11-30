export type Role = 'CRS' | 'CRSS' | 'ClinicalSupervisor';

export interface GlobalAssumptions {
    // Wages & Costs
    crsBaseHourly: number;
    crssBaseHourly: number;
    supervisorBaseHourly: number;
    benefitLoad: number; // e.g., 0.25 for 25%
    fteHoursPerMonth: number;

    // Revenue
    supervisorBillableRate: number;
    supervisorTargetBillableHours: number;
    utilizationPercent: number; // 0.0 to 1.0
    revenueRealizationPercent: number; // 0 to 100
    reinvestmentTask: string; // e.g., "Outpatient Counseling"
}

export interface DemandAssumptions {
    currentSupervisorBillableHours: number;
    maxBillableHoursPerFTE: number;
    activeWaitlist: number;
    newReferralsPerMonth: number;
    avgDaysReferralToAuth: number;
    avgDaysAuthToSession: number;
    utilizationCap: number; // Max new hours we can realistically fill
    rampMonths: number; // Months to reach full utilization
    fundingSource: 'Billable' | 'Grant';
}



export interface TieredConfiguration {
    supervisorIndivPerStaff: number; // Hrs Clinical Supervisor KEEPS
    crssIndivPerStaff: number;       // Hrs delegated to CRSS
    supervisorGroupOnly: number;     // Group hrs Sup runs alone
    groupCrssOnly: number;           // Group hrs CRSS runs alone
    groupCoFacilitated: number;      // Both attend
    crssSupervisionHrs: number;      // Mgmt Overhead
}

export interface SupervisionRules {
    internalMaxRatio: number;
    // A. Baseline Volume
    baselineIndivHrsPerStaff: number;
    baselineGroupHrsPerTeam: number;
    // B. Split Configurations
    tieredB: TieredConfiguration; // Specific to Scenario B
    tieredC: TieredConfiguration; // Specific to Scenario C
}

export interface HRRiskAssumptions {
    promotionRaisePerHour: number;
    credentialingMonths: number;
    recruitRampMonthsCRS: number;
    recruitRampMonthsCRSS: number;
    onboardingCostCRS: number;
    onboardingCostCRSS: number;
    turnoverCostPerDeparture: number;
    turnoverRiskThreshold: number; // Ratio above which turnover risk is high
}

export interface ScenarioOverrides {
    wages?: {
        crs?: number;
        crss?: number;
        supervisor?: number;
    };
    billableRate?: number;
    benefitLoad?: number;
    utilization?: number;
    onboardingCostCRSS?: number;
    turnoverCostPerDeparture?: number;
}

export interface EnabledFactors {
    includeRevenue: boolean;
    includeRetention: boolean;
    includeTransitionCost: boolean;
}

export interface Scenario {
    id: string;
    name: string;
    label?: string;
    description: string;
    frontlineCrsCount: number;
    crssCount: number;
    supervisorFte: number;
    isInternalPromotion: boolean;
    isTieredModel?: boolean;
    overrides?: ScenarioOverrides;
}

export interface ComputedMetrics {
    hardLaborSavings: number; // Only if Revenue is 0
    softValueTotal: number; // Retention + Efficiency (if Revenue > 0)

    netMonthlySteadyStateHard: number; // Hard Cash + Hard Savings
    hardMonthlyCashFlow: number;
    netMonthlySteadyStateSoft: number; // Soft Retention + Soft Efficiency
    netMonthlySteadyStateTotal: number; // Hard + Soft

    netMonthlySteadyState: number; // DEPRECATED: Use netMonthlySteadyStateHard for P&L
    netAnnualSteadyState: number;
    transitionCost: number; // One-time cost (e.g. OT bridge)
    netYearOne: number; // Includes onboarding & ramp
    breakEvenMonths: number;

    // Detailed Components
    totalFte: number;
    freedSupervisorHours: number;
    realizedRevenue: number;
    laborEfficiencySavings: number;
    retentionSavings: number;
    payrollDeltaLoaded: number;
    clinicalHoursRepurposed: number;
    payrollBase: number;
    payrollLoaded: number;

    // Compliance & Risk
    requiredHours: number;
    weightedRequiredHours: number;
    actualSupervisionHours: number;
    effectiveRatio: number;
    complianceStatus: 'OK' | 'Margin' | 'Non-Compliant' | 'High Risk' | 'At Capacity';
    safetyStatus: 'OK' | 'Overloaded';
    riskFactors: string[];
}
