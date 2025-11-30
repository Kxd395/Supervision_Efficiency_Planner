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
import type { ComputedMetrics } from '../types';
import { Card, Badge } from './Shared';

interface Props {
    metricsA: ComputedMetrics;
    metricsB: ComputedMetrics;
    metricsC: ComputedMetrics;
    isOpen: boolean;
    onToggle: () => void;
}

export const ExecutiveSummary: React.FC<Props> = ({ metricsA, metricsB, metricsC, isOpen, onToggle }) => {
    const formatMoney = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const formatDelta = (val: number) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}${formatMoney(val)}`;
    };

    // Prepare data for Recharts
    const data = [
        {
            name: 'Scenario A',
            value: 0, // Baseline is always 0 relative to itself
            label: 'Baseline'
        },
        {
            name: 'Scenario B',
            value: metricsB.netMonthlySteadyState,
            label: 'Scenario B'
        },
        {
            name: 'Scenario C',
            value: metricsC.netMonthlySteadyState,
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
                                <span className="font-mono text-slate-700 dark:text-slate-300">$0</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Scenario B:</span>
                                <span className={`font-mono font-bold ${metricsB.netMonthlySteadyState >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {formatDelta(metricsB.netMonthlySteadyState)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Scenario C:</span>
                                <span className={`font-mono font-bold ${metricsC.netMonthlySteadyState >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {formatDelta(metricsC.netMonthlySteadyState)}
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
                                    tickFormatter={(value) => `$${value}`}
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    domain={[dataMin => Math.min(0, dataMin * 1.2), dataMax => Math.max(0, dataMax * 1.2)]}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const val = payload[0].value as number;
                                            return (
                                                <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg border border-slate-700">
                                                    <p className="font-bold mb-1">{payload[0].payload.name}</p>
                                                    <p className="font-mono">{formatDelta(val)}</p>
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
                                    tickFormatter={(value) => `$${value}`}
                                    stroke="#94a3b8"
                                    fontSize={12}
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
                                    <th className="px-4 py-3">Scenario B (Hire CRS)</th>
                                    <th className="px-4 py-3">Scenario C (Promote)</th>
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
