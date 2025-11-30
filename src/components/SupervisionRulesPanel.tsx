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
                    <div className="flex items-center justify-between mb-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">

                        {/* LEFT COLUMN: CLINICAL SUPERVISOR */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-100 dark:border-indigo-900/50 pb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                </svg>
                                Clinical Supervisor Load (Retained)
                            </h3>

                            <SteppedNumberInput
                                label="Retained 1:1"
                                value={activeConfig.supervisorIndivPerStaff}
                                onChange={(v) => handleTieredChange('supervisorIndivPerStaff', v)}
                                step={0.5}
                                suffix="hrs/staff"
                                className="bg-white dark:bg-slate-900 rounded-lg p-2 shadow-sm border border-slate-100 dark:border-slate-700"
                            />
                            <SteppedNumberInput
                                label="Clinical Supervisor Groups"
                                value={activeConfig.supervisorGroupOnly}
                                onChange={(v) => handleTieredChange('supervisorGroupOnly', v)}
                                step={0.5}
                                suffix="hrs/mo"
                                className="bg-white dark:bg-slate-900 rounded-lg p-2 shadow-sm border border-slate-100 dark:border-slate-700"
                            />
                            <SteppedNumberInput
                                label="Oversight of CRSS"
                                value={activeConfig.crssSupervisionHrs}
                                onChange={(v) => handleTieredChange('crssSupervisionHrs', v)}
                                step={0.5}
                                suffix="hrs/mo"
                                className="bg-white dark:bg-slate-900 rounded-lg p-2 shadow-sm border border-slate-100 dark:border-slate-700"
                            />
                        </div>

                        {/* RIGHT COLUMN: CRSS */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border-b border-emerald-100 dark:border-emerald-900/50 pb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                                </svg>
                                CRSS Load (Delegated)
                            </h3>

                            <SteppedNumberInput
                                label="Delegated 1:1"
                                value={activeConfig.crssIndivPerStaff}
                                onChange={(v) => handleTieredChange('crssIndivPerStaff', v)}
                                step={0.5}
                                suffix="hrs/staff"
                                className="bg-white dark:bg-slate-900 rounded-lg p-2 shadow-sm border border-slate-100 dark:border-slate-700"
                            />
                            <SteppedNumberInput
                                label="CRSS Groups"
                                value={activeConfig.groupCrssOnly}
                                onChange={(v) => handleTieredChange('groupCrssOnly', v)}
                                step={0.5}
                                suffix="hrs/mo"
                                className="bg-white dark:bg-slate-900 rounded-lg p-2 shadow-sm border border-slate-100 dark:border-slate-700"
                            />
                            <SteppedNumberInput
                                label="Co-Facilitated Groups"
                                value={activeConfig.groupCoFacilitated}
                                onChange={(v) => handleTieredChange('groupCoFacilitated', v)}
                                step={0.5}
                                suffix="hrs/mo"
                                className="bg-white dark:bg-slate-900 rounded-lg p-2 shadow-sm border border-slate-100 dark:border-slate-700"
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
