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

console.log("All verifications passed!");
