import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    Cell,
    LabelList,
    Legend
} from 'recharts';
import type { ComputedMetrics, EnabledFactors } from '../types';
import { Card, Badge } from './Shared';

interface Props {
    metricsA: ComputedMetrics;
    metricsB: ComputedMetrics;
    metricsC: ComputedMetrics;
    isOpen: boolean;
    onToggle: () => void;
    enabledFactors: EnabledFactors;
}

export const ExecutiveSummary: React.FC<Props> = ({ metricsA, metricsB, metricsC, isOpen, onToggle, enabledFactors }) => {
    const formatMoney = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const formatDelta = (val: number) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}${formatMoney(val)}`;
    };

    // Prepare data for Recharts
    // If Opportunity Cost is ON:
    // - Scenario A = -metricsA.opportunityCostMonthly
    // - Scenario B/C = metricsX.netMonthlySteadyStateHardWithOpportunity
    const useOpportunityCost = enabledFactors.includeOpportunityCost;

    const valA = useOpportunityCost ? -metricsA.opportunityCostMonthly : 0;
    const valB = useOpportunityCost ? metricsB.netMonthlySteadyStateHardWithOpportunity : metricsB.netMonthlySteadyStateHard;
    const valC = useOpportunityCost ? metricsC.netMonthlySteadyStateHardWithOpportunity : metricsC.netMonthlySteadyStateHard;

    const data = [
        {
            name: 'Scenario A',
            value: valA,
            label: 'Baseline'
        },
        {
            name: 'Scenario B',
            value: valB,
            label: 'Scenario B'
        },
        {
            name: 'Scenario C',
            value: valC,
            label: 'Scenario C'
        }
    ];

    const revenueData = [
        {
            name: 'Scenario A',
            supervisor: 0,
            peer: 0,
            total: 0
        },
        {
            name: 'Scenario B',
            supervisor: metricsB.supervisorRevenue,
            peer: metricsB.peerRevenue,
            total: metricsB.realizedRevenue
        },
        {
            name: 'Scenario C',
            supervisor: metricsC.supervisorRevenue,
            peer: metricsC.peerRevenue,
            total: metricsC.realizedRevenue
        }
    ];

    // Custom label renderer to avoid collision
    const renderCustomLabel = (props: any) => {
        const { x, y, width, height, value } = props;
        const isNegative = value < 0;

        // If negative, place label below the bar (y + height + offset)
        // If positive, place label above the bar (y - offset)
        // However, Recharts "bottom" position puts it inside at the bottom. 
        // We want "outside" logic.

        // Simple logic: 
        // If value is 0, don't show or show "$0" above.
        // If value < 0, put it below the bar.
        // If value > 0, put it above the bar.

        const offset = 15;
        const yPos = isNegative ? y + height + offset : y - offset;

        return (
            <text
                x={x + width / 2}
                y={yPos}
                fill={isNegative ? "#fb7185" : "#059669"} // rose-400 : emerald-600
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-bold font-mono"
            >
                {value === 0 ? "$0" : formatDelta(value)}
            </text>
        );
    };

    return (
        <Card className="border-t-4 border-slate-800 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 transition-all duration-300">
            {/* Collapsible Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors rounded-t-lg focus:outline-none"
            >
                <div className="text-left">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Executive Summary</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">High-level comparison for leadership decision making.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Ticker Tape (Visible when Closed) */}
                    {!isOpen && (
                        <div className="hidden md:flex items-center gap-4 text-sm mr-4 border-r border-slate-200 dark:border-slate-700 pr-4">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Baseline:</span>
                                <span className={`font-mono ${valA < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {formatDelta(valA)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Scenario B:</span>
                                <span className={`font-mono font-bold ${valB >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {formatDelta(valB)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Scenario C:</span>
                                <span className={`font-mono font-bold ${valC >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {formatDelta(valC)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Toggle Icon */}
                    <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                        {isOpen ? '[-] Hide Report' : '[+] Show Report'}
                    </span>
                </div>
            </button>

            {isOpen && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Visual Verdict Chart (Recharts) */}
                    <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-4 h-96">
                        <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Net Monthly Impact Analysis</h4>

                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 40,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickFormatter={(value) => formatMoney(value)}
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg">
                                                    <div className="font-bold mb-1">{data.label}</div>
                                                    <div className="text-slate-300 mb-1">Monthly Net Cash (Hard)</div>
                                                    <div className="font-mono">{formatDelta(data.value)}</div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                                <Bar dataKey="value" barSize={50} radius={[4, 4, 4, 4]}>
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.value >= 0 ? (entry.value === 0 ? '#94a3b8' : '#10b981') : '#fb7185'}
                                        />
                                    ))}
                                    <LabelList content={renderCustomLabel} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Revenue Composition Chart */}
                    <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-4 h-96">
                        <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">Revenue Composition Analysis</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={revenueData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 40,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickFormatter={(value) => formatMoney(value)}
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(value: number) => formatMoney(value)}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="supervisor" stackId="a" name="Supervisor Repurposing" fill="#6366f1" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="peer" stackId="a" name="Peer Billing" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-700 border-b dark:border-slate-600">
                                <tr>
                                    <th className="px-4 py-3">Metric</th>
                                    <th className="px-4 py-3">Scenario A (Current)</th>
                                    <th className="px-4 py-3">Scenario B (Restructure)</th>
                                    <th className="px-4 py-3">Scenario C (Expansion)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                                {/* Net Annual Impact */}
                                <tr className="bg-white dark:bg-slate-800">
                                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Net Annual Impact (Steady State)</td>
                                    <td className="px-4 py-3 font-mono text-slate-400 dark:text-slate-500">-</td>
                                    <td className={`px-4 py-3 font-bold ${metricsB.netAnnualSteadyState >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {formatDelta(metricsB.netAnnualSteadyState)}
                                    </td>
                                    <td className={`px-4 py-3 font-bold ${metricsC.netAnnualSteadyState >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {formatDelta(metricsC.netAnnualSteadyState)}
                                    </td>
                                </tr>

                                {/* Monthly Hard Cash (The CFO Number) */}
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                                        Monthly Net Cash (Hard)
                                        <span className="block text-[10px] text-slate-400 font-normal">Hard Net Impact: Revenue - Payroll + Grant (+ Efficiency if Rev=0)</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-slate-400 dark:text-slate-500">-</td>
                                    <td className={`px-4 py-3 font-mono ${metricsB.netMonthlySteadyStateHard >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {formatDelta(metricsB.netMonthlySteadyStateHard)}
                                    </td>
                                    <td className={`px-4 py-3 font-mono ${metricsC.netMonthlySteadyStateHard >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {formatDelta(metricsC.netMonthlySteadyStateHard)}
                                    </td>
                                </tr>

                                {/* Supervisor Opportunity Cost (Overlay) */}
                                {useOpportunityCost && (
                                    <tr className="bg-rose-50 dark:bg-rose-900/10 border-b dark:border-slate-700">
                                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                                            Supervisor Opportunity Cost
                                            <span className="block text-[10px] text-rose-500 dark:text-rose-400 font-normal">Lost revenue from non-billable supervision</span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-rose-600 dark:text-rose-400">
                                            {formatMoney(-metricsA.opportunityCostMonthly)}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-rose-600 dark:text-rose-400">
                                            {formatMoney(-metricsB.opportunityCostMonthly)}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-rose-600 dark:text-rose-400">
                                            {formatMoney(-metricsC.opportunityCostMonthly)}
                                        </td>
                                    </tr>
                                )}

                                {/* Net Monthly Impact (Hard + Opportunity) */}
                                {useOpportunityCost && (
                                    <tr className="bg-slate-100 dark:bg-slate-800 border-b dark:border-slate-700 border-t-2 border-slate-300 dark:border-slate-600">
                                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                            Net Monthly Impact (Economic Reality)
                                            <span className="block text-[10px] text-slate-500 font-normal">Hard Cash - Opportunity Cost</span>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                                            {formatDelta(-metricsA.opportunityCostMonthly)}
                                        </td>
                                        <td className={`px-4 py-3 font-mono font-bold ${metricsB.netMonthlySteadyStateHardWithOpportunity >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {formatDelta(metricsB.netMonthlySteadyStateHardWithOpportunity)}
                                        </td>
                                        <td className={`px-4 py-3 font-mono font-bold ${metricsC.netMonthlySteadyStateHardWithOpportunity >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {formatDelta(metricsC.netMonthlySteadyStateHardWithOpportunity)}
                                        </td>
                                    </tr>
                                )}

                                {/* Monthly Soft Value (The Ops Number) */}
                                <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                                        Monthly Operational Value (Soft)
                                        <span className="block text-[10px] text-slate-400 font-normal">Retention + Efficiency</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-slate-400 dark:text-slate-500">-</td>
                                    <td className={`px-4 py-3 font-mono ${metricsB.netMonthlySteadyStateSoft >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {formatDelta(metricsB.netMonthlySteadyStateSoft)}
                                    </td>
                                    <td className={`px-4 py-3 font-mono ${metricsC.netMonthlySteadyStateSoft >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {formatDelta(metricsC.netMonthlySteadyStateSoft)}
                                    </td>
                                </tr>

                                {/* Year 1 Impact */}
                                <tr className="bg-white dark:bg-slate-800">
                                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Year 1 Net (w/ Onboarding)</td>
                                    <td className="px-4 py-3 font-mono text-slate-400 dark:text-slate-500">-</td>
                                    <td className={`px-4 py-3 font-mono ${metricsB.netYearOne >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {formatDelta(metricsB.netYearOne)}
                                    </td>
                                    <td className={`px-4 py-3 font-mono ${metricsC.netYearOne >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {formatDelta(metricsC.netYearOne)}
                                    </td>
                                </tr>

                                {/* Compliance */}
                                <tr className="bg-white dark:bg-slate-800">
                                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Compliance Status</td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            label={metricsA.complianceStatus}
                                            color={metricsA.complianceStatus === 'OK' ? 'emerald' : 'rose'}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            label={metricsB.complianceStatus}
                                            color={metricsB.complianceStatus === 'OK' ? 'emerald' : 'rose'}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            label={metricsC.complianceStatus}
                                            color={metricsC.complianceStatus === 'OK' ? 'emerald' : 'rose'}
                                        />
                                    </td>
                                </tr>

                                {/* Operational Stability */}
                                <tr className="bg-white dark:bg-slate-800">
                                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Operational Stability</td>
                                    <td className="px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-400">Fragile</td>
                                    <td className="px-4 py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">Stable</td>
                                    <td className="px-4 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">Scalable</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Card>
    );
};
