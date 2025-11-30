import React from 'react';
import type { HRRiskAssumptions } from '../types';
import { Card, SectionHeader, SteppedNumberInput } from './Shared';

interface Props {
    assumptions: HRRiskAssumptions;
    onChange: (newAssumptions: HRRiskAssumptions) => void;
}

export const HRRiskPanel: React.FC<Props> = ({ assumptions, onChange }) => {
    const handleChange = (field: keyof HRRiskAssumptions, value: number) => {
        onChange({ ...assumptions, [field]: value });
    };

    return (
        <Card className="border-t-4 border-rose-500 dark:border-rose-400 p-5">
            <SectionHeader
                title="HR & Risk Factors"
                subtitle="Model the hidden costs of turnover, onboarding, and aggressive promotion."
            />

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: Economics & Costs */}
                <div className="space-y-8">
                    {/* Promotion Economics */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-sm">Promotion Economics</h3>
                        <SteppedNumberInput
                            label="Typical Promotion Raise ($)"
                            value={assumptions.promotionRaisePerHour}
                            onChange={(v) => handleChange('promotionRaisePerHour', v)}
                            step={0.5}
                            className="w-full"
                        />
                        <SteppedNumberInput
                            label="Credentialing Lag (Months)"
                            value={assumptions.credentialingMonths}
                            onChange={(v) => handleChange('credentialingMonths', v)}
                            className="w-full"
                        />
                    </div>

                    {/* One-Time Costs */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-sm">One-Time Costs</h3>
                        <SteppedNumberInput
                            label="CRS Onboarding Cost ($)"
                            value={assumptions.onboardingCostCRS}
                            onChange={(v) => handleChange('onboardingCostCRS', v)}
                            step={100}
                            className="w-full"
                        />
                        <SteppedNumberInput
                            label="CRSS Onboarding Cost ($)"
                            value={assumptions.onboardingCostCRSS}
                            onChange={(v) => handleChange('onboardingCostCRSS', v)}
                            step={100}
                            className="w-full"
                        />
                        <SteppedNumberInput
                            label="Turnover Cost ($ Per Departure)"
                            value={assumptions.turnoverCostPerDeparture ?? 5000}
                            onChange={(v) => handleChange('turnoverCostPerDeparture', v)}
                            step={500}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Right Column: Hiring & Risk */}
                <div className="space-y-8">
                    {/* Hiring & Onboarding */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-sm">Hiring & Onboarding</h3>
                        <SteppedNumberInput
                            label="CRS Recruit Time (Months)"
                            value={assumptions.recruitRampMonthsCRS}
                            onChange={(v) => handleChange('recruitRampMonthsCRS', v)}
                            className="w-full"
                        />
                        <SteppedNumberInput
                            label="CRSS Recruit Time (Months)"
                            value={assumptions.recruitRampMonthsCRSS}
                            onChange={(v) => handleChange('recruitRampMonthsCRSS', v)}
                            className="w-full"
                        />
                    </div>

                    {/* Risk Sensitivity */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-1 text-sm">Risk Sensitivity</h3>
                        <SteppedNumberInput
                            label="Turnover Risk Threshold (Ratio)"
                            value={assumptions.turnoverRiskThreshold}
                            onChange={(v) => handleChange('turnoverRiskThreshold', v)}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};
