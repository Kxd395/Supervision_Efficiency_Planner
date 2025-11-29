import React, { useState, useMemo, useEffect } from "react";

type ScenarioKey = "A" | "B" | "C";

type Scenario = {
  label: string;
  frontlineCrs: number;
  crssCount: number;
};

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

type Rates = {
  clinicalHourly: number; // Restored
  clinicalBillable: number;
  crssHourly: number;
  crsHourly: number;
};

type YourPay = {
  baseHoursPerMonth: number;
};

type ComputedScenario = {
  clinicalHours: number;
  crssHours: number;

  // Costs & Revenue
  clinicalLaborCost: number; // Restored
  lostRevenue: number; // Opportunity Cost
  totalSupervisionImpact: number; // Labor + Lost Revenue + Payroll Impact

  // Staffing Impact
  payrollImpact: number; // Change in CRSS Premium vs Scenario A

  // Comparison
  netMonthlyBenefit: number | null; // Positive = Good
  isCapacityWarning: boolean;
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
  config: Config,
  rates: Rates,
  baseHoursPerMonth: number,
  baseScenario: Scenario,
  baseScenarioTotalImpact: number | null
): ComputedScenario {
  const hours = computeScenarioHours(key, scenario, config);

  // 1. Clinical Supervision Impact
  const clinicalLaborCost = hours.clinicalHours * rates.clinicalHourly;
  const lostRevenue = hours.clinicalHours * rates.clinicalBillable;

  // 2. Payroll Impact (CRSS Premium)
  // We only count the *incremental* cost of having a CRSS vs a CRS.
  // We assume the "base" body (CRS) pays for itself via revenue.
  // So we only look at the "Supervision Premium" (The Raise).
  const wageDelta = rates.crssHourly - rates.crsHourly;

  const currentPremium = scenario.crssCount * wageDelta * baseHoursPerMonth;
  const basePremium = baseScenario.crssCount * wageDelta * baseHoursPerMonth;

  // The "Cost" is the increase in premium paid
  const payrollImpact = currentPremium - basePremium;

  // 3. Total Impact
  // Total Cost = Labor Cost + Lost Revenue + Payroll Impact
  const totalSupervisionImpact = clinicalLaborCost + lostRevenue + payrollImpact;

  // 4. Net Benefit vs Scenario A
  let netMonthlyBenefit: number | null = null;
  if (baseScenarioTotalImpact !== null) {
    // Benefit = (Old Cost) - (New Cost)
    netMonthlyBenefit = baseScenarioTotalImpact - totalSupervisionImpact;
  }

  // Capacity Check
  const isCapacityWarning =
    scenario.crssCount > 0 &&
    scenario.frontlineCrs / scenario.crssCount > config.crssCapacity;

  return {
    clinicalHours: hours.clinicalHours,
    crssHours: hours.crssHours,
    clinicalLaborCost,
    lostRevenue,
    payrollImpact,
    totalSupervisionImpact,
    netMonthlyBenefit,
    isCapacityWarning,
  };
}

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

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

  // Rates
  const [rates, setRates] = useState<Rates>({
    clinicalHourly: 60, // Restored default
    clinicalBillable: 150,
    crssHourly: 35.5,
    crsHourly: 24,
  });

  // Your pay info
  const [yourPay, setYourPay] = useState<YourPay>({
    baseHoursPerMonth: 160,
  });

  const computed = useMemo(() => {
    // First compute A to get the baseline
    const compA = computeScenarioCosts(
      "A",
      scenarios.A,
      config,
      rates,
      yourPay.baseHoursPerMonth,
      scenarios.A, // Base is itself
      null
    );

    const result: Record<ScenarioKey, ComputedScenario> = {
      A: compA,
      B: computeScenarioCosts(
        "B",
        scenarios.B,
        config,
        rates,
        yourPay.baseHoursPerMonth,
        scenarios.A,
        compA.totalSupervisionImpact
      ),
      C: computeScenarioCosts(
        "C",
        scenarios.C,
        config,
        rates,
        yourPay.baseHoursPerMonth,
        scenarios.A,
        compA.totalSupervisionImpact
      ),
    };
    return result;
  }, [scenarios, config, rates, yourPay.baseHoursPerMonth]);

  // Helpers
  const handleScenarioChange = (
    key: ScenarioKey,
    field: keyof Scenario,
    value: number
  ) => {
    setScenarios((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleConfigChange = (field: keyof Config, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleRatesChange = (field: keyof Rates, value: number) => {
    setRates((prev) => ({ ...prev, [field]: value }));
  };

  const handleYourPayChange = (field: keyof YourPay, value: number) => {
    setYourPay((prev) => ({ ...prev, [field]: value }));
  };

  const formatMoney = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const formatDelta = (n: number | null) => {
    if (n == null) return "";
    const m = formatMoney(Math.abs(n));
    if (n > 0) return "+ " + m;
    if (n < 0) return "− " + m;
    return m;
  };

  const formatNumber = (n: number) =>
    n.toLocaleString("en-US", {
      maximumFractionDigits: 1,
    });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white rounded-xl shadow p-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">
              Supervision Efficiency Planner
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Compare the <strong>Revenue Opportunity</strong> of freeing up clinical hours vs the <strong>Cost</strong> of hiring/promoting a CRSS.
            </p>
          </div>
          <div className="flex gap-2">
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

        {/* Scenario inputs */}
        <section className="grid md:grid-cols-3 gap-4">
          {(Object.keys(scenarios) as ScenarioKey[]).map((key) => {
            const s = scenarios[key];
            const comp = computed[key];
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
                </div>

                {comp.isCapacityWarning && (
                  <div className="bg-rose-50 text-rose-700 text-xs p-2 rounded border border-rose-200">
                    <strong>Warning:</strong> Ratio exceeds capacity of{" "}
                    {config.crssCapacity} CRS per CRSS.
                  </div>
                )}

                <div className="border-t pt-2 mt-2 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Clinical hours needed</span>
                    <span className="font-semibold">
                      {formatNumber(comp.clinicalHours)}
                    </span>
                  </div>
                  {comp.crssHours > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>CRSS hours needed</span>
                      <span className="font-semibold">
                        {formatNumber(comp.crssHours)}
                      </span>
                    </div>
                  )}

                  {/* Cost Breakdown */}
                  <div className="flex justify-between text-slate-500">
                    <span className="flex items-center">
                      Clinical Labor Cost
                      <HelpTooltip text="Hours * Clinical Hourly Rate" />
                    </span>
                    <span>{formatMoney(comp.clinicalLaborCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span className="flex items-center">
                      Lost Revenue (Opp. Cost)
                      <HelpTooltip text="Hours * Clinical Billable Rate. Money lost because Supervisor is supervising instead of billing." />
                    </span>
                    <span>{formatMoney(comp.lostRevenue)}</span>
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

                  <div className="flex justify-between border-t pt-1 mt-1 text-base">
                    <span className="flex items-center">
                      Total Impact
                      <HelpTooltip text="Labor Cost + Lost Revenue + Payroll Impact." />
                    </span>
                    <span className="font-bold">
                      {formatMoney(comp.totalSupervisionImpact)}
                    </span>
                  </div>

                  {key !== "A" && (
                    <div className="bg-slate-50 p-2 rounded mt-2 space-y-1">
                      <div className="flex justify-between text-xs font-medium uppercase text-slate-500">
                        Net Business Result
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center">
                          Net Monthly Benefit
                          <HelpTooltip text="Positive = This model is better financially than Current." />
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
                </div>
              </div>
            );
          })}
        </section>

        {/* Rates and config */}
        <section className="grid md:grid-cols-3 gap-4">
          {/* Clinical Supervisor Economics */}
          <div className="bg-white rounded-xl shadow p-4 space-y-3 border-t-4 border-indigo-500">
            <h2 className="font-semibold text-lg text-indigo-900">
              Clinical Supervisor
            </h2>
            <p className="text-xs text-slate-500">
              Compare their cost to the revenue they <em>could</em> generate.
            </p>
            <div className="space-y-3 text-sm">
              <label className="flex justify-between items-center">
                <span className="flex flex-col">
                  <span>Hourly Pay Rate</span>
                  <span className="text-xs text-slate-400">Cost to Org</span>
                </span>
                <input
                  type="number"
                  className="w-20 border rounded px-2 py-1 text-right"
                  value={rates.clinicalHourly}
                  min={0}
                  step={0.5}
                  onChange={(e) =>
                    handleRatesChange("clinicalHourly", Number(e.target.value))
                  }
                />
              </label>
              <div className="border-t border-dashed my-2"></div>
              <label className="flex justify-between items-center bg-emerald-50 p-2 rounded -mx-2">
                <span className="flex flex-col">
                  <span className="font-medium text-emerald-900">
                    Billable Rate
                  </span>
                  <span className="text-xs text-emerald-700">
                    Revenue Potential
                  </span>
                </span>
                <input
                  type="number"
                  className="w-20 border rounded px-2 py-1 text-right border-emerald-200"
                  value={rates.clinicalBillable}
                  min={0}
                  step={0.5}
                  onChange={(e) =>
                    handleRatesChange(
                      "clinicalBillable",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* Staff Compensation */}
          <div className="bg-white rounded-xl shadow p-4 space-y-3 border-t-4 border-slate-500">
            <h2 className="font-semibold text-lg text-slate-900">
              Staff Wages (FTE)
            </h2>
            <p className="text-xs text-slate-500">
              Define salaries for CRS and CRSS roles.
            </p>
            <div className="space-y-3 text-sm">
              <label className="flex justify-between items-center">
                <span>CRSS Hourly Wage</span>
                <input
                  type="number"
                  className="w-20 border rounded px-2 py-1 text-right"
                  value={rates.crssHourly}
                  min={0}
                  step={0.5}
                  onChange={(e) =>
                    handleRatesChange("crssHourly", Number(e.target.value))
                  }
                />
              </label>
              <label className="flex justify-between items-center">
                <span>CRS Hourly Wage</span>
                <input
                  type="number"
                  className="w-20 border rounded px-2 py-1 text-right"
                  value={rates.crsHourly}
                  min={0}
                  step={0.5}
                  onChange={(e) =>
                    handleRatesChange("crsHourly", Number(e.target.value))
                  }
                />
              </label>
              <label className="flex justify-between items-center border-t pt-2">
                <span className="flex flex-col">
                  <span>Full-Time Basis</span>
                  <span className="text-xs text-slate-400">Hours/Month</span>
                </span>
                <input
                  type="number"
                  className="w-20 border rounded px-2 py-1 text-right"
                  value={yourPay.baseHoursPerMonth}
                  min={0}
                  onChange={(e) =>
                    handleYourPayChange(
                      "baseHoursPerMonth",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* Capacity Settings */}
          <div className="bg-white rounded-xl shadow p-4 space-y-3 border-t-4 border-rose-400">
            <h2 className="font-semibold text-lg text-rose-900">
              Safety / Capacity
            </h2>
            <div className="space-y-2 text-sm">
              <label className="flex justify-between items-center">
                <span>Max CRS per CRSS</span>
                <input
                  type="number"
                  className="w-20 border rounded px-2 py-1 text-right"
                  value={config.crssCapacity}
                  min={1}
                  onChange={(e) =>
                    handleConfigChange("crssCapacity", Number(e.target.value))
                  }
                />
              </label>
              <p className="text-xs text-slate-500 pt-2">
                Triggers a warning if the supervision ratio is unsafe.
              </p>
            </div>
          </div>
        </section>

        {/* Config section */}
        <div className="grid md:grid-cols-2 gap-4 items-start">
          {/* Standard Model Config */}
          <section className="bg-white rounded-xl shadow p-4 space-y-3">
            <div className="border-b pb-2">
              <h2 className="font-semibold text-lg">Standard Model Config</h2>
              <p className="text-xs text-slate-500">
                Applies to Scenario A & B (Clinical Only)
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <label className="flex justify-between items-center">
                <span>Individual Clinical Supervision (hrs/mo)</span>
                <input
                  type="number"
                  className="w-20 border rounded px-2 py-1 text-right"
                  value={config.currentIndivPerCrsClinical}
                  min={0}
                  step={0.5}
                  onChange={(e) =>
                    handleConfigChange(
                      "currentIndivPerCrsClinical",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
              <label className="flex justify-between items-center">
                <span>Group Clinical Supervision (hrs/mo)</span>
                <input
                  type="number"
                  className="w-20 border rounded px-2 py-1 text-right"
                  value={config.currentGroupsClinical}
                  min={0}
                  step={0.5}
                  onChange={(e) =>
                    handleConfigChange(
                      "currentGroupsClinical",
                      Number(e.target.value)
                    )
                  }
                />
              </label>
            </div>
          </section>

          {/* Tiered Model Config */}
          <section className="bg-white rounded-xl shadow p-4 space-y-3">
            <div className="border-b pb-2">
              <h2 className="font-semibold text-lg">Tiered Model Config</h2>
              <p className="text-xs text-slate-500">
                Applies to Scenario C (Clinical + CRSS)
              </p>
            </div>

            <div className="space-y-4 text-sm">
              {/* Frontline Supervision */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-1">
                  Frontline CRS Supervision
                </h3>
                <label className="flex justify-between items-center">
                  <span>Individual w/ Clinical (hrs/mo)</span>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1 text-right"
                    value={config.crssModelIndivPerCrsClinical}
                    min={0}
                    step={0.5}
                    onChange={(e) =>
                      handleConfigChange(
                        "crssModelIndivPerCrsClinical",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>
                <label className="flex justify-between items-center">
                  <span>Individual w/ CRSS (hrs/mo)</span>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1 text-right"
                    value={config.crssModelIndivPerCrsCrss}
                    min={0}
                    step={0.5}
                    onChange={(e) =>
                      handleConfigChange(
                        "crssModelIndivPerCrsCrss",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>
                <label className="flex justify-between items-center">
                  <span>Group: Both Attend (hrs/mo)</span>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1 text-right"
                    value={config.crssModelGroupsBoth}
                    min={0}
                    step={0.5}
                    onChange={(e) =>
                      handleConfigChange(
                        "crssModelGroupsBoth",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>
                <label className="flex justify-between items-center">
                  <span>Group: CRSS Only (hrs/mo)</span>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1 text-right"
                    value={config.crssModelGroupsCrssOnly}
                    min={0}
                    step={0.5}
                    onChange={(e) =>
                      handleConfigChange(
                        "crssModelGroupsCrssOnly",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>
              </div>

              {/* CRSS Development */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-1">
                  CRSS Development
                </h3>
                <label className="flex justify-between items-center">
                  <span>Clinical Supervision for CRSS (hrs/mo)</span>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1 text-right"
                    value={config.crssModelClinicalPerCrss}
                    min={0}
                    step={0.5}
                    onChange={(e) =>
                      handleConfigChange(
                        "crssModelClinicalPerCrss",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default App;
