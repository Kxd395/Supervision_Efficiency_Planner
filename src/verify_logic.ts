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

// const metricsA = computeScenarioMetrics(scenarioA, global, rules, hr, scenarioA, baselinePayrollLoaded);
const metricsB = computeScenarioMetrics(scenarioB, global, rules, hr, scenarioA, baselinePayrollLoaded);
const metricsC = computeScenarioMetrics(scenarioC, global, rules, hr, scenarioA, baselinePayrollLoaded);

// 4. Assertions

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        throw new Error(`Verification Failed: ${message}`);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

// Check Payroll Delta for B (Should be +1 CRS cost)
// CRS Cost = 24 * 160 = 3840. Loaded (25%) = 4800.
const expectedPayrollDeltaB = 24 * 160 * 1.25;
assert(Math.abs(metricsB.payrollDeltaLoaded - expectedPayrollDeltaB) < 0.01,
    `Scenario B Payroll Delta should be ${expectedPayrollDeltaB}, got ${metricsB.payrollDeltaLoaded}`);

// Check Payroll Delta for C (Promotion)
// Base: 3 CRS. C: 3 CRS + 1 CRSS.
// Delta = (1 CRSS - 0 CRS)?? No, baseline is 3 CRS.
// Wait, Scenario A has 3 CRS. Scenario C has 3 CRS + 1 CRSS.
// So C has 1 MORE staff than A?
// My Scenario C definition above: frontlineCrsCount: 3, crssCount: 1.
// Baseline A: frontlineCrsCount: 3.
// So C is "Add 1 CRSS".
// If it was a promotion from A, A should have had 4 CRS?
// Let's assume A is "Current State" (3 CRS).
// If we Promote, we usually take one of the 3 CRS and make them CRSS.
// So C should be: 2 CRS, 1 CRSS.
// BUT, usually we backfill.
// If we backfill, we have 3 CRS, 1 CRSS. (Net +1 staff).
// Let's test the "Backfill" case (3 CRS, 1 CRSS).
// Cost Delta = 1 CRSS Cost.
// CRSS Cost = 35.5 * 160 * 1.25 = 7100.
const expectedPayrollDeltaC = 35.5 * 160 * 1.25;
assert(Math.abs(metricsC.payrollDeltaLoaded - expectedPayrollDeltaC) < 0.01,
    `Scenario C Payroll Delta should be ${expectedPayrollDeltaC}, got ${metricsC.payrollDeltaLoaded}`);

// Check Revenue for C
// Freed Hours.
// Baseline A: 3 CRS. Required Hours?
// Rules: Medicaid (70% @ 4hrs) + Commercial (30% @ 2hrs).
// Weighted Avg = (0.7 * 4) + (0.3 * 2) = 2.8 + 0.6 = 3.4 hrs/FTE.
// Total Required A = 3 * 3.4 = 10.2 hours.
// Scenario C: 3 CRS. Total Required = 10.2 hours.
// CRSS is present (count=1).
// Logic says: if CRSS > 0, Supervisor Hours Needed = 0.
// So Freed Hours = Baseline Needed (10.2) - Scenario Needed (0) = 10.2.
// Billable Impact:
// Utilization = 85%.
// Realized Hours = 10.2 * 0.85 = 8.67.
// Billable Rate = 150.
// Revenue = 8.67 * 150 = 1300.5.
const expectedRevenueC = 10.2 * 0.85 * 150;
assert(Math.abs(metricsC.realizedRevenue - expectedRevenueC) < 0.01,
    `Scenario C Revenue should be ${expectedRevenueC}, got ${metricsC.realizedRevenue}`);

// Check Net Impact C
// Net = Revenue - Payroll Delta
// Net = 1300.5 - 7100 = -5799.5
const expectedNetC = expectedRevenueC - expectedPayrollDeltaC;
assert(Math.abs(metricsC.netMonthlySteadyState - expectedNetC) < 0.01,
    `Scenario C Net Impact should be ${expectedNetC}, got ${metricsC.netMonthlySteadyState}`);

console.log("All verifications passed!");
