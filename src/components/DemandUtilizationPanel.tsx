import React from 'react';
import type { DemandAssumptions, GlobalAssumptions } from '../types';
import { Card, SectionHeader, SteppedNumberInput } from './Shared';

interface Props {
    assumptions: DemandAssumptions;
    globalAssumptions: GlobalAssumptions;
    onChange: (newAssumptions: DemandAssumptions) => void;
    onChangeGlobal: (newAssumptions: GlobalAssumptions) => void;
}

export const DemandUtilizationPanel: React.FC<Props> = ({ assumptions, globalAssumptions, onChange, onChangeGlobal }) => {
    const handleChange = (field: keyof DemandAssumptions, value: number) => {
        onChange({ ...assumptions, [field]: value });
    };

    return (
        <Card className="p-4 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 h-full">
            <SectionHeader title="Demand & Utilization" subtitle="Volume drivers and efficiency targets." />

            <div className="space-y-6">
                {/* Caseload Drivers */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-xs uppercase tracking-wider">Caseload Drivers</h3>
                    <SteppedNumberInput
                        label="Active Waitlist"
                        value={assumptions.activeWaitlist}
                        onChange={(v) => handleChange('activeWaitlist', v)}
                        step={5}
                    />
                    <SteppedNumberInput
                        label="New Referrals / Month"
                        value={assumptions.newReferralsPerMonth}
                        onChange={(v) => handleChange('newReferralsPerMonth', v)}
                        step={5}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <SteppedNumberInput
                            label="Days to Auth"
                            value={assumptions.avgDaysReferralToAuth}
                            onChange={(v) => handleChange('avgDaysReferralToAuth', v)}
                            suffix="days"
                        />
                        <SteppedNumberInput
                            label="Days to Session"
                            value={assumptions.avgDaysAuthToSession}
                            onChange={(v) => handleChange('avgDaysAuthToSession', v)}
                            suffix="days"
                        />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Funding Source</span>
                        <div className="flex bg-slate-100 dark:bg-slate-900 rounded p-1">
                            <button
                                onClick={() => onChange({ ...assumptions, fundingSource: 'Billable' })}
                                className={`px-3 py-1 text-xs rounded ${assumptions.fundingSource === 'Billable' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
                            >
                                Billable
                            </button>
                            <button
                                onClick={() => onChange({ ...assumptions, fundingSource: 'Grant' })}
                                className={`px-3 py-1 text-xs rounded ${assumptions.fundingSource === 'Grant' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
                            >
                                Grant
                            </button>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-slate-700 my-4" />

                {/* Efficiency & Revenue */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-xs uppercase tracking-wider">Efficiency & Revenue</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <SteppedNumberInput
                            label="Utilization %"
                            value={Math.round(globalAssumptions.utilizationPercent * 100)}
                            onChange={(val) => onChangeGlobal({ ...globalAssumptions, utilizationPercent: val / 100 })}
                            step={5}
                            suffix="%"
                            helpContent={{
                                description: "The % of freed Supervisor time actually spent on billable tasks.",
                                impact: "Reduces Revenue. 10 freed hours @ 75% = 7.5 Billable Hours."
                            }}
                        />
                        <SteppedNumberInput
                            label="Billable Rate"
                            value={globalAssumptions.supervisorBillableRate}
                            onChange={(val) => onChangeGlobal({ ...globalAssumptions, supervisorBillableRate: val })}
                            step={5}
                            prefix="$"
                            helpContent={{
                                description: "Revenue generated per hour of Outpatient Counseling.",
                                impact: "Primary driver of the 'Value Generated' metric."
                            }}
                        />
                    </div>
                    <SteppedNumberInput
                        label="Ramp Up Time"
                        value={assumptions.rampMonths}
                        onChange={(v) => handleChange('rampMonths', v)}
                        suffix="months"
                    />
                </div>
            </div>
        </Card>
    );
};
