import React from 'react';
import type { GlobalAssumptions } from '../types';
import { Card, SectionHeader, SteppedNumberInput, TextInput, Badge } from './Shared';

interface Props {
    assumptions: GlobalAssumptions;
    onChange: (newAssumptions: GlobalAssumptions) => void;
}

export const GlobalAssumptionsPanel: React.FC<Props> = ({ assumptions, onChange }) => {
    const handleChange = (field: keyof GlobalAssumptions, value: number) => {
        onChange({ ...assumptions, [field]: value });
    };

    return (
        <Card className="border-t-4 border-indigo-500 dark:border-indigo-400 p-6 space-y-6">
            <SectionHeader
                title="Compensation & Funding"
                subtitle="Define wages, grant offsets, and billable rates for supervisors and peers."
            />

            {/* SECTION 1: BASE WAGES (Full Width Row) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
                <h3 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-3">Base Wages (Hourly)</h3>
                <div className="grid grid-cols-3 gap-4">
                    <SteppedNumberInput
                        label="CRS Wage"
                        value={assumptions.crsBaseHourly}
                        onChange={(val) => onChange({ ...assumptions, crsBaseHourly: val })}
                        step={0.5}
                        prefix="$"
                        helpContent={{
                            description: "Hourly base rate for Frontline Certified Recovery Specialists.",
                            impact: "Determines the 'Backfill Cost' when a CRS is promoted to CRSS."
                        }}
                    />
                    <SteppedNumberInput
                        label="CRSS Wage"
                        value={assumptions.crssBaseHourly}
                        onChange={(val) => onChange({ ...assumptions, crssBaseHourly: val })}
                        step={0.5}
                        prefix="$"
                        helpContent={{
                            description: "Hourly base rate for the Lead/Supervisor Peer.",
                            impact: "Determines the 'Payroll Increase' in Scenario B & C."
                        }}
                    />
                    <SteppedNumberInput
                        label="Sup Wage"
                        value={assumptions.supervisorBaseHourly}
                        onChange={(val) => onChange({ ...assumptions, supervisorBaseHourly: val })}
                        step={0.5}
                        prefix="$"
                        helpContent={{
                            description: "Hourly base rate for Clinical Supervisors who oversee the program.",
                            impact: "Determines the 'Labor Efficiency' when freed hours are reinvested."
                        }}
                    />
                </div>
            </div>

            {/* SECTION 2: THE SPLIT GRID (2-Column Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* LEFT COLUMN: COST & GRANTS */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1">
                        Cost & Grants
                    </h3>

                    {/* A. Standard Burden */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">Standard Burden</h4>
                        <SteppedNumberInput
                            label="Fringe Benefits (%)"
                            value={Math.round(assumptions.benefitLoad * 100)}
                            onChange={(val) => onChange({ ...assumptions, benefitLoad: val / 100 })}
                            step={1}
                            suffix="%"
                            helpContent={{
                                description: "Employer costs (FICA, Health, Liability, 403b). Jefferson Standard ~35%.",
                                impact: "Multiplies ALL base wages. $1.00 becomes $1.35."
                            }}
                        />
                        <SteppedNumberInput
                            label="FTE Hours/Mo"
                            value={assumptions.fteHoursPerMonth}
                            onChange={(v) => handleChange('fteHoursPerMonth', v)}
                            suffix="hrs"
                            helpContent={{
                                description: "Standard monthly hours for a full-time employee (typically 160 hrs).",
                                impact: "Used to convert hourly wages into monthly payroll costs."
                            }}
                        />
                    </div>

                    {/* B. Grant Availability (NEW) */}
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">Grant Availability</h4>
                            <Badge label="First-In Priority" color="emerald" />
                        </div>
                        <SteppedNumberInput
                            label="Grant-Funded Slots (FTEs)"
                            value={assumptions.grantFundedSlots}
                            onChange={(v) => handleChange('grantFundedSlots', v)}
                            step={1}
                            min={0}
                            suffix="slots"
                            helpContent={{
                                description: "Number of CRSS positions fully covered by grant funding.",
                                impact: "First N hires cost $0. Additional hires are billed at full rate."
                            }}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                            💡 Hint: If set to 2, the first 2 CRSS hires have no payroll cost.
                        </p>
                    </div>
                </div>

                {/* RIGHT COLUMN: REVENUE STREAMS */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1">
                        Revenue Streams
                    </h3>

                    {/* A. Supervisor Revenue */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">Supervisor Revenue</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <SteppedNumberInput
                                label="Rate ($)"
                                value={assumptions.supervisorBillableRate}
                                onChange={(v) => handleChange('supervisorBillableRate', v)}
                                prefix="$"
                                step={5}
                                helpContent={{
                                    description: "Hourly billing rate for supervisor's clinical time (e.g., therapy sessions).",
                                    impact: "Drives the 'Realized Revenue' calculation when freed hours are billable."
                                }}
                            />
                            <SteppedNumberInput
                                label="Util %"
                                value={assumptions.utilizationPercent * 100}
                                onChange={(v) => handleChange('utilizationPercent', v / 100)}
                                suffix="%"
                                step={5}
                                helpContent={{
                                    description: "Target percentage of freed time that can be converted to billable activities.",
                                    impact: "Conservative estimates (60-75%) account for admin time and scheduling gaps."
                                }}
                            />
                        </div>
                    </div>

                    {/* B. Peer (CRSS) Revenue (NEW) */}
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">Peer (CRSS) Revenue</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                            ⭐ CRSS can now bill services
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <SteppedNumberInput
                                label="Rate ($)"
                                value={assumptions.peerBillableRate}
                                onChange={(v) => handleChange('peerBillableRate', v)}
                                prefix="$"
                                step={5}
                                helpContent={{
                                    description: "Hourly billing rate for CRSS's direct services (typically lower than supervisor).",
                                    impact: "Enables peer-led billing revenue stream."
                                }}
                            />
                            <SteppedNumberInput
                                label="Util %"
                                value={assumptions.peerUtilization * 100}
                                onChange={(v) => handleChange('peerUtilization', v / 100)}
                                suffix="%"
                                step={5}
                                min={0}
                                max={100}
                                helpContent={{
                                    description: "Percentage of CRSS time dedicated to billable activities.",
                                    impact: "Conservative default: 0%. Can be increased for hybrid models."
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3: REINVESTMENT TASK (Full Width) */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">
                    Reinvestment Task
                </h3>
                <TextInput
                    label=""
                    value={assumptions.reinvestmentTask || "Outpatient Counseling"}
                    onChange={(v) => onChange({ ...assumptions, reinvestmentTask: v })}
                    placeholder="e.g. Outpatient Counseling"
                />
            </div>
        </Card>
    );
};
