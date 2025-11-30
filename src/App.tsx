import React, { useMemo, useState, useEffect } from "react";

import type {
  GlobalAssumptions,
  DemandAssumptions,
  SupervisionRules,
  HRRiskAssumptions,
  Scenario,
  ComputedMetrics,
  EnabledFactors
} from "./types";
import {
  DEFAULT_GLOBAL_ASSUMPTIONS,
  DEFAULT_DEMAND_ASSUMPTIONS,
  DEFAULT_SUPERVISION_RULES,
  DEFAULT_HR_RISK_ASSUMPTIONS,
  DEFAULT_SCENARIOS,
} from "./constants";
import { computeScenarioMetrics } from "./logic";
import { usePersistedState } from "./hooks/usePersistedState";

import { ScenarioGrid } from "./components/ScenarioGrid";
import { ExecutiveSummary } from "./components/ExecutiveSummary";
import { AssumptionsDeck } from "./components/AssumptionsDeck";
import { SettingsModal } from "./components/SettingsModal";


import { HelpModal } from "./components/HelpModal";
import { SensitivityBar } from "./components/SensitivityBar";

const App: React.FC = () => {
  // --- State ---
  // Using persisted state with debounce
  const [globalAssumptions, setGlobalAssumptions] = usePersistedState<GlobalAssumptions>(
    "sep_global_v2", // Bumped to v2 for grant slots + peer revenue
    DEFAULT_GLOBAL_ASSUMPTIONS
  );
  const [demandAssumptions, setDemandAssumptions] = usePersistedState<DemandAssumptions>(
    "sep_demand_v2", // Bumped to v2 for simplified operations-only fields
    DEFAULT_DEMAND_ASSUMPTIONS
  );
  const [supervisionRules, setSupervisionRules] = usePersistedState<SupervisionRules>(
    "sep_rules_gold_master_final", // Bump version to force reset for Gold Master Final
    DEFAULT_SUPERVISION_RULES
  );

  // MIGRATION: Ensure tiered config exists (Legacy support, though v2 key should handle it)
  // MIGRATION: Removed legacy tiered check as we bumped the key
  const safeSupervisionRules = supervisionRules;
  const [hrRiskAssumptions, setHrRiskAssumptions] = usePersistedState<HRRiskAssumptions>(
    "sep_hr",
    DEFAULT_HR_RISK_ASSUMPTIONS
  );
  const [scenarios, setScenarios] = usePersistedState<Record<string, Scenario>>(
    "sep_scenarios",
    DEFAULT_SCENARIOS
  );

  // Sensitivity Analysis State
  const [enabledFactors, setEnabledFactors] = useState<EnabledFactors>({
    includeRevenue: true,
    includeRetention: true,
    includeTransitionCost: true
  });

  // Dark Mode Persistence
  const [isDarkMode, setIsDarkMode] = usePersistedState<boolean>('sep_isDarkMode', true);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Collapsible Workspace State
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  // --- Effects ---
  // Apply Dark Mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Computations ---
  const metrics = useMemo(() => {
    const baselineScenario = scenarios.A;

    // Helper to calculate payroll for a given scenario
    const calculatePayroll = (scenario: Scenario, globalAssumptions: GlobalAssumptions) => {
      const crsSalary = globalAssumptions.crsBaseHourly;
      const crssSalary = globalAssumptions.crssBaseHourly;
      const supervisorSalary = globalAssumptions.supervisorBaseHourly;

      const totalSalary =
        (scenario.frontlineCrsCount * crsSalary * globalAssumptions.fteHoursPerMonth) +
        (scenario.crssCount * crssSalary * globalAssumptions.fteHoursPerMonth) +
        (scenario.supervisorFte * supervisorSalary * globalAssumptions.fteHoursPerMonth);

      const loadedPayroll = totalSalary * (1 + globalAssumptions.benefitLoad);
      return { totalSalary, loaded: loadedPayroll };
    };

    const baselinePayroll = calculatePayroll(baselineScenario, globalAssumptions);

    const computed: Record<string, ComputedMetrics> = {};
    Object.values(scenarios).forEach((scenario) => {
      computed[scenario.id] = computeScenarioMetrics(
        scenario,
        globalAssumptions,
        safeSupervisionRules,
        hrRiskAssumptions,
        baselineScenario,
        baselinePayroll.loaded,
        enabledFactors
      );
    });
    return computed;
  }, [scenarios, globalAssumptions, safeSupervisionRules, hrRiskAssumptions, enabledFactors]);

  // --- Handlers ---
  const handleScenarioChange = (id: string, newScenario: Scenario) => {
    setScenarios((prev) => ({
      ...prev,
      [id]: newScenario,
    }));
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all assumptions to defaults?")) {
      setGlobalAssumptions(DEFAULT_GLOBAL_ASSUMPTIONS);
      setDemandAssumptions(DEFAULT_DEMAND_ASSUMPTIONS);
      setSupervisionRules(DEFAULT_SUPERVISION_RULES);
      setHrRiskAssumptions(DEFAULT_HR_RISK_ASSUMPTIONS);
      setScenarios(DEFAULT_SCENARIOS);
    }
  };

  const handleSaveSettings = (newSettings: GlobalAssumptions) => {
    setGlobalAssumptions(newSettings);
    setIsSettingsOpen(false);
  };

  const handleFactoryReset = () => {
    if (confirm("Are you sure you want to reset ALL data to factory defaults? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
      {/* Header */}
      <header className="no-print sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Supervision Efficiency Planner</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Model the financial and operational impact of tiered supervision structures.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsSummaryOpen(true); // Auto-expand summary
                setTimeout(() => window.print(), 100);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors no-print border border-slate-700 text-sm font-medium"
              title="Print / Save as PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Export Report</span>
            </button>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Help / User Guide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={handleResetDefaults}
              className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded border border-slate-600 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reset Defaults
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 space-y-8">

        {/* Print Header */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Executive Summary</h1>
              <p className="text-sm text-slate-600 mt-1">Supervision Efficiency Planner</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Generated on</p>
              <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <section className="executive-summary-container">
          <ExecutiveSummary
            metricsA={metrics.A}
            metricsB={metrics.B}
            metricsC={metrics.C}
            isOpen={isSummaryOpen}
            onToggle={() => setIsSummaryOpen(!isSummaryOpen)}
          />
        </section>

        {/* 2. Sensitivity Analysis Bar */}
        <section className="no-print">
          <SensitivityBar
            enabledFactors={enabledFactors}
            setEnabledFactors={setEnabledFactors}
          />
        </section>

        {/* 3. Assumptions Deck */}
        <section className="no-print">
          <AssumptionsDeck
            globalAssumptions={globalAssumptions}
            setGlobalAssumptions={setGlobalAssumptions}
            demandAssumptions={demandAssumptions}
            setDemandAssumptions={setDemandAssumptions}
            supervisionRules={safeSupervisionRules}
            setSupervisionRules={setSupervisionRules}
            hrRiskAssumptions={hrRiskAssumptions}
            setHrRiskAssumptions={setHrRiskAssumptions}
            enabledFactors={enabledFactors}
            setEnabledFactors={setEnabledFactors}
            isOpen={isAssumptionsOpen}
            onToggle={() => setIsAssumptionsOpen(!isAssumptionsOpen)}
          />
        </section>

        {/* 4. Scenario Modeling */}
        <ScenarioGrid
          scenarios={scenarios}
          metrics={metrics}
          onScenarioChange={handleScenarioChange}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentAssumptions={globalAssumptions}
        onSave={handleSaveSettings}
        onFactoryReset={handleFactoryReset}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
