import React from 'react';
import type { Scenario, ComputedMetrics, EnabledFactors } from '../types';
import { ScenarioCard } from './ScenarioCard';

interface Props {
    scenarios: Record<string, Scenario>;
    metrics: Record<string, ComputedMetrics>;
    onScenarioChange: (id: string, newScenario: Scenario) => void;
    enabledFactors: EnabledFactors;
}

export const ScenarioGrid: React.FC<Props> = ({ scenarios, metrics, onScenarioChange, enabledFactors }) => {
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
                    onUpdate={(s) => onScenarioChange("A", s)}
                    isBaseline
                    enabledFactors={enabledFactors}
                />

                {/* Scenario B: Optimized */}
                <ScenarioCard
                    scenario={scenarios.B}
                    metrics={metrics.B}
                    onUpdate={(s) => onScenarioChange("B", s)}
                    enabledFactors={enabledFactors}
                />

                {/* Scenario C: Tiered */}
                <ScenarioCard
                    scenario={scenarios.C}
                    metrics={metrics.C}
                    onUpdate={(s) => onScenarioChange("C", s)}
                    enabledFactors={enabledFactors}
                />
            </div>
        </section>
    );
};
