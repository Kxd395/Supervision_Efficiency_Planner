/**
 * REGRESSION CHECKLIST (CFO TRUTH)
 * 
 * 1. Double Dip
 *    - When realizedRevenue > 0, hardLaborSavings must equal 0.
 *    - No change to this rule without rewriting CALCULATIONS and SSOT.
 * 
 * 2. Grants
 *    - Any change to grant logic must keep grants out of revenue.
 *    - Grants can only reduce loaded payroll deltas.
 * 
 * 3. Economic Overlay
 *    - netMonthlySteadyStateHard stays the same with toggle on or off.
 *    - netMonthlySteadyStateHardWithOpportunity equals netHard - opportunityCostMonthly.
 *    - Scenario A Net Economic equals negative opportunityCost when Hard Net is zero.
 * 
 * 4. UI Sync
 *    - Executive Summary bar value for each scenario must match the Net Economic row when the toggle is ON.
 *    - Scenario card Net Monthly Economic must match the same number.
 *    - "Revenue leak" amounts must match the Supervisor Opportunity Cost row in the table.
 */

import { computeScenarioMetrics } from './logic';
import {
    DEFAULT_GLOBAL_ASSUMPTIONS,
    // DEFAULT_DEMAND_ASSUMPTIONS,
    DEFAULT_SUPERVISION_RULES,
    DEFAULT_HR_RISK_ASSUMPTIONS
} from './constants';
import type { Scenario } from './types';

console.log("Starting Verification...");

// 1. Setup Mock Data
const global = { ...DEFAULT_GLOBAL_ASSUMPTIONS };
// const demand = { ...DEFAULT_DEMAND_ASSUMPTIONS };
const rules = { ...DEFAULT_SUPERVISION_RULES };
const hr = { ...DEFAULT_HR_RISK_ASSUMPTIONS };

// 2. Define Scenarios
const scenarioA: Scenario = {
    id: 'A',
    name: 'Scenario A',
    label: 'Scenario A',
    description: 'Baseline',
    frontlineCrsCount: 10,
    crssCount: 0,
    supervisorFte: 1,
    isInternalPromotion: false,
    isTieredModel: false,
};

const scenarioB: Scenario = {
    id: 'B',
    name: 'Scenario B',
    label: 'Scenario B',
    description: 'Optimized',
    frontlineCrsCount: 10,
    crssCount: 1,
    supervisorFte: 1,
    isInternalPromotion: false,
    isTieredModel: false,
};

const scenarioC: Scenario = {
    id: 'C',
    name: 'Scenario C',
    label: 'Scenario C',
    description: 'Tiered',
    frontlineCrsCount: 15,
    crssCount: 2,
    supervisorFte: 1,
    isInternalPromotion: true,
    isTieredModel: true,
};

// 3. Compute Metrics
// 3. Compute Metrics
// Calculate baseline payroll loaded manually for verification
const baselinePayrollLoaded = (
    (scenarioA.frontlineCrsCount * global.crsBaseHourly * global.fteHoursPerMonth) +
    (scenarioA.crssCount * global.crssBaseHourly * global.fteHoursPerMonth) +
    (scenarioA.supervisorFte * global.supervisorBaseHourly * global.fteHoursPerMonth)
) * (1 + global.benefitLoad);

// Default enabled factors for verification
const enabledFactors = {
    includeRevenue: true,
    includeRetention: true,
    includeTransitionCost: true,
    includeOpportunityCost: false
};

// const metricsA = computeScenarioMetrics(scenarioA, global, rules, hr, scenarioA, baselinePayrollLoaded, enabledFactors);
const metricsB = computeScenarioMetrics(scenarioB, global, rules, hr, scenarioA, baselinePayrollLoaded, enabledFactors);
const metricsC = computeScenarioMetrics(scenarioC, global, rules, hr, scenarioA, baselinePayrollLoaded, enabledFactors);

// 4. Assertions

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        throw new Error(`Verification Failed: ${message}`);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

// Check Payroll Delta for B (Should be +1 CRSS cost)
// Scenario B has 1 CRSS, 10 CRS. Scenario A has 0 CRSS, 10 CRS.
// Delta = 1 CRSS.
const expectedPayrollDeltaB = (scenarioB.crssCount * global.crssBaseHourly * global.fteHoursPerMonth) * (1 + global.benefitLoad);
assert(Math.abs(metricsB.payrollDeltaLoaded - expectedPayrollDeltaB) < 0.01,
    `Scenario B Payroll Delta should be ${expectedPayrollDeltaB}, got ${metricsB.payrollDeltaLoaded}`);

// Check Payroll Delta for C (Growth)
// Scenario C has 2 CRSS, 15 CRS. Scenario A has 0 CRSS, 10 CRS.
// Delta = 2 CRSS + 5 CRS.
const deltaCRS = (scenarioC.frontlineCrsCount - scenarioA.frontlineCrsCount) * global.crsBaseHourly * global.fteHoursPerMonth;
const deltaCRSS = (scenarioC.crssCount - scenarioA.crssCount) * global.crssBaseHourly * global.fteHoursPerMonth;
const expectedPayrollDeltaC = (deltaCRS + deltaCRSS) * (1 + global.benefitLoad);

assert(Math.abs(metricsC.payrollDeltaLoaded - expectedPayrollDeltaC) < 0.01,
    `Scenario C Payroll Delta should be ${expectedPayrollDeltaC}, got ${metricsC.payrollDeltaLoaded}`);

// Check Revenue for C
// Freed Hours.
// Baseline Required Hours (what Sup would do if no Tiered Model):
// Indiv: 15 CRS * 2 hrs/staff = 30 hrs.
// Group: 2 hrs (per team).
// Total Required = 32 hrs.

// Actual Supervisor Hours in C (Tiered):
// Rules (Tiered C): Sup Indiv = 1 hr/staff. Sup Group = 0.
// Sup Load = (15 * 1) + (2 CRSS * 1 hr Mgmt) = 17 hrs.

// Freed Hours = Required (32) - Actual (17) = 15 hrs.

// Billable Impact:
// Utilization = 65%.
// Realized Hours = 15 * 0.65 = 9.75.
// Billable Rate = 135.
// Revenue = 9.75 * 135 = 1316.25.

const expectedFreedHoursC = 15;
const expectedRevenueC = expectedFreedHoursC * global.utilizationPercent * global.supervisorBillableRate;

assert(Math.abs(metricsC.realizedRevenue - expectedRevenueC) < 0.01,
    `Scenario C Revenue should be ${expectedRevenueC}, got ${metricsC.realizedRevenue}`);

// Check Net Impact C
// Net = Revenue - Payroll Delta
// Net = 1316.25 - 38232 = -36915.75
const expectedNetC = expectedRevenueC - expectedPayrollDeltaC;
assert(Math.abs(metricsC.netMonthlySteadyState - expectedNetC) < 0.01,
    `Scenario C Net Impact should be ${expectedNetC}, got ${metricsC.netMonthlySteadyState}`);

// 5. Verify Opportunity Cost Baseline (Scenario A)
// When Opportunity Cost is enabled, Scenario A should be negative.

const metricsA_WithOpp = computeScenarioMetrics(scenarioA, global, rules, hr, scenarioA, baselinePayrollLoaded, { ...enabledFactors, includeOpportunityCost: true });

// A. Check Net Hard is still 0 (Cash view shouldn't change)
assert(Math.abs(metricsA_WithOpp.netMonthlySteadyStateHard) < 0.01,
    `Scenario A Net Hard should be 0, got ${metricsA_WithOpp.netMonthlySteadyStateHard}`);

// B. Check Opportunity Cost is calculated
// Sup Load A = (10 CRS * 2) + 2 Group = 22 hours.
// Total Capacity = 1 FTE * 160 = 160 hours.
// Freed = 0.
// Supervision Hours = 160 (Wait, max(0, 160 - 0) = 160? No, logic says supervisionHours = max(0, totalCapacity - freed).
// Freed in A is 0. So supervisionHours is 160.
// BUT, "Supervision Hours" in the overlay context means "Hours NOT freed", i.e. the full capacity?
// Let's check logic.ts:
// const supervisionHours = Math.max(0, totalDirectorCapacity - freedSupervisorHours);
// Yes, if freed is 0, supervisionHours is 160.
// Opportunity Cost = 160 * Util(0.75) * Rate(150) = 120 * 150 = 18,000.

const expectedOppCostA = 160 * global.utilizationPercent * global.supervisorBillableRate;
assert(Math.abs(metricsA_WithOpp.opportunityCostMonthly - expectedOppCostA) < 0.01,
    `Scenario A Opportunity Cost should be ${expectedOppCostA}, got ${metricsA_WithOpp.opportunityCostMonthly}`);

// C. Check Net Economic is negative
const expectedNetEconomicA = 0 - expectedOppCostA;
assert(Math.abs(metricsA_WithOpp.netMonthlySteadyStateHardWithOpportunity - expectedNetEconomicA) < 0.01,
    `Scenario A Net Economic should be ${expectedNetEconomicA}, got ${metricsA_WithOpp.netMonthlySteadyStateHardWithOpportunity}`);

// 6. Verify Double Dip Protection
// Rule: If Realized Revenue > 0, Hard Labor Savings must be 0.
assert(metricsC.realizedRevenue > 0, "Scenario C should have revenue");
assert(metricsC.hardLaborSavings === 0,
    `Scenario C Hard Labor Savings should be 0 because it has revenue, got ${metricsC.hardLaborSavings}`);

// 7. Verify Grant Shield Behavior
// Create a scenario with Grant Slots
const globalWithGrant = { ...global, grantSlotsCRSS: 1 };
const metricsB_Grant = computeScenarioMetrics(scenarioB, globalWithGrant, rules, hr, scenarioA, baselinePayrollLoaded, enabledFactors);

// A. Revenue should be unchanged (Grant doesn't create revenue)
// Scenario B has 0 revenue normally (no freed hours in this simple test setup? Wait, B has 1 CRSS but does it free hours?
// In B, Sup Load = (10*1) + 2 + (1*1) = 13. Baseline = 22. Freed = 9.
// So B DOES have revenue.
// Let's compare B_Grant revenue to B revenue.
assert(Math.abs(metricsB_Grant.realizedRevenue - metricsB.realizedRevenue) < 0.01,
    `Grant should not affect Revenue. Normal: ${metricsB.realizedRevenue}, Grant: ${metricsB_Grant.realizedRevenue}`);

// B. Net Hard should improve by exactly the Grant Savings
// Grant Savings = 1 CRSS * Rate * Load
const expectedGrantSavings = 1 * global.crssBaseHourly * global.fteHoursPerMonth * (1 + global.benefitLoad);
const netImprovement = metricsB_Grant.netMonthlySteadyStateHard - metricsB.netMonthlySteadyStateHard;

assert(Math.abs(netImprovement - expectedGrantSavings) < 0.01,
    `Grant should improve Net Hard by ${expectedGrantSavings}, got ${netImprovement}`);

console.log("All verifications passed!");
