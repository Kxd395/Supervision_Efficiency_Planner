import React from 'react';
import type { Scenario, ComputedMetrics, GlobalAssumptions, SupervisionRules } from '../types';
import { Card, NumberInput, Badge, HelpTooltip, SteppedNumberInput } from './Shared';
import { MathExplainer } from './MathExplainer';
import { usePersistedState } from '../hooks/usePersistedState';

interface Props {
    scenario: Scenario;
    metrics: ComputedMetrics;
    globalDefaults: GlobalAssumptions;
    rules: SupervisionRules; // Added rules prop
    onChange: (newScenario: Scenario) => void;
    isBaseline?: boolean;
}

export const ScenarioCard: React.FC<Props> = ({
    scenario,
    metrics,
    globalDefaults,
    rules,
    onChange,
    isBaseline = false
}) => {
    const [showOverrides, setShowOverrides] = usePersistedState<boolean>('sep_showAdvancedSettings', false);

    const handleChange = (field: keyof Scenario, value: any) => {
        onChange({ ...scenario, [field]: value });
    };

    const handleOverrideChange = (field: string, value: number | undefined) => {
        const newOverrides = { ...scenario.overrides };
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            if (parent === 'wages') {
                newOverrides.wages = {
                    ...newOverrides.wages,
                    [child]: value
                };
            }
        } else {
            // Safe cast as we know the field matches keyof ScenarioOverrides
            (newOverrides as any)[field] = value;
        }
        onChange({ ...scenario, overrides: newOverrides });
    };

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const formatNumber = (val: number) =>
        new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

    const formatCurrency = formatMoney;

    const formatDelta = (val: number) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}${formatMoney(val)}`;
    };

    // Helper for Math Trace
    const supervisorLoaded = globalDefaults.supervisorBaseHourly * (1 + globalDefaults.benefitLoad);
    const crssLoaded = globalDefaults.crssBaseHourly * (1 + globalDefaults.benefitLoad);

    const renderMetrics = () => (
        <div className="space-y-4 text-sm">
            {/* Financials */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Salary & Payroll Impact</span>
                    <span className="font-mono dark:text-slate-200">{formatDelta(metrics.payrollDeltaLoaded)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
                    <span>Base Payroll: {formatMoney(metrics.payrollBase)}</span>
                    <span>Loaded: {formatMoney(metrics.payrollLoaded)}</span>
                </div>
            </div>

            <div className="flex flex-col items-start h-full justify-start">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-800 pb-1 w-full">Value Generated</h4>




                {/* Capacity Reinvestment Block */}
                {isBaseline ? (
                    <div className="mb-3 mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 w-full">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                            📉 Clinical Sup. Load
                        </h5>
                        <div className="text-xs text-slate-700 dark:text-slate-300 mb-1 font-medium flex items-center gap-2">
                            <span className="text-lg">⏳</span>
                            {metrics.requiredHours.toFixed(1)} Hours / Month
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-7">
                            Breakdown: {(scenario.frontlineCrsCount * rules.baselineIndivHrsPerStaff).toFixed(1)} Indiv + {rules.baselineGroupHrsPerTeam.toFixed(1)} Group
                        </div>
                    </div>
                ) : (<>
                    {metrics.freedSupervisorHours > 0 && (
                        <div className="mb-3 mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800/50 w-full">
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1">
                                    🎯 Leadership Capacity Restored
                                </h5>
                                {metrics.realizedRevenue > 0 && (
                                    <div className="flex gap-1">
                                        {metrics.supervisorRevenue > 0 && (
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800" title="Supervisor Repurposing Revenue">
                                                +{formatCurrency(metrics.supervisorRevenue)} Sup.
                                            </span>
                                        )}
                                        {metrics.peerRevenue > 0 && (
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800" title="Peer Billable Revenue (H0038)">
                                                +{formatCurrency(metrics.peerRevenue)} Peer
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                {/* Left Column: Reinvestment Details */}
                                <ul className="space-y-2 flex-grow">
                                    <li className="text-[10px] text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                        <span className="text-emerald-500">✅</span>
                                        <span>~{metrics.freedSupervisorHours.toFixed(1)} {globalDefaults.reinvestmentTask || "Outpatient Counseling"} Sessions</span>
                                    </li>
                                </ul>

                                {/* Right Column: Value Generated (Blue) */}
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 flex flex-col justify-center items-start border-l border-indigo-100 dark:border-indigo-800/50">
                                    <div className="mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Leadership Capacity Restored</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">
                                            {formatNumber(metrics.freedSupervisorHours)}
                                        </span>
                                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">hrs/mo</span>
                                    </div>

                                    {/* Tooltip explaining Net Freed */}
                                    <div className="mt-2 text-xs text-indigo-500/80 dark:text-indigo-400/60">
                                        *Net Freed = Baseline - (Retained + Mgmt)
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === HYBRID FUNDING VISUALIZATION === */}
                    <div className="space-y-4">
                        {/* 1. GRANT SHIELD (Only visible if Grant > 0) */}
                        {metrics.grantSavings > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                                    {/* Shield Icon */}
                                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-500">
                                        Grant Shield Active
                                    </div>
                                    <div className="text-sm font-medium text-emerald-800 dark:text-emerald-100">
                                        {formatCurrency(metrics.grantSavings)}/mo <span className="text-emerald-600/70 dark:text-emerald-500/70">offset</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. VALUE GENERATED (Revenue Split) */}
                        {metrics.realizedRevenue > 0 && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Total Revenue Generated
                                    </h4>
                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-100">
                                        +{formatCurrency(metrics.realizedRevenue)}
                                    </span>
                                </div>

                                {/* The Stacked Bar */}
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
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

                                {/* The Legend / Breakdown */}
                                <div className="flex justify-between text-[10px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        <span className="text-slate-500 dark:text-slate-400">
                                            Director: <span className="text-slate-700 dark:text-slate-200">{formatCurrency(Math.round(metrics.supervisorRevenue))}</span>
                                        </span>
                                    </div>

                                    {metrics.peerRevenue > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-slate-500 dark:text-slate-400">
                                                Peers: <span className="text-slate-700 dark:text-slate-200">{formatCurrency(Math.round(metrics.peerRevenue))}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Efficiency Savings */}
                    {metrics.laborEfficiencySavings > 0 && (
                        <div className="mb-1">
                            <MathExplainer
                                label="+ Efficiency Savings"
                                value={`+${formatMoney(metrics.laborEfficiencySavings)}`}
                                description="We gained back Supervisor time by moving supervision to the CRSS role."
                                formula="(Supervisor Loaded - CRSS Loaded) × Freed Hours"
                                math={`($${supervisorLoaded.toFixed(2)} - $${crssLoaded.toFixed(2)}) × ${metrics.freedSupervisorHours.toFixed(1)} hrs`}
                            />
                        </div>
                    )}

                    {/* 3. Retention Savings */}
                    {metrics.retentionSavings > 0 && (
                        <div className="mb-1">
                            <MathExplainer
                                label="+ Retention Savings"
                                value={`+${formatMoney(metrics.retentionSavings)}`}
                                description="Cost avoidance from reduced turnover (10% reduction)."
                                formula="(Total Staff × 0.10 × Cost Per Departure) / 12"
                                math={`(${scenario.frontlineCrsCount + scenario.crssCount} staff × 0.10 × $5,000) / 12`}
                            />
                        </div>
                    )}
                </>)}
            </div>

            {/* Net Impact */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-2">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Net Monthly Impact (Hard)</span>
                    <span className={`font-bold text-lg flex items-center gap-1 ${metrics.netMonthlySteadyStateHard >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                        {formatDelta(metrics.netMonthlySteadyStateHard)}
                        {metrics.netMonthlySteadyStateHard < 0 && (
                            <HelpTooltip text="Cost of Compliance & Quality Assurance (Cash Flow Only)" />
                        )}
                    </span>
                </div>

                {/* Soft Value Display */}
                {metrics.softValueTotal > 0 && (
                    <div className="flex justify-between items-center mb-2 text-xs">
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <span>+ Operational Value (Soft)</span>
                            <HelpTooltip text="Estimated value of reduced turnover and improved labor allocation. Not included in Net Cash Flow." />
                        </div>
                        <span className="font-medium text-slate-500 dark:text-slate-400">
                            +{formatMoney(metrics.softValueTotal)}
                        </span>
                    </div>
                )}

                {!isBaseline && (
                    <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Salary & Payroll Impact</span>
                            <span className={`font-medium ${metrics.payrollDeltaLoaded > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {metrics.payrollDeltaLoaded > 0 ? '+' : ''}{formatCurrency(metrics.payrollDeltaLoaded)}
                            </span>
                        </div>
                        {metrics.transitionCost > 0 && (
                            <div className="flex justify-between text-rose-600/70 dark:text-rose-400/70">
                                <span className="flex items-center gap-1">
                                    - Transition Cost (Year 1)
                                    <HelpTooltip text="One-time OT bridge cost during recruitment (approx. 1 month)." />
                                </span>
                                <span>-{formatMoney(metrics.transitionCost)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1 mt-1">
                            <span className="flex items-center gap-1 dark:text-slate-400">
                                Year 1 Net
                                {metrics.netAnnualSteadyState - metrics.transitionCost < 0 && (
                                    <span title="Includes one-time transition costs (OT backfill)" className="cursor-help text-amber-500">⚠️</span>
                                )}
                                <HelpTooltip text="Annual Steady State minus One-Time Transition Costs." />
                            </span>
                            <div className="text-right">
                                <div className={metrics.netAnnualSteadyState - metrics.transitionCost >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                                    {formatDelta(metrics.netAnnualSteadyState - metrics.transitionCost)}
                                </div>
                                {metrics.breakEvenMonths > 0 && metrics.breakEvenMonths < 24 && (
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                        (Break-even: ~{Math.ceil(metrics.breakEvenMonths)} mo)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            );
            );

            return (
            <Card className={`relative ${metrics.safetyStatus === 'Overloaded' ? 'ring-2 ring-rose-500' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{scenario.label}</h2>
                        {scenario.description && <p className="text-xs text-slate-500 dark:text-slate-400">{scenario.description}</p>}
                    </div>
                    <div className="flex gap-1">
                        {metrics.complianceStatus === 'Non-Compliant' && <Badge label="Non-Compliant" color="rose" />}
                        {metrics.complianceStatus === 'High Risk' && <Badge label="High Risk" color="rose" />}
                        {metrics.complianceStatus === 'At Capacity' && <Badge label="At Capacity" color="amber" />}
                        {metrics.safetyStatus === 'Overloaded' && metrics.complianceStatus !== 'High Risk' && <Badge label="Unsafe Ratio" color="rose" />}
                        {(metrics.complianceStatus === 'OK' || metrics.complianceStatus === 'Optimized' as any) && metrics.safetyStatus === 'OK' && (
                            metrics.netMonthlySteadyState < 0 ?
                                <Badge label="Strategic Investment" color="blue" /> :
                                <Badge label="Optimized" color="emerald" />
                        )}
                    </div>
                </div>

                {/* Staffing Inputs */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">Staffing Configuration</h3>
                    <SteppedNumberInput
                        label="Frontline CRS Count"
                        value={scenario.frontlineCrsCount}
                        onChange={(v) => handleChange('frontlineCrsCount', v)}
                        min={0}
                        step={1}
                        className="w-full"
                        inputWrapperClassName="bg-white dark:bg-slate-800"
                    />
                    <SteppedNumberInput
                        label="CRSS Count"
                        value={scenario.crssCount}
                        onChange={(v) => handleChange('crssCount', v)}
                        min={0}
                        step={1}
                        className="w-full"
                        inputWrapperClassName="bg-white dark:bg-slate-800"
                    />
                    {scenario.crssCount > 0 && (
                        <label className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                            <span className="text-slate-600 dark:text-slate-400">Internal Promotion?</span>
                            <input
                                type="checkbox"
                                checked={scenario.isInternalPromotion}
                                onChange={(e) => handleChange('isInternalPromotion', e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                            />
                        </label>
                    )}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 items-start">
                    {renderMetrics()}
                </div>

                {/* Advanced Overrides */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setShowOverrides(!showOverrides)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-300 font-medium flex items-center"
                    >
                        {showOverrides ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                    </button>

                    {showOverrides && (
                        <div className="mt-3 space-y-3 bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 text-xs">
                            <p className="text-slate-500 dark:text-slate-400 italic mb-2">Override global defaults for this scenario only.</p>

                            <NumberInput
                                label="CRS Wage Override"
                                value={scenario.overrides?.wages?.crs ?? globalDefaults.crsBaseHourly}
                                onChange={(v) => handleOverrideChange('wages.crs', v)}
                                prefix="$"
                                step={0.5}
                                className="text-xs"
                            />
                            <NumberInput
                                label="CRSS Wage Override"
                                value={scenario.overrides?.wages?.crss ?? globalDefaults.crssBaseHourly}
                                onChange={(v) => handleOverrideChange('wages.crss', v)}
                                prefix="$"
                                step={0.5}
                                className="text-xs"
                            />
                            <NumberInput
                                label="Billable Rate Override"
                                value={scenario.overrides?.billableRate ?? globalDefaults.supervisorBillableRate}
                                onChange={(v) => handleOverrideChange('billableRate', v)}
                                prefix="$"
                                className="text-xs"
                            />
                        </div>
                    )}
                </div>
            </Card>
            );
};
