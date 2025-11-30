import React from 'react';
import type { GlobalAssumptions } from '../types';
import { Card, SectionHeader, SteppedNumberInput, TextInput } from './Shared';

interface Props {
    assumptions: GlobalAssumptions;
    onChange: (newAssumptions: GlobalAssumptions) => void;
}

export const GlobalAssumptionsPanel: React.FC<Props> = ({ assumptions, onChange }) => {
    const handleChange = (field: keyof GlobalAssumptions, value: number) => {
        onChange({ ...assumptions, [field]: value });
    };

    return (
        <Card className="border-t-4 border-indigo-500 dark:border-indigo-400">
            <SectionHeader
                title="Compensation Assumptions"
                subtitle="These defaults apply to all scenarios unless explicitly overridden."
            />

            <div className="flex flex-col gap-6">
                {/* Wages */}
                <div className="space-y-5">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-xs uppercase tracking-wider">Base Wages (Hourly)</h3>
                    <div className="grid grid-cols-2 gap-4">
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
                            label="Supervisor Wage"
                            value={assumptions.supervisorBaseHourly}
                            onChange={(val) => onChange({ ...assumptions, supervisorBaseHourly: val })}
                            step={0.5}
                            prefix="$"
                        />
                    </div>
                </div>

                {/* Load & FTE */}
                <div className="space-y-5">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-xs uppercase tracking-wider">Burden & Hours</h3>
                    {/* Burden Rate */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fringe Benefits</h4>
                        </div>
                        <SteppedNumberInput
                            label="Burden Rate"
                            value={Math.round(assumptions.benefitLoad * 100)}
                            onChange={(val) => onChange({ ...assumptions, benefitLoad: val / 100 })}
                            step={1}
                            suffix="%"
                            helpContent={{
                                description: "Employer costs (FICA, Health, Liability, 403b). Jefferson Standard ~35%.",
                                impact: "Multiplies ALL base wages. $1.00 becomes $1.35."
                            }}
                        />
                    </div>
                    <SteppedNumberInput
                        label="FTE Hours / Month"
                        value={assumptions.fteHoursPerMonth}
                        onChange={(v) => handleChange('fteHoursPerMonth', v)}
                        suffix="hrs"
                    />
                </div>

                {/* Revenue Potential */}
                <div className="space-y-5">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-xs uppercase tracking-wider">Revenue Factors</h3>
                    <SteppedNumberInput
                        label="Supervisor Billable Rate"
                        value={assumptions.supervisorBillableRate}
                        onChange={(v) => handleChange('supervisorBillableRate', v)}
                        prefix="$"
                    />
                    <SteppedNumberInput
                        label="Target Utilization"
                        value={assumptions.utilizationPercent * 100}
                        onChange={(v) => handleChange('utilizationPercent', v / 100)}
                        suffix="%"
                        step={5}
                    />
                    <div className="pt-2 mt-2">
                        <TextInput
                            label="Reinvestment Task"
                            value={assumptions.reinvestmentTask || "Outpatient Counseling"}
                            onChange={(v) => onChange({ ...assumptions, reinvestmentTask: v })}
                            placeholder="e.g. Outpatient Counseling"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};
