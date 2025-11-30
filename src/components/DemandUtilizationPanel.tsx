import React from 'react';
import type { DemandAssumptions } from '../types';
import { Card, SectionHeader, SteppedNumberInput } from './Shared';

interface Props {
    assumptions: DemandAssumptions;
    onChange: (newAssumptions: DemandAssumptions) => void;
}

export const DemandUtilizationPanel: React.FC<Props> = ({ assumptions, onChange }) => {
    const handleChange = (field: keyof DemandAssumptions, value: number | string) => {
        onChange({ ...assumptions, [field]: value });
    };

    return (
        <Card className="p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 h-full">
            <SectionHeader title="Demand & Volume" subtitle="Caseload drivers and operational timelines." />

            <div className="space-y-6">
                {/* SECTION 1: Caseload Drivers */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-xs uppercase tracking-wider">
                        Caseload Drivers
                    </h3>
                    <SteppedNumberInput
                        label="Active Waitlist (Count)"
                        value={assumptions.activeWaitlist}
                        onChange={(v) => handleChange('activeWaitlist', v)}
                        step={5}
                        min={0}
                        helpContent={{
                            description: "Number of clients currently waiting for services.",
                            impact: "Indicates demand pressure and potential for capacity utilization."
                        }}
                    />
                    <SteppedNumberInput
                        label="New Referrals / Month (Count)"
                        value={assumptions.newReferralsPerMonth}
                        onChange={(v) => handleChange('newReferralsPerMonth', v)}
                        step={5}
                        min={0}
                        helpContent={{
                            description: "Average monthly incoming referrals.",
                            impact: "Determines ongoing caseload growth rate."
                        }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <SteppedNumberInput
                            label="Days to Auth"
                            value={assumptions.avgDaysReferralToAuth}
                            onChange={(v) => handleChange('avgDaysReferralToAuth', v)}
                            suffix="days"
                            min={0}
                            helpContent={{
                                description: "Average time from referral to insurance authorization.",
                                impact: "Affects time-to-service and capacity planning."
                            }}
                        />
                        <SteppedNumberInput
                            label="Days to Session"
                            value={assumptions.avgDaysAuthToSession}
                            onChange={(v) => handleChange('avgDaysAuthToSession', v)}
                            suffix="days"
                            min={0}
                            helpContent={{
                                description: "Average time from authorization to first session.",
                                impact: "Affects client flow and utilization ramp-up."
                            }}
                        />
                    </div>
                </div>

                {/* SECTION 2: Operational Speed */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-xs uppercase tracking-wider">
                        Operational Speed
                    </h3>
                    <SteppedNumberInput
                        label="New Hire Ramp Up (Months)"
                        value={assumptions.rampUpMonths}
                        onChange={(v) => handleChange('rampUpMonths', v)}
                        suffix="months"
                        min={1}
                        max={12}
                        helpContent={{
                            description: "Months for a new hire to reach full productivity.",
                            impact: "Affects break-even timeline for new hires."
                        }}
                    />

                    {/* Funding Source Label */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Funding Source Label
                        </label>
                        <select
                            value={assumptions.fundingLabel}
                            onChange={(e) => handleChange('fundingLabel', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                        >
                            <option value="Billable">Billable</option>
                            <option value="Grant">Grant</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Categorize primary funding mechanism  for reporting purposes.
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
