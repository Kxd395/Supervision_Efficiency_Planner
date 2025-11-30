import React, { useState, useEffect } from 'react';
import type { GlobalAssumptions } from '../types';
import { SteppedNumberInput } from './Shared';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentAssumptions: GlobalAssumptions;
    onSave: (newAssumptions: GlobalAssumptions) => void;
    onFactoryReset: () => void;
}

export const SettingsModal: React.FC<Props> = ({
    isOpen,
    onClose,
    currentAssumptions,
    onSave,
    onFactoryReset
}) => {
    const [localConfig, setLocalConfig] = useState<GlobalAssumptions>(currentAssumptions);

    // Reset local state when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalConfig(currentAssumptions);
        }
    }, [isOpen, currentAssumptions]);

    if (!isOpen) return null;

    const handleChange = (field: keyof GlobalAssumptions, value: any) => {
        setLocalConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(localConfig);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>⚙️</span> Global Configuration
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Define your organization's baseline defaults. These settings persist across sessions.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                    {/* Financial Baseline */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-900/30 pb-2">
                            Financial Baseline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SteppedNumberInput
                                label="Default Frontline Wage ($/hr)"
                                value={localConfig.crsBaseHourly}
                                onChange={(v) => handleChange('crsBaseHourly', v)}
                                step={0.5}
                                prefix="$"
                            />
                            <SteppedNumberInput
                                label="Default Lead Wage ($/hr)"
                                value={localConfig.crssBaseHourly}
                                onChange={(v) => handleChange('crssBaseHourly', v)}
                                step={0.5}
                                prefix="$"
                            />
                            <SteppedNumberInput
                                label="Default Supervisor Wage ($/hr)"
                                value={localConfig.supervisorBaseHourly}
                                onChange={(v) => handleChange('supervisorBaseHourly', v)}
                                step={1.0}
                                prefix="$"
                            />
                            <SteppedNumberInput
                                label="Benefit Burden Load (%)"
                                value={localConfig.benefitLoad * 100}
                                onChange={(v) => handleChange('benefitLoad', v / 100)}
                                step={1}
                                suffix="%"
                            />
                        </div>
                    </section>

                    {/* Operational Baseline */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-emerald-100 dark:border-emerald-900/30 pb-2">
                            Operational Baseline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SteppedNumberInput
                                label="Standard Utilization Target (%)"
                                value={localConfig.utilizationPercent * 100}
                                onChange={(v) => handleChange('utilizationPercent', v / 100)}
                                step={5}
                                suffix="%"
                            />
                            <SteppedNumberInput
                                label="Supervisor Billable Rate ($/hr)"
                                value={localConfig.supervisorBillableRate}
                                onChange={(v) => handleChange('supervisorBillableRate', v)}
                                step={5}
                                prefix="$"
                            />

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Reinvestment Task Name
                                </label>
                                <input
                                    type="text"
                                    value={localConfig.reinvestmentTask || ""}
                                    onChange={(e) => handleChange('reinvestmentTask', e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g. Outpatient Counseling"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    The clinical activity supervisors perform with freed-up time.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* App Preferences */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
                            App Preferences
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Revenue Realization Mode
                                </label>
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => handleChange('revenueRealizationPercent', 50)}
                                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${localConfig.revenueRealizationPercent === 50
                                            ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        Conservative (50%)
                                    </button>
                                    <button
                                        onClick={() => handleChange('revenueRealizationPercent', 100)}
                                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${localConfig.revenueRealizationPercent === 100
                                            ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        Optimistic (100%)
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500">
                                    Percentage of potential revenue included in the "Hard Cash" calculation.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-between items-center">
                    <button
                        onClick={onFactoryReset}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium underline decoration-rose-200 hover:decoration-rose-500 underline-offset-2 transition-all"
                    >
                        Restore Factory Defaults
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm hover:shadow transition-all"
                        >
                            Save as Default
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
