import React from 'react';
import type { HRRiskAssumptions } from '../types';
import { Card, SteppedNumberInput } from './Shared';

interface Props {
    assumptions: HRRiskAssumptions;
    onChange: (newAssumptions: HRRiskAssumptions) => void;
}

export const HRRiskPanel: React.FC<Props> = ({ assumptions, onChange }) => {
    const handleChange = (field: keyof HRRiskAssumptions, value: number) => {
        onChange({ ...assumptions, [field]: value });
    };

    return (
        <Card className="border-t-4 border-rose-500 dark:border-rose-400 p-6">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-rose-500 dark:text-rose-400">⚠️</span>
                    HR & Risk Factors
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Model the hidden costs of turnover, onboarding timelines, and aggressive promotion.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* === LEFT COLUMN: HR DYNAMICS === */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider border-b border-indigo-100 dark:border-indigo-900/50 pb-2">
                        HR Dynamics (Time & Rates)
                    </h3>

                    {/* Sub-Group: Promotion */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Promotion & Timeline</h4>
                        <SteppedNumberInput
                            label="Typical Promotion Raise ($)"
                            value={assumptions.promotionRaisePerHour}
                            onChange={(v) => handleChange('promotionRaisePerHour', v)}
                            step={0.5}
                            prefix="$"
                        />
                        <SteppedNumberInput
                            label="Credentialing Lag (Months)"
                            value={assumptions.credentialingMonths}
                            onChange={(v) => handleChange('credentialingMonths', v)}
                            suffix="mo"
                        />
                    </div>

                    {/* Sub-Group: Recruiting Time */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recruiting Speed</h4>
                        <SteppedNumberInput
                            label="CRS Recruit Time (Months)"
                            value={assumptions.recruitRampMonthsCRS}
                            onChange={(v) => handleChange('recruitRampMonthsCRS', v)}
                            suffix="mo"
                        />
                        <SteppedNumberInput
                            label="CRSS Recruit Time (Months)"
                            value={assumptions.recruitRampMonthsCRSS}
                            onChange={(v) => handleChange('recruitRampMonthsCRSS', v)}
                            suffix="mo"
                        />
                    </div>
                </div>

                {/* === RIGHT COLUMN: FINANCIAL RISK === */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider border-b border-rose-100 dark:border-rose-900/50 pb-2">
                        Financial Impact ($ & Limits)
                    </h3>

                    {/* Sub-Group: Costs */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">One-Time Costs</h4>
                        <SteppedNumberInput
                            label="CRS Onboarding Cost ($)"
                            value={assumptions.onboardingCostCRS}
                            onChange={(v) => handleChange('onboardingCostCRS', v)}
                            step={100}
                            prefix="$"
                        />
                        <SteppedNumberInput
                            label="CRSS Onboarding Cost ($)"
                            value={assumptions.onboardingCostCRSS}
                            onChange={(v) => handleChange('onboardingCostCRSS', v)}
                            step={100}
                            prefix="$"
                        />
                        <SteppedNumberInput
                            label="Turnover Cost ($/Departure)"
                            value={assumptions.turnoverCostPerDeparture ?? 5000}
                            onChange={(v) => handleChange('turnoverCostPerDeparture', v)}
                            step={500}
                            prefix="$"
                        />
                    </div>

                    {/* Sub-Group: Safety Valve */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Sensitivity</h4>
                        <SteppedNumberInput
                            label="Turnover Risk Threshold (Ratio)"
                            value={assumptions.turnoverRiskThreshold}
                            onChange={(v) => handleChange('turnoverRiskThreshold', v)}
                            step={0.5}
                        />
                    </div>
                </div>

            </div>
        </Card>
    );
};
