import React from 'react';
import type { Scenario, ComputedMetrics, GlobalAssumptions, SupervisionRules } from '../types';
import { ScenarioCard } from './ScenarioCard';

interface Props {
    scenarios: Record<string, Scenario>;
    metrics: Record<string, ComputedMetrics>;
    globalAssumptions: GlobalAssumptions;
    rules: SupervisionRules; // Added rules prop
    onScenarioChange: (id: string, newScenario: Scenario) => void;
}

export const ScenarioGrid: React.FC<Props> = ({ scenarios, metrics, globalAssumptions, rules, onScenarioChange }) => {
    return (
        <section>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded">2</span>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Scenario Modeling</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Scenario A: Baseline */}
                <ScenarioCard
                    scenario={scenarios.A}
                    metrics={metrics.A}
                    globalDefaults={globalAssumptions}
                    rules={rules}
                    onChange={(s) => onScenarioChange("A", s)}
                    isBaseline
                />

                {/* Scenario B: Optimized */}
                <ScenarioCard
                    scenario={scenarios.B}
                    metrics={metrics.B}
                    globalDefaults={globalAssumptions}
                    rules={rules}
                    onChange={(s) => onScenarioChange("B", s)}
                />

                {/* Scenario C: Tiered */}
                <ScenarioCard
                    scenario={scenarios.C}
                    metrics={metrics.C}
                    globalDefaults={globalAssumptions}
                    rules={rules}
                    onChange={(s) => onScenarioChange("C", s)}
                />
            </div>
        </section>
    );
};
