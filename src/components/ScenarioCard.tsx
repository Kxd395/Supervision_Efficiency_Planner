import React from 'react';
import type { Scenario, ComputedMetrics } from '../types';
import { Card, Badge, SteppedNumberInput, HelpTooltip } from './Shared';

interface Props {
    scenario: Scenario;
    metrics: ComputedMetrics;
    baselineMetrics?: ComputedMetrics; // Optional, for diffing
    onUpdate: (updated: Scenario) => void;
    isBaseline?: boolean;
}

export const ScenarioCard: React.FC<Props> = ({
    scenario,
    metrics,
    onUpdate,
    isBaseline = false
}) => {

    const handleStaffChange = (field: keyof Scenario, value: number) => {
        onUpdate({ ...scenario, [field]: value });
    };

    const handleToggle = (field: keyof Scenario) => {
        // Only applicable for boolean fields like isInternalPromotion
        if (field === 'isInternalPromotion') {
            onUpdate({ ...scenario, isInternalPromotion: !scenario.isInternalPromotion });
        }
    };

    // Helper for formatting currency
    const fmt = (n: number) => Math.round(n).toLocaleString();

    return (
        <Card className={`scenario-card flex flex-col h-full border-t-4 ${isBaseline ? 'border-slate-500' : 'border-indigo-500'} space-y-6`}>

            {/* 1. HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-slate-100">{scenario.label}</h3>
                    <p className="text-xs text-slate-400">{scenario.description}</p>
                </div>
                <Badge
                    label={isBaseline ? "Baseline" : (scenario.id === 'B' ? "Strategic" : "Investment")}
                    color={isBaseline ? "slate" : "indigo"}
                />
            </div>

            {/* 2. STAFFING CONFIGURATION (Inputs) */}
            <div className="space-y-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800 no-print">
                <div className="flex items-center">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staffing Configuration</h4>
                    <HelpTooltip
                        content={{
                            description: "Adjust the number of Frontline CRS and Supervisor CRSS staff. Changes affect payroll costs and supervision ratios.",
                            impact: "Directly drives Payroll Delta and Compliance Status."
                        }}
                    />
                </div>

                <SteppedNumberInput
                    label="Frontline CRS Count"
                    value={scenario.frontlineCrsCount}
                    onChange={(v) => handleStaffChange('frontlineCrsCount', v)}
                    min={0}
                />

                <SteppedNumberInput
                    label="CRSS Count"
                    value={scenario.crssCount}
                    onChange={(v) => handleStaffChange('crssCount', v)}
                    min={0}
                />

                {/* Internal Promotion Toggle (Scenario B only) */}
                {!isBaseline && (
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400">Internal Promotion?</span>
                        <input
                            type="checkbox"
                            checked={scenario.isInternalPromotion || false}
                            onChange={() => handleToggle('isInternalPromotion')}
                            className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                )}
            </div>

            {/* 2b. STAFFING SUMMARY (Print Only) */}
            <div className="hidden print:block space-y-2 p-4 border border-slate-200 rounded-lg">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staffing Configuration</h4>
                <div className="flex justify-between text-sm">
                    <span>Frontline CRS:</span>
                    <span className="font-bold">{scenario.frontlineCrsCount} FTEs</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>CRSS (Peer Sup):</span>
                    <span className="font-bold">{scenario.crssCount} FTEs</span>
                </div>
                {!isBaseline && scenario.isInternalPromotion && (
                    <div className="text-xs text-slate-500 italic mt-1">
                        * Internal Promotion Model
                    </div>
                )}
            </div>

            {/* 3. PAYROLL IMPACT */}
            <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <div className="text-xs text-slate-400">
                    <div className="flex items-center">
                        Salary & Payroll Impact
                        <HelpTooltip
                            content={{
                                description: "The difference in total loaded payroll (wages + benefits) compared to the Baseline scenario.",
                                impact: "Positive values mean higher costs; negative values mean savings."
                            }}
                        />
                    </div>
                    <span className="text-[10px] opacity-70">Base Payroll: ${fmt(metrics.payrollBase)}</span>
                </div>
                <div className={`text-sm font-bold ${metrics.payrollDeltaLoaded > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {metrics.payrollDeltaLoaded > 0 ? '+' : ''}${fmt(metrics.payrollDeltaLoaded)}
                    <span className="block text-[10px] font-normal text-slate-500 text-right">Loaded Monthly</span>
                </div>
            </div>

            {/* 3b. CLINICAL CAPACITY (Restored Hours) */}
            {metrics.freedSupervisorHours > 0 && (
                <div className="flex items-center gap-2 pt-4">
                    <div className="p-1.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                        {/* Clock / Doctor Icon */}
                        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-xs">
                        <div className="flex items-center">
                            <span className="block font-bold text-indigo-100">
                                {metrics.freedSupervisorHours % 1 === 0 ? metrics.freedSupervisorHours.toLocaleString() : metrics.freedSupervisorHours.toFixed(1)} Hours / Month
                            </span>
                            <HelpTooltip
                                content={{
                                    description: "Supervisor hours freed up by delegating tasks to CRSS staff. These hours are repurposed for billable clinical work.",
                                    impact: "Generates 'Hard Revenue' if billable, or 'Soft Efficiency' if not."
                                }}
                            />
                        </div>
                        <span className="text-[10px] text-slate-400">
                            Modeled monthly hours restored for {scenario.reinvestmentTask || "clinical care"}
                        </span>
                    </div>
                </div>
            )}

            {/* 4. VALUE GENERATED (Grant Shield + Revenue Split) */}
            <div className="space-y-4 flex-grow">
                <div className="flex items-center mt-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Value Generated</h4>
                    <HelpTooltip
                        content={{
                            description: "Financial value created through new revenue (Supervisor + Peer), Grant Savings (offsetting costs), and Efficiency/Retention savings.",
                            impact: "Offsets the Payroll Impact to determine Net Monthly Impact."
                        }}
                    />
                </div>

                {/* A. GRANT SHIELD (Only if Grant Savings exist) */}
                {metrics.grantSavings > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
                        <div className="p-2 bg-emerald-900/50 rounded-full flex-shrink-0">
                            {/* Shield Icon */}
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">
                                Grant Shield Active
                            </div>
                            <div className="text-sm font-medium text-emerald-100">
                                ${fmt(metrics.grantSavings)}/mo <span className="text-emerald-500/70">offset</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* B. REVENUE SPLIT (Stacked Bar) */}
                <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-400">Total Revenue</span>
                        <span className="text-sm font-bold text-indigo-100">
                            +${fmt(metrics.realizedRevenue)}
                        </span>
                    </div>

                    {metrics.realizedRevenue > 0 ? (
                        <>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                                {/* Supervisor Segment (Blue) */}
                                <div
                                    className="h-full bg-indigo-500"
                                    style={{ width: `${(metrics.supervisorRevenue / metrics.realizedRevenue) * 100}%` }}
                                />
                                {/* Peer Segment (Green) */}
                                <div
                                    className="h-full bg-emerald-500"
                                    style={{ width: `${(metrics.peerRevenue / metrics.realizedRevenue) * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-[10px] pt-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-slate-400">
                                        Director: <span className="text-slate-200">${fmt(metrics.supervisorRevenue)}</span>
                                    </span>
                                </div>

                                {metrics.peerRevenue > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="text-slate-400">
                                            Peers: <span className="text-slate-200">${fmt(metrics.peerRevenue)}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-[11px] text-slate-600 italic">No revenue projected</div>
                    )}
                </div>

                {/* C. OTHER METRICS (Efficiency & Retention) */}
                <div className="space-y-1 pt-2 border-t border-slate-800/50">
                    <div className="flex justify-between text-xs">
                        <span className="text-emerald-400">+ Efficiency Savings</span>
                        <span className="text-emerald-400 font-medium">+${fmt(metrics.laborEfficiencySavings)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-emerald-400">+ Retention Savings</span>
                        <span className="text-emerald-400 font-medium">+${fmt(metrics.retentionSavings)}</span>
                    </div>
                </div>
            </div>

            {/* 5. FOOTER: NET IMPACT */}
            <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                        <span className="text-xs font-bold text-white uppercase">Net Monthly Impact (Hard)</span>
                        <HelpTooltip
                            content={{
                                description: "The actual effect on the bank account. Calculated as: (Realized Revenue + Grant Savings) - Payroll Delta.",
                                impact: "The primary financial KPI for decision making."
                            }}
                        />
                    </div>
                    <span className={`text-lg font-bold ${metrics.netMonthlySteadyStateHard >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {metrics.netMonthlySteadyStateHard >= 0 ? '+' : ''}${fmt(metrics.netMonthlySteadyStateHard)}
                    </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>+ Operational Value (Soft)</span>
                    <span>+${fmt(metrics.netMonthlySteadyStateSoft)}</span>
                </div>

                {/* Year 1 Net (Transition Costs) */}
                {metrics.netYearOne < 0 && !isBaseline && (
                    <div className="mt-3 p-2 bg-rose-950/20 border border-rose-900/30 rounded text-center">
                        <span className="text-[10px] text-rose-300">Year 1 Net (w/ Transition): </span>
                        <span className="text-xs font-bold text-rose-400">${fmt(metrics.netYearOne)}</span>
                    </div>
                )}
            </div>

        </Card>
    );
};
