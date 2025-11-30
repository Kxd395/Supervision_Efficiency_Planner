import React from 'react';
import type { EnabledFactors } from '../types';

interface Props {
    enabledFactors: EnabledFactors;
    setEnabledFactors: (val: EnabledFactors) => void;
}

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (val: boolean) => void; color: string }> = ({ label, checked, onChange, color }) => (
    <div className="flex items-center gap-2">
        <button
            onClick={() => onChange(!checked)}
            className={`w-10 h-5 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? color : 'bg-slate-500 dark:bg-slate-600'}`}
        >
            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
        <span className={`text-xs font-medium ${checked ? 'text-white' : 'text-slate-400'}`}>{label}</span>
    </div>
);

export const SensitivityBar: React.FC<Props> = ({ enabledFactors, setEnabledFactors }) => {
    return (
        <div className="bg-slate-800 dark:bg-slate-950 text-white p-3 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border border-slate-700">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sensitivity Analysis (Stress Test):</span>
            </div>

            <div className="flex flex-wrap gap-6">
                <Toggle
                    label="Include Revenue Opportunity"
                    checked={enabledFactors.includeRevenue}
                    onChange={(v) => setEnabledFactors({ ...enabledFactors, includeRevenue: v })}
                    color="bg-emerald-500"
                />
                <Toggle
                    label="Include Retention Savings"
                    checked={enabledFactors.includeRetention}
                    onChange={(v) => setEnabledFactors({ ...enabledFactors, includeRetention: v })}
                    color="bg-indigo-500"
                />
                <Toggle
                    label="Include Year 1 Transition Costs"
                    checked={enabledFactors.includeTransitionCost}
                    onChange={(v) => setEnabledFactors({ ...enabledFactors, includeTransitionCost: v })}
                    color="bg-rose-500"
                />
                <Toggle
                    label="Include Opportunity Cost"
                    checked={enabledFactors.includeOpportunityCost}
                    onChange={(v) => setEnabledFactors({ ...enabledFactors, includeOpportunityCost: v })}
                    color="bg-rose-500"
                />
            </div>
        </div>
    );
};
