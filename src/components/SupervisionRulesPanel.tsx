import React from 'react';
import type { SupervisionRules } from '../types';
import { SteppedNumberInput } from './Shared';

interface Props {
    rules: SupervisionRules;
    onChange: (newRules: SupervisionRules) => void;
}

export const SupervisionRulesPanel: React.FC<Props> = ({ rules, onChange }) => {
    const [activeTab, setActiveTab] = React.useState<'B' | 'C'>('B');

    const activeConfig = activeTab === 'B' ? rules.tieredB : rules.tieredC;

    const handleTieredChange = (field: keyof typeof activeConfig, value: number) => {
        if (activeTab === 'B') {
            onChange({
                ...rules,
                tieredB: { ...rules.tieredB, [field]: value }
            });
        } else {
            onChange({
                ...rules,
                tieredC: { ...rules.tieredC, [field]: value }
            });
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Supervision Rules
            </h3>

            <div className="space-y-6">
                {/* Baseline Section */}
                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Baseline (Scenario A)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <SteppedNumberInput
                            label="Indiv. Hrs/Staff"
                            value={rules.baselineIndivHrsPerStaff}
                            onChange={(v) => onChange({ ...rules, baselineIndivHrsPerStaff: v })}
                            step={0.5}
                            suffix="hrs"
                        />
                        <SteppedNumberInput
                            label="Group Hrs/Team"
                            value={rules.baselineGroupHrsPerTeam}
                            onChange={(v) => onChange({ ...rules, baselineGroupHrsPerTeam: v })}
                            step={0.5}
                            suffix="hrs"
                        />
                    </div>
                </div>

                {/* Tiered Section */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiered Model Config</h4>

                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('B')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'B'
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                Scenario B
                            </button>
                            <button
                                onClick={() => setActiveTab('C')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'C'
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                Scenario C
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <div className="grid grid-cols-2 gap-4">
                            <SteppedNumberInput
                                label="Sup. Retained Indiv."
                                value={activeConfig.supervisorIndivPerStaff}
                                onChange={(v) => handleTieredChange('supervisorIndivPerStaff', v)}
                                step={0.5}
                                suffix="hrs/staff"
                            />
                            <SteppedNumberInput
                                label="Sup. Oversight of CRSS"
                                value={activeConfig.crssSupervisionHrs}
                                onChange={(v) => handleTieredChange('crssSupervisionHrs', v)}
                                step={0.5}
                                suffix="hrs/mo"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <SteppedNumberInput
                                label="CRSS Delegated Indiv."
                                value={activeConfig.crssIndivPerStaff}
                                onChange={(v) => handleTieredChange('crssIndivPerStaff', v)}
                                step={0.5}
                                suffix="hrs/staff"
                            />
                            <SteppedNumberInput
                                label="Sup. Group Only"
                                value={activeConfig.supervisorGroupOnly}
                                onChange={(v) => handleTieredChange('supervisorGroupOnly', v)}
                                step={0.5}
                                suffix="hrs/mo"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <SteppedNumberInput
                                label="CRSS Group Only"
                                value={activeConfig.groupCrssOnly}
                                onChange={(v) => handleTieredChange('groupCrssOnly', v)}
                                step={0.5}
                                suffix="hrs/mo"
                            />
                            <SteppedNumberInput
                                label="Co-Facilitated Group"
                                value={activeConfig.groupCoFacilitated}
                                onChange={(v) => handleTieredChange('groupCoFacilitated', v)}
                                step={0.5}
                                suffix="hrs/mo"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <SteppedNumberInput
                        label="Max Ratio (CRS:CRSS)"
                        value={rules.internalMaxRatio}
                        onChange={(v) => onChange({ ...rules, internalMaxRatio: v })}
                        min={1}
                        max={20}
                    />
                </div>
            </div>
        </div>
    );
};
