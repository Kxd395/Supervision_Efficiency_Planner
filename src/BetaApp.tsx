import React, { useState, useMemo, useEffect } from "react";

type ScenarioKey = "A" | "B" | "C";

type Config = {
    currentIndivPerCrsClinical: number;
    currentGroupsClinical: number;
    crssModelIndivPerCrsClinical: number;
    crssModelIndivPerCrsCrss: number;
    crssModelGroupsBoth: number;
    crssModelGroupsCrssOnly: number;
    crssModelClinicalPerCrss: number;
    crssCapacity: number; // Max CRS per CRSS
};





type GlobalAssumptions = {
    // Wages
    crsBaseWage: number;
    crssBaseWage: number;
    clinicalBaseWage: number;
    fteHoursPerMonth: number;
    benefitLoad: number; // 0-1

    // Billable Economics
    supervisorBillableRate: number;
    supervisorTargetBillableHours: number;
    globalUtilization: number; // 0-1

    // Operational
    rampUpMonthsCRSS: number;
    rampUpMonthsCRS: number;
    onboardingCost: number;
    promotionRaise: number;
    timeHorizonMonths: number;
    turnoverRisk: 'Low' | 'Medium' | 'High';
    auditRisk: 'Low' | 'Medium' | 'High';
};

type ScenarioOverrides = {
    wages?: {
        crs?: number;
        crss?: number;
        supervisor?: number;
    };
    billable?: {
        rate?: number;
        utilization?: number;
    };
};



type Scenario = {
    label: string;
    frontlineCrs: number;
    crssCount: number;
    isPromotion?: boolean; // Only for Scenario C
    overrides?: ScenarioOverrides;
};

type ComputedScenario = {
    clinicalHours: number;
    crssHours: number;

    // Costs & Revenue
    clinicalLaborCost: number;
    lostRevenue: number;
    hoursDelta: number;

    // Staffing Impact
    payrollImpact: number;

    // Comparison
    netMonthlyBenefit: number | null;
    isCapacityWarning: boolean;

    // Advanced Metrics
    fullyLoadedPayroll?: number;
    realizedRevenue?: number;
    netAnnualImpact?: number; // Steady State
    netImpactYear1?: number; // Including Ramp/Onboarding

    // Billable Details
    realizedBillableHours?: number;
    realizationPercent?: number;

    // Compliance
    complianceStatus?: 'OK' | 'At Risk' | 'Fails';
    riskRating?: 'Low' | 'Medium' | 'High';
};

// --- Components ---

const HelpTooltip: React.FC<{ text: string; label?: string }> = ({
    text,
    label,
}) => (
    <span className="group relative inline-block cursor-help ml-1">
        <span className="border-b border-dotted border-slate-400">
            {label || "(?)"}
        </span>
        <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs rounded p-2 z-10 shadow-lg text-center">
            {text}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
        </span>
    </span>
);

// --- Logic ---

function computeScenarioHours(
    key: ScenarioKey,
    scenario: Scenario,
    config: Config
): { clinicalHours: number; crssHours: number } {
    const { frontlineCrs, crssCount } = scenario;

    if (key === "A" || key === "B") {
        const clinical =
            frontlineCrs * config.currentIndivPerCrsClinical +
            config.currentGroupsClinical;
        return { clinicalHours: clinical, crssHours: 0 };
    }

    // Scenario C: CRSS model
    const clinical =
        frontlineCrs * config.crssModelIndivPerCrsClinical +
        config.crssModelGroupsBoth +
        crssCount * config.crssModelClinicalPerCrss;

    const crss =
        frontlineCrs * config.crssModelIndivPerCrsCrss +
        config.crssModelGroupsBoth +
        config.crssModelGroupsCrssOnly;

    return { clinicalHours: clinical, crssHours: crss };
}

function computeScenarioCosts(
    key: ScenarioKey,
    scenario: Scenario,
    baseScenario: Scenario,
    config: Config,
    global: GlobalAssumptions,
    isAdvancedMode: boolean
): ComputedScenario {
    const hours = computeScenarioHours(key, scenario, config);

    // 1. Determine Rates (Override > Global)
    const wages = {
        crs: scenario.overrides?.wages?.crs ?? global.crsBaseWage,
        crss: scenario.overrides?.wages?.crss ?? global.crssBaseWage,
        supervisor: scenario.overrides?.wages?.supervisor ?? global.clinicalBaseWage,
    };

    const billable = {
        rate: scenario.overrides?.billable?.rate ?? global.supervisorBillableRate,
        utilization: scenario.overrides?.billable?.utilization ?? global.globalUtilization,
    };

    // 2. Clinical Supervision Impact
    const clinicalLaborCost = hours.clinicalHours * wages.supervisor;

    // Lost Revenue (Opportunity Cost) - What we COULD have billed
    // Note: This is "Gross Opportunity", realized revenue logic is below
    const lostRevenue = hours.clinicalHours * billable.rate;

    // 3. Payroll Calculation
    // We calculate the FULL payroll for this scenario to compare against the Base.
    const totalPayroll =
        (scenario.frontlineCrs * wages.crs * global.fteHoursPerMonth) +
        (scenario.crssCount * wages.crss * global.fteHoursPerMonth);

    // Base Payroll (using Base Scenario counts but CURRENT Scenario rates for fair comparison? 
    // No, usually we compare against "Status Quo" which might imply global rates. 
    // Let's assume Base uses Global rates unless it has its own overrides.)
    const baseWages = {
        crs: baseScenario.overrides?.wages?.crs ?? global.crsBaseWage,
        crss: baseScenario.overrides?.wages?.crss ?? global.crssBaseWage,
    };

    const baseTotalPayroll =
        (baseScenario.frontlineCrs * baseWages.crs * global.fteHoursPerMonth) +
        (baseScenario.crssCount * baseWages.crss * global.fteHoursPerMonth);

    const payrollImpact = totalPayroll - baseTotalPayroll;

    // 4. Revenue Impact (Change in Billable Revenue)
    // We need to calculate "Freed Hours" explicitly
    const baseScenarioKeyForHours = key === "C" ? "B" : "A";
    const baseHours = computeScenarioHours(baseScenarioKeyForHours, baseScenario, config);

    const hoursDelta = baseHours.clinicalHours - hours.clinicalHours; // Positive = Hours Freed

    // Realized Revenue Logic
    // If hoursDelta > 0 (We freed up time), we apply utilization
    // If hoursDelta < 0 (We used more time), we lose revenue at 100% (or utilization? usually 100% of opportunity is lost)
    // Let's stick to the user's request: "Freed Hours * Realization % * Rate"

    let realizedRevenueChange = 0;
    let realizedBillableHours = 0;

    if (hoursDelta > 0) {
        realizedBillableHours = hoursDelta * billable.utilization;
        realizedRevenueChange = realizedBillableHours * billable.rate;
    } else {
        // If we are consuming MORE hours (e.g. Scenario A vs B if B was worse), it's a direct loss
        // But usually we compare B (Hire) vs A (Status Quo). B has 0 clinical hours, A has X.
        // Delta = X - 0 = X freed hours.
        realizedBillableHours = hoursDelta * billable.utilization; // Can be negative? 
        // If negative, it means we are taking time AWAY from billing. That is usually 100% lost opportunity.
        // For simplicity and symmetry, let's apply utilization to "New Billable Hours" concept.
        // If I lose 10 hours of supervision time, I can bill 10 * utilization hours? 
        // Yes, "Target Billable Hours" implies not every hour is billable.
        realizedRevenueChange = hoursDelta * billable.utilization * billable.rate;
    }

    // 5. Net Monthly Benefit
    const netMonthlyBenefit = realizedRevenueChange - payrollImpact;

    // Capacity Check
    const isCapacityWarning =
        scenario.crssCount > 0 &&
        scenario.frontlineCrs / scenario.crssCount > config.crssCapacity;

    // --- Advanced Metrics (Year 1 vs Steady State) ---
    let fullyLoadedPayroll = 0;
    let netAnnualImpact = 0; // Steady State
    let netImpactYear1 = 0;
    let complianceStatus: 'OK' | 'At Risk' | 'Fails' = 'OK';
    let riskRating: 'Low' | 'Medium' | 'High' = 'Low';

    if (isAdvancedMode) {
        const loadMultiplier = 1 + global.benefitLoad;
        fullyLoadedPayroll = totalPayroll * loadMultiplier;
        const baseFullyLoaded = baseTotalPayroll * loadMultiplier;

        // Annualized Deltas
        const revenueDeltaAnnual = realizedRevenueChange * 12;
        const payrollDeltaAnnual = (fullyLoadedPayroll - baseFullyLoaded) * 12;

        // Steady State Impact
        netAnnualImpact = revenueDeltaAnnual - payrollDeltaAnnual;

        // One-time Costs (Year 1 only)
        let oneTimeCosts = 0;

        // Onboarding
        if (key === 'B' || (key === 'C' && !scenario.isPromotion)) {
            oneTimeCosts += global.onboardingCost;
        }

        // Ramp Up Lag
        // Cost = (Monthly Revenue * Ramp Months) - (But we are paying them full salary?)
        // Actually, Ramp Up usually means "Paying for CRSS but they aren't fully effective yet" 
        // OR "Paying for CRS but they aren't full caseload".
        // User said: "Months to Credential / Fully Ramp a New CRSS".
        // During ramp up, we pay the CRSS but maybe don't get the efficiency?
        // Let's model it as: We pay the Payroll Delta immediately, but the Revenue Delta lags.
        // So we "lose" the Revenue Delta for X months.
        const rampMonths = key === 'C' ? global.rampUpMonthsCRSS : global.rampUpMonthsCRS;
        const rampCost = realizedRevenueChange * rampMonths; // Lost revenue during ramp

        oneTimeCosts += rampCost;

        netImpactYear1 = netAnnualImpact - oneTimeCosts;

        // Risk & Compliance
        if (isCapacityWarning) riskRating = 'High';
        else if (scenario.frontlineCrs / (scenario.crssCount || 1) > 6) riskRating = 'Medium';
        else if (global.turnoverRisk === 'High') riskRating = 'High'; // Manual override logic could go here

        if (scenario.frontlineCrs / (scenario.crssCount || 1) > 8) complianceStatus = 'Fails';
        else if (scenario.frontlineCrs / (scenario.crssCount || 1) > 6) complianceStatus = 'At Risk';
    }

    return {
        clinicalHours: hours.clinicalHours,
        crssHours: hours.crssHours,
        clinicalLaborCost,
        lostRevenue,
        hoursDelta,
        payrollImpact,
        netMonthlyBenefit,
        isCapacityWarning,
        fullyLoadedPayroll,
        realizedRevenue: realizedRevenueChange, // This is actually the DELTA revenue now
        netAnnualImpact,
        netImpactYear1,
        realizedBillableHours,
        realizationPercent: billable.utilization,
        complianceStatus,
        riskRating,
    };
}

const App: React.FC = () => {
    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    // Global Assumptions State
    const [globalAssumptions, setGlobalAssumptions] = useState<GlobalAssumptions>({
        crsBaseWage: 24,
        crssBaseWage: 35.5,
        clinicalBaseWage: 60,
        fteHoursPerMonth: 160,
        benefitLoad: 0.34,
        supervisorBillableRate: 150,
        supervisorTargetBillableHours: 100, // Default guess
        globalUtilization: 0.85, // 85% of freed hours become billable
        rampUpMonthsCRSS: 3,
        rampUpMonthsCRS: 2,
        onboardingCost: 2000,
        promotionRaise: 5.00,
        timeHorizonMonths: 12,
        turnoverRisk: 'Medium',
        auditRisk: 'Low',
    });

    // Apply theme class
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [isDarkMode]);

    // Scenarios
    const [scenarios, setScenarios] = useState<Record<ScenarioKey, Scenario>>({
        A: { label: "Scenario A: Current", frontlineCrs: 3, crssCount: 0 },
        B: {
            label: "Scenario B: Hire CRS only",
            frontlineCrs: 4,
            crssCount: 0,
        },
        C: {
            label: "Scenario C: Promote + Hire",
            frontlineCrs: 3,
            crssCount: 1,
            isPromotion: true,
        },
    });

    // Config block
    const [config, setConfig] = useState<Config>({
        currentIndivPerCrsClinical: 3,
        currentGroupsClinical: 1,
        crssModelIndivPerCrsClinical: 1,
        crssModelIndivPerCrsCrss: 1,
        crssModelGroupsBoth: 0,
        crssModelGroupsCrssOnly: 1,
        crssModelClinicalPerCrss: 1,
        crssCapacity: 5,
    });







    const computedScenarios = useMemo(() => {
        // A vs A (Baseline)
        const compA = computeScenarioCosts("A", scenarios.A, scenarios.A, config, globalAssumptions, isAdvancedMode);
        // B vs A
        const compB = computeScenarioCosts("B", scenarios.B, scenarios.A, config, globalAssumptions, isAdvancedMode);
        // C vs B (Growth Choice)
        const compC = computeScenarioCosts("C", scenarios.C, scenarios.B, config, globalAssumptions, isAdvancedMode);

        return { A: compA, B: compB, C: compC };
    }, [scenarios, config, globalAssumptions, isAdvancedMode]);

    // Helper to format money
    const formatMoney = (val: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(val);

    const formatNumber = (val: number) =>
        new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(val);

    const formatDelta = (val: number | null) => {
        if (val === null) return "-";
        const sign = val >= 0 ? "+" : "";
        return `${sign}${formatMoney(val)}`;
    };

    const handleScenarioChange = (
        key: ScenarioKey,
        field: keyof Scenario,
        value: any
    ) => {
        setScenarios((prev) => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }));
    };

    const handleOverrideChange = (
        key: ScenarioKey,
        category: 'wages' | 'billable',
        field: string,
        value: number | undefined
    ) => {
        setScenarios((prev) => {
            const scenario = prev[key];
            const currentOverrides = scenario.overrides || {};
            const categoryOverrides = currentOverrides[category] || {};

            return {
                ...prev,
                [key]: {
                    ...scenario,
                    overrides: {
                        ...currentOverrides,
                        [category]: {
                            ...categoryOverrides,
                            [field]: value
                        }
                    }
                }
            };
        });
    };

    const handleConfigChange = (field: keyof Config, value: number) => {
        setConfig((prev) => ({ ...prev, [field]: value }));
    };







    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 p-4 transition-colors duration-300">
            <div className={`max-w-6xl mx-auto space-y-6 ${isAdvancedMode ? "pb-32" : ""}`}>
                <header className="bg-white rounded-xl shadow p-4 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            {isAdvancedMode ? "Supervision Efficiency & Staffing Planner" : "Supervision Efficiency Planner"}
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-2xl">
                            {isAdvancedMode
                                ? "Compare the true financial, operational, and compliance impact of different supervision models, including benefits load, ramp up time, payer rules, and growth."
                                : "Compare the Revenue Opportunity of freeing up clinical hours vs the Cost of hiring/promoting a CRSS."
                            }
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                            className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${isAdvancedMode
                                ? "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500"
                                : "bg-slate-700 hover:bg-slate-600 border-slate-600"
                                }`}
                        >
                            {isAdvancedMode ? "Advanced Mode: ON" : "Advanced Mode: OFF"}
                        </button>
                        <button
                            onClick={() => setShowInstructions(!showInstructions)}
                            className="text-sm px-3 py-1 rounded border hover:bg-slate-50"
                        >
                            {showInstructions ? "Hide Guide" : "Show Guide"}
                        </button>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="text-sm px-3 py-1 rounded border hover:bg-slate-50"
                        >
                            {isDarkMode ? "Light Mode" : "Dark Mode"}
                        </button>
                    </div>
                </header>

                {showInstructions && (
                    <section className="bg-white rounded-xl shadow p-4 text-sm space-y-2 border-l-4 border-indigo-500">
                        <h3 className="font-bold text-lg">How to use this planner</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                            <li>
                                <strong>Goal:</strong> Determine if the revenue gained from the Clinical Supervisor seeing clients (instead of supervising) offsets the cost of a CRSS.
                            </li>
                            <li>
                                <strong>Billable Rate:</strong> Enter the hourly revenue the Clinical Supervisor generates when seeing clients.
                            </li>
                            <li>
                                <strong>Staff Counts:</strong> Enter the <em>actual</em> number of staff you will have in each scenario.
                                <br />
                                <em>Example:</em> If you promote 1 CRS to CRSS and don't replace them, reduce the CRS count by 1. If you replace them, keep the CRS count the same.
                            </li>
                            <li>
                                <strong>Payroll Impact:</strong> The tool automatically calculates the cost difference (Raise vs New Hire) based on your staff counts.
                            </li>
                        </ul>
                    </section>
                )}

                {!isAdvancedMode && (
                    <section className="bg-white rounded-xl shadow p-4 flex items-center justify-between border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <span className="text-xl font-bold">$</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">Supervisor Billable Rate</h3>
                                <p className="text-xs text-slate-500">Hourly revenue generated when seeing clients</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium">$</span>
                            <input
                                type="number"
                                value={globalAssumptions.supervisorBillableRate}
                                onChange={(e) => setGlobalAssumptions({ ...globalAssumptions, supervisorBillableRate: Number(e.target.value) })}
                                className="w-24 border rounded-lg px-3 py-2 text-right font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <span className="text-slate-400 font-medium">/hr</span>
                        </div>
                    </section>
                )}

                {isAdvancedMode && (
                    <>
                        {/* Financial Baselines */}
                        <section className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="text-2xl">💰</span> Financial Baselines
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-600 border-b border-slate-200 pb-1">Base Wages (Hourly)</h3>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>CRS Wage</span>
                                        <input type="number" value={globalAssumptions.crsBaseWage} onChange={e => setGlobalAssumptions({ ...globalAssumptions, crsBaseWage: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>CRSS Wage</span>
                                        <input type="number" value={globalAssumptions.crssBaseWage} onChange={e => setGlobalAssumptions({ ...globalAssumptions, crssBaseWage: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>Supervisor Wage</span>
                                        <input type="number" value={globalAssumptions.clinicalBaseWage} onChange={e => setGlobalAssumptions({ ...globalAssumptions, clinicalBaseWage: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-600 border-b border-slate-200 pb-1">Billable Economics</h3>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>Billable Rate</span>
                                        <input type="number" value={globalAssumptions.supervisorBillableRate} onChange={e => setGlobalAssumptions({ ...globalAssumptions, supervisorBillableRate: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>Target Hours/Mo</span>
                                        <input type="number" value={globalAssumptions.supervisorTargetBillableHours} onChange={e => setGlobalAssumptions({ ...globalAssumptions, supervisorTargetBillableHours: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>Realization %</span>
                                        <div className="flex items-center gap-1">
                                            <input type="number" value={Math.round(globalAssumptions.globalUtilization * 100)} onChange={e => setGlobalAssumptions({ ...globalAssumptions, globalUtilization: Number(e.target.value) / 100 })} className="w-16 border rounded px-2 py-1 text-right" />
                                            <span className="text-slate-500">%</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Supervision Rules */}
                        <section className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="text-2xl">📋</span> Supervision Rules
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-600 border-b border-slate-200 pb-1">Current Model (Scenario A/B)</h3>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>Clinical Hrs per CRS</span>
                                        <input type="number" step="0.1" value={config.currentIndivPerCrsClinical} onChange={e => handleConfigChange('currentIndivPerCrsClinical', Number(e.target.value))} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>Group Hrs (Total)</span>
                                        <input type="number" step="0.1" value={config.currentGroupsClinical} onChange={e => handleConfigChange('currentGroupsClinical', Number(e.target.value))} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-600 border-b border-slate-200 pb-1">CRSS Model (Scenario C)</h3>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>Clinical Hrs per CRS</span>
                                        <input type="number" step="0.1" value={config.crssModelIndivPerCrsClinical} onChange={e => handleConfigChange('crssModelIndivPerCrsClinical', Number(e.target.value))} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>CRSS Hrs per CRS</span>
                                        <input type="number" step="0.1" value={config.crssModelIndivPerCrsCrss} onChange={e => handleConfigChange('crssModelIndivPerCrsCrss', Number(e.target.value))} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span>Clinical Hrs per CRSS</span>
                                        <input type="number" step="0.1" value={config.crssModelClinicalPerCrss} onChange={e => handleConfigChange('crssModelClinicalPerCrss', Number(e.target.value))} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                </div>
                            </div>

                            {/* Capacity Slider moved here */}
                            <div className="bg-slate-200/50 p-4 rounded-lg border border-slate-300 space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-slate-700 font-medium">Internal Max Ratio (CRS:CRSS)</span>
                                        <span className="text-slate-900 font-mono font-bold">1:{config.crssCapacity}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="10"
                                        step="1"
                                        className="w-full h-2 bg-slate-400 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        value={config.crssCapacity}
                                        onChange={(e) => handleConfigChange("crssCapacity", Number(e.target.value))}
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>Safe (3:1)</span>
                                        <span>Risky (10:1)</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
                                    <strong>Risk Rule:</strong> Ratios above 1:6 increase turnover risk by <strong>High</strong> factor.
                                    Ratios above 1:8 are considered <strong>Unsafe</strong>.
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* HR & Risk Factors (Advanced Mode Only) */}
                {isAdvancedMode && (
                    <section className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="text-2xl">⚙️</span> Operational & Risk Factors
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Staffing & Ramp Up */}
                            <div className="space-y-4">
                                <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">
                                    Staffing & Operational
                                </h3>
                                <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <label className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">FTE Hours / Month</span>
                                        <input type="number" value={globalAssumptions.fteHoursPerMonth} onChange={e => setGlobalAssumptions({ ...globalAssumptions, fteHoursPerMonth: Number(e.target.value) })} className="w-20 border rounded px-2 py-1 text-right" />
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Benefit Load</span>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={Math.round(globalAssumptions.benefitLoad * 100)} onChange={e => setGlobalAssumptions({ ...globalAssumptions, benefitLoad: Number(e.target.value) / 100 })} className="w-16 border rounded px-2 py-1 text-right" />
                                            <span className="text-slate-500">%</span>
                                        </div>
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Ramp Up (CRS)</span>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={globalAssumptions.rampUpMonthsCRS} onChange={e => setGlobalAssumptions({ ...globalAssumptions, rampUpMonthsCRS: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 text-right" />
                                            <span className="text-slate-500">mo</span>
                                        </div>
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Ramp Up (CRSS)</span>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={globalAssumptions.rampUpMonthsCRSS} onChange={e => setGlobalAssumptions({ ...globalAssumptions, rampUpMonthsCRSS: Number(e.target.value) })} className="w-16 border rounded px-2 py-1 text-right" />
                                            <span className="text-slate-500">mo</span>
                                        </div>
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Typical Promotion Raise</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={globalAssumptions.promotionRaise}
                                                onChange={(e) => setGlobalAssumptions({ ...globalAssumptions, promotionRaise: Number(e.target.value) })}
                                                className="w-16 border rounded px-2 py-1 text-right"
                                            />
                                            <span className="text-slate-500">%</span>
                                        </div>
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Onboarding Cost (One-time)</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">$</span>
                                            <input
                                                type="number"
                                                value={globalAssumptions.onboardingCost}
                                                onChange={(e) => setGlobalAssumptions({ ...globalAssumptions, onboardingCost: Number(e.target.value) })}
                                                className="w-20 border rounded px-2 py-1 text-right"
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Operational Risk Profile */}
                            <div className="space-y-4">
                                <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">
                                    Operational Risk Profile
                                </h3>
                                <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <label className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Turnover Risk</span>
                                        <select
                                            value={globalAssumptions.turnoverRisk}
                                            onChange={(e) => setGlobalAssumptions({ ...globalAssumptions, turnoverRisk: e.target.value as any })}
                                            className="border rounded px-2 py-1 text-slate-700 bg-white"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </label>
                                    <label className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Audit Risk</span>
                                        <select
                                            value={globalAssumptions.auditRisk}
                                            onChange={(e) => setGlobalAssumptions({ ...globalAssumptions, auditRisk: e.target.value as any })}
                                            className="border rounded px-2 py-1 text-slate-700 bg-white"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Scenario inputs */}
                <section className="grid md:grid-cols-3 gap-4">
                    {(Object.keys(scenarios) as ScenarioKey[]).map((key) => {
                        const s = scenarios[key];
                        const comp = computedScenarios[key];
                        return (
                            <div
                                key={key}
                                className={`bg-white rounded-xl shadow p-4 space-y-3 relative ${comp.isCapacityWarning ? "ring-2 ring-rose-500" : ""
                                    }`}
                            >
                                <h2 className="font-semibold text-lg">{s.label}</h2>
                                <div className="space-y-2 text-sm">
                                    <label className="flex justify-between items-center">
                                        <span>Frontline CRS (Count)</span>
                                        <input
                                            type="number"
                                            className="w-20 border rounded px-2 py-1 text-right"
                                            value={s.frontlineCrs}
                                            min={0}
                                            onChange={(e) =>
                                                handleScenarioChange(
                                                    key,
                                                    "frontlineCrs",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </label>
                                    <label className="flex justify-between items-center">
                                        <span>CRSS (Count)</span>
                                        <input
                                            type="number"
                                            className="w-20 border rounded px-2 py-1 text-right"
                                            value={s.crssCount}
                                            min={0}
                                            onChange={(e) =>
                                                handleScenarioChange(
                                                    key,
                                                    "crssCount",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </label>
                                    {key === "C" && (
                                        <label className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                                            <span className="text-sm text-slate-600 flex items-center gap-1">
                                                Internal Promotion?
                                                <HelpTooltip text="Checked: You are promoting an existing CRS (Cost = Raise). Unchecked: You are hiring a new external CRSS (Cost = Full Premium)." />
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded bg-slate-100 border-slate-300 text-indigo-500 focus:ring-indigo-500"
                                                checked={s.isPromotion ?? true}
                                                onChange={(e) =>
                                                    handleScenarioChange(key, "isPromotion", e.target.checked)
                                                }
                                            />
                                        </label>
                                    )}
                                </div>

                                {comp.isCapacityWarning && (
                                    <div className="bg-rose-50 text-rose-700 text-xs p-2 rounded border border-rose-200">
                                        <strong>Warning:</strong> Ratio exceeds capacity of{" "}
                                        {config.crssCapacity} CRS per CRSS.
                                    </div>
                                )}

                                <div className="border-t pt-2 mt-2 text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="flex items-center">
                                            Clinical hours needed
                                            <HelpTooltip text="Total hours of clinical supervision required based on staff count and ratios." />
                                        </span>
                                        <span className="font-semibold">
                                            {formatNumber(comp.clinicalHours)}
                                        </span>
                                    </div>
                                    {comp.crssHours > 0 && (
                                        <div className="flex justify-between text-slate-600">
                                            <span className="flex items-center">
                                                CRSS hours needed
                                                <HelpTooltip text="Total hours of CRSS supervision required based on staff count and ratios." />
                                            </span>
                                            <span className="font-semibold">
                                                {formatNumber(comp.crssHours)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Supervisor Time Impact Breakdown */}
                                    <div className="bg-slate-50 border border-slate-200 rounded p-2 my-2 text-sm space-y-2">
                                        <div className="font-medium text-slate-700 border-b border-slate-200 pb-1 mb-1">
                                            Supervisor Time Impact
                                        </div>

                                        {/* Direct Labor */}
                                        <div>
                                            <div className="flex justify-between text-slate-600 text-xs">
                                                <span>Direct Labor (Hourly)</span>
                                                <span>{formatMoney(comp.clinicalLaborCost)}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                                <span>{formatNumber(comp.clinicalHours)} hrs × {formatMoney(globalAssumptions.clinicalBaseWage)}/hr</span>
                                                <span>= {formatMoney(comp.clinicalLaborCost)}</span>
                                            </div>
                                        </div>

                                        {/* Opportunity Cost */}
                                        <div>
                                            <div className="flex justify-between text-amber-700 text-xs font-medium">
                                                <span className="flex items-center gap-1">
                                                    Lost Revenue (Billable)
                                                    <HelpTooltip text="Opportunity Cost: Money lost because Supervisor is supervising instead of billing." />
                                                </span>
                                                <span>{formatMoney(comp.lostRevenue)}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-amber-600 font-mono">
                                                <span>{formatNumber(comp.clinicalHours)} hrs × {formatMoney(globalAssumptions.supervisorBillableRate)}/hr</span>
                                                <span>= {formatMoney(comp.lostRevenue)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payroll Impact */}
                                    {key !== "A" && (
                                        <div className="flex justify-between text-slate-500">
                                            <span className="flex items-center">
                                                Payroll Impact
                                                <HelpTooltip text="Additional cost of CRSS wages compared to standard CRS wages. (CRSS Count × Wage Difference)." />
                                            </span>
                                            <span>{formatDelta(comp.payrollImpact)}</span>
                                        </div>
                                    )}
                                    {key !== "A" && (
                                        <div className="text-[10px] text-slate-500 text-right -mt-1 font-mono">
                                            {key === "B" && `(+1 CRS FTE)`}
                                            {key === "C" && (s.isPromotion ? `(CRSS Raise)` : `(CRSS Premium)`)}
                                        </div>
                                    )}

                                    {key !== "A" && (
                                        <div className="bg-slate-50 p-2 rounded mt-2 space-y-2">
                                            <div className="flex justify-between text-xs font-medium uppercase text-slate-500 border-b border-slate-200 pb-1">
                                                Net Business Result {key === 'C' ? '(vs Scenario B)' : '(vs Scenario A)'}
                                            </div>

                                            {/* Breakdown */}
                                            <div className="space-y-1 text-xs text-slate-500 font-mono">
                                                <div className="flex justify-between">
                                                    <span className="flex items-center">
                                                        Revenue Impact
                                                        <HelpTooltip text={`Change in Billable Revenue vs ${key === 'C' ? 'Scenario B' : 'Scenario A'}.Positive = Gained Revenue.Negative = Lost Revenue.`} />
                                                    </span>
                                                    <span className={(comp.realizedRevenue ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}>
                                                        {formatDelta(comp.realizedRevenue ?? 0)}
                                                        <span className="text-slate-400 ml-1 text-[10px]">
                                                            ({comp.hoursDelta > 0 ? "+" : ""}{formatNumber(comp.hoursDelta)} hrs)
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Extra Payroll:</span>
                                                    <span className="text-rose-600">- {formatMoney(comp.payrollImpact)}</span>
                                                </div>
                                                <div className="border-t border-slate-200 my-1"></div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="flex items-center">
                                                    Net Monthly Benefit
                                                    <HelpTooltip text={`Revenue Recovered minus Extra Payroll Cost. (Compared to ${key === 'C' ? 'Scenario B' : 'Scenario A'}).`} />
                                                </span>
                                                <span
                                                    className={`text-lg font-bold ${(comp.netMonthlyBenefit ?? 0) >= 0
                                                        ? "text-emerald-700"
                                                        : "text-rose-700"
                                                        }`}
                                                >
                                                    {formatDelta(comp.netMonthlyBenefit)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {isAdvancedMode && (
                                        <div className="space-y-2 mt-4 border-t border-slate-200 pt-4 bg-slate-50 -mx-4 px-4 pb-2">
                                            {/* Advanced Metrics & Overrides */}
                                            {isAdvancedMode && (
                                                <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                                                    {/* Key Advanced Metrics */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Fully Loaded Payroll</div>
                                                            <div className="text-lg font-bold text-slate-700">{formatMoney(comp.fullyLoadedPayroll || 0)}</div>
                                                            <div className="text-xs text-slate-400">w/ {((globalAssumptions.benefitLoad) * 100).toFixed(0)}% Load</div>
                                                        </div>
                                                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                                            <div className="text-xs text-emerald-600 uppercase tracking-wide font-semibold">Realized Revenue</div>
                                                            <div className="text-lg font-bold text-emerald-700">{formatMoney(comp.realizedRevenue || 0)}</div>
                                                            <div className="text-xs text-emerald-500">New Billable Income</div>
                                                        </div>
                                                    </div>

                                                    {/* Billable Hours Assumptions Block */}
                                                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100 space-y-2">
                                                        <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                                                            <span>📊</span> Billable Hours Assumptions
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                            <div className="text-indigo-600">Freed Supervisor Hours:</div>
                                                            <div className="text-right font-mono font-medium text-indigo-900">
                                                                {comp.hoursDelta.toFixed(1)} hrs
                                                            </div>

                                                            <div className="text-indigo-600">Realization %:</div>
                                                            <div className="text-right font-mono font-medium text-indigo-900">
                                                                {((comp.realizationPercent || 0) * 100).toFixed(0)}%
                                                            </div>

                                                            <div className="text-indigo-600 font-semibold border-t border-indigo-200 pt-1">Realized Billable Hrs:</div>
                                                            <div className="text-right font-mono font-bold text-indigo-900 border-t border-indigo-200 pt-1">
                                                                {comp.realizedBillableHours?.toFixed(1)} hrs
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Overrides Toggle */}
                                                    <details className="group">
                                                        <summary className="flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer hover:text-indigo-600 select-none">
                                                            <span className="group-open:rotate-90 transition-transform">▶</span>
                                                            <span>Adjust Scenario Assumptions</span>
                                                        </summary>
                                                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-slate-200">
                                                            {/* Wage Overrides */}
                                                            <div className="space-y-2">
                                                                <div className="text-xs font-semibold text-slate-400 uppercase">Wage Overrides</div>
                                                                <label className="flex justify-between items-center text-xs">
                                                                    <span>CRS Wage</span>
                                                                    <input
                                                                        type="number"
                                                                        placeholder={globalAssumptions.crsBaseWage.toString()}
                                                                        value={scenarios[key].overrides?.wages?.crs ?? ''}
                                                                        onChange={(e) => handleOverrideChange(key, 'wages', 'crs', e.target.value ? Number(e.target.value) : undefined)}
                                                                        className="w-16 border rounded px-1 py-0.5 text-right bg-white"
                                                                    />
                                                                </label>
                                                                <label className="flex justify-between items-center text-xs">
                                                                    <span>CRSS Wage</span>
                                                                    <input
                                                                        type="number"
                                                                        placeholder={globalAssumptions.crssBaseWage.toString()}
                                                                        value={scenarios[key].overrides?.wages?.crss ?? ''}
                                                                        onChange={(e) => handleOverrideChange(key, 'wages', 'crss', e.target.value ? Number(e.target.value) : undefined)}
                                                                        className="w-16 border rounded px-1 py-0.5 text-right bg-white"
                                                                    />
                                                                </label>
                                                                <label className="flex justify-between items-center text-xs">
                                                                    <span>Supervisor Wage</span>
                                                                    <input
                                                                        type="number"
                                                                        placeholder={globalAssumptions.clinicalBaseWage.toString()}
                                                                        value={scenarios[key].overrides?.wages?.supervisor ?? ''}
                                                                        onChange={(e) => handleOverrideChange(key, 'wages', 'supervisor', e.target.value ? Number(e.target.value) : undefined)}
                                                                        className="w-16 border rounded px-1 py-0.5 text-right bg-white"
                                                                    />
                                                                </label>
                                                            </div>

                                                            {/* Billable Overrides */}
                                                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                                                <div className="text-xs font-semibold text-slate-400 uppercase">Billable Overrides</div>
                                                                <label className="flex justify-between items-center text-xs">
                                                                    <span>Billable Rate</span>
                                                                    <input
                                                                        type="number"
                                                                        placeholder={globalAssumptions.supervisorBillableRate.toString()}
                                                                        value={scenarios[key].overrides?.billable?.rate ?? ''}
                                                                        onChange={(e) => handleOverrideChange(key, 'billable', 'rate', e.target.value ? Number(e.target.value) : undefined)}
                                                                        className="w-16 border rounded px-1 py-0.5 text-right bg-white"
                                                                    />
                                                                </label>
                                                                <label className="flex justify-between items-center text-xs">
                                                                    <span>Utilization (0-1)</span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.05"
                                                                        placeholder={globalAssumptions.globalUtilization.toString()}
                                                                        value={scenarios[key].overrides?.billable?.utilization ?? ''}
                                                                        onChange={(e) => handleOverrideChange(key, 'billable', 'utilization', e.target.value ? Number(e.target.value) : undefined)}
                                                                        className="w-16 border rounded px-1 py-0.5 text-right bg-white"
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </details>

                                                    {/* Net Impact Summary */}
                                                    <div className="pt-3 border-t border-slate-200">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-semibold text-slate-500">Year 1 Net Impact</span>
                                                            <span className={`text-sm font-bold ${comp.netImpactYear1 && comp.netImpactYear1 > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                {formatMoney(comp.netImpactYear1 || 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-semibold text-slate-500">Steady State Impact</span>
                                                            <span className={`text-sm font-bold ${comp.netAnnualImpact && comp.netAnnualImpact > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                {formatMoney(comp.netAnnualImpact || 0)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Compliance & Risk Badges */}
                                                    <div className="flex gap-2 pt-2">
                                                        <div className={`px-2 py-1 rounded text-xs font-bold border ${comp.complianceStatus === 'OK' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                            comp.complianceStatus === 'At Risk' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                                'bg-rose-100 text-rose-700 border-rose-200'
                                                            }`}>
                                                            Compliance: {comp.complianceStatus}
                                                        </div>
                                                        <div className={`px-2 py-1 rounded text-xs font-bold border ${comp.riskRating === 'Low' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                            comp.riskRating === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                                'bg-rose-50 text-rose-600 border-rose-200'
                                                            }`}>
                                                            Risk: {comp.riskRating}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}    </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* Executive Summary Strip (Advanced Mode) */}
                {isAdvancedMode && (
                    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-indigo-500 shadow-2xl p-4 z-50">
                        <div className="max-w-6xl mx-auto flex justify-between items-center">
                            <div className="text-white font-bold text-lg flex items-center gap-2">
                                <span>📊</span> Executive Summary
                            </div>
                            <div className="flex gap-8">
                                {/* Scenario C Summary */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 uppercase">Scenario C Net Impact</div>
                                        <div className={`font-mono font-bold text-xl ${computedScenarios.C.netAnnualImpact! >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                            {formatDelta(computedScenarios.C.netAnnualImpact!)} <span className="text-sm font-normal text-slate-500">/ yr</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${computedScenarios.C.complianceStatus === 'OK' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-200' : 'bg-rose-900/50 border-rose-500 text-rose-200'
                                            }`}>
                                            Compliance: {computedScenarios.C.complianceStatus}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded border ${computedScenarios.C.riskRating === 'Low' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-200' : 'bg-amber-900/50 border-amber-500 text-amber-200'
                                            }`}>
                                            Risk: {computedScenarios.C.riskRating}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-l border-slate-700 pl-8 flex items-center">
                                    <div className="text-sm text-slate-300 italic max-w-md">
                                        {computedScenarios.C.netAnnualImpact! > 0
                                            ? "Scenario C improves financial performance while maintaining compliance."
                                            : "Scenario C requires investment but solves compliance/capacity risks."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
