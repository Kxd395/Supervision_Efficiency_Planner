import type { GlobalAssumptions, DemandAssumptions, SupervisionRules, HRRiskAssumptions, Scenario } from './types';

export const DEFAULT_GLOBAL_ASSUMPTIONS: GlobalAssumptions = {
    crsBaseHourly: 24.00,
    crssBaseHourly: 28.50,
    supervisorBaseHourly: 45.00,
    benefitLoad: 0.35,
    fteHoursPerMonth: 160,
    supervisorBillableRate: 150,
    supervisorTargetBillableHours: 20,
    utilizationPercent: 0.75,
    revenueRealizationPercent: 95,
    reinvestmentTask: "Outpatient Counseling"
};

export const DEFAULT_DEMAND_ASSUMPTIONS: DemandAssumptions = {
    currentSupervisorBillableHours: 5,
    maxBillableHoursPerFTE: 25,
    activeWaitlist: 10,
    newReferralsPerMonth: 5,
    avgDaysReferralToAuth: 14,
    avgDaysAuthToSession: 7,
    utilizationCap: 40,
    rampMonths: 6,
    fundingSource: 'Billable'
};

export const DEFAULT_SUPERVISION_RULES: SupervisionRules = {
    baselineIndivHrsPerStaff: 2,
    baselineGroupHrsPerTeam: 2,
    // B. Split Configurations
    tieredB: {
        supervisorIndivPerStaff: 1, // Retained by Sup
        crssIndivPerStaff: 1,       // Delegated to CRSS
        supervisorGroupOnly: 0,     // Sup Group
        groupCrssOnly: 2,           // CRSS Group
        groupCoFacilitated: 0,      // Shared
        crssSupervisionHrs: 1       // Mgmt Overhead
    },
    tieredC: {
        supervisorIndivPerStaff: 1, // Retained by Sup
        crssIndivPerStaff: 1,       // Delegated to CRSS
        supervisorGroupOnly: 0,     // Sup Group
        groupCrssOnly: 2,           // CRSS Group
        groupCoFacilitated: 0,      // Shared
        crssSupervisionHrs: 1       // Mgmt Overhead
    },
    internalMaxRatio: 5
};

export const DEFAULT_SCENARIOS: Record<string, Scenario> = {
    A: {
        id: 'A',
        name: 'Baseline',
        label: 'Current State',
        description: 'Current staffing model with Clinical Supervisor providing all supervision.',
        frontlineCrsCount: 3, // Prompt implied Baseline is 3 CRS? "Scenario A (Baseline): 3 Frontline CRS, 0 CRSS." in SSOT.
        crssCount: 0,
        supervisorFte: 1.0,
        isInternalPromotion: false
    },
    B: {
        id: 'B',
        name: 'Internal Promotion',
        label: 'Headcount Neutral',
        description: 'Promote 1 CRS to CRSS. Total staff count remains constant.',
        frontlineCrsCount: 2,
        crssCount: 1,
        supervisorFte: 1.0,
        isInternalPromotion: true,
        isTieredModel: true
    },
    C: {
        id: 'C',
        name: 'External Hire',
        label: 'Growth Model',
        description: 'Hire 1 new CRSS externally. Total staff count increases.',
        frontlineCrsCount: 3,
        crssCount: 1,
        supervisorFte: 1.0,
        isInternalPromotion: false,
        isTieredModel: true
    }
};

export const DEFAULT_HR_RISK_ASSUMPTIONS: HRRiskAssumptions = {
    promotionRaisePerHour: 2.0,
    credentialingMonths: 3,
    recruitRampMonthsCRS: 1,
    recruitRampMonthsCRSS: 3,
    onboardingCostCRS: 2500,
    onboardingCostCRSS: 5000,
    turnoverCostPerDeparture: 5000,
    turnoverRiskThreshold: 6, // Ratio > 6 triggers turnover risk
};
