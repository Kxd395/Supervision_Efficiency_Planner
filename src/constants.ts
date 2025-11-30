import type { GlobalAssumptions, DemandAssumptions, SupervisionRules, HRRiskAssumptions, Scenario } from './types';

export const DEFAULT_GLOBAL_ASSUMPTIONS: GlobalAssumptions = {
    crsBaseHourly: 24.00,
    crssBaseHourly: 28.50,
    supervisorBaseHourly: 45.00,
    benefitLoad: 0.35,
    fteHoursPerMonth: 160,

    grantFundedSlots: 0, // Default: Pure fee-for-service

    supervisorBillableRate: 135, // CBH (Philadelphia) standard for 90837
    supervisorTargetBillableHours: 20,
    utilizationPercent: 0.65, // CBH-typical supervisor productivity
    revenueRealizationPercent: 95,

    peerBillableRate: 55, // CBH (Philadelphia) H0038 @ $13.75/unit
    peerUtilization: 0, // Default: Conservative 0% (can be enabled)

    reinvestmentTask: "Outpatient Counseling"
};

export const DEFAULT_DEMAND_ASSUMPTIONS: DemandAssumptions = {
    activeWaitlist: 10,
    newReferralsPerMonth: 5,
    avgDaysReferralToAuth: 14,
    avgDaysAuthToSession: 7,

    rampUpMonths: 3, // Months for new hire to reach full productivity
    fundingLabel: "Billable" // "Billable", "Grant", or "Hybrid"
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
