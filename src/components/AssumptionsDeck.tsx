import React from 'react';
import type { GlobalAssumptions, DemandAssumptions, SupervisionRules, HRRiskAssumptions, EnabledFactors } from '../types';
import { GlobalAssumptionsPanel } from './GlobalAssumptionsPanel';
import { DemandUtilizationPanel } from './DemandUtilizationPanel';
import { SupervisionRulesPanel } from './SupervisionRulesPanel';
import { HRRiskPanel as HRRiskAssumptionsPanel } from './HRRiskPanel';


interface Props {
    isOpen: boolean;
    onToggle: () => void;
    globalAssumptions: GlobalAssumptions;
    setGlobalAssumptions: (val: GlobalAssumptions) => void;
    demandAssumptions: DemandAssumptions;
    setDemandAssumptions: (val: DemandAssumptions) => void;
    supervisionRules: SupervisionRules;
    setSupervisionRules: (val: SupervisionRules) => void;
    hrRiskAssumptions: HRRiskAssumptions;
    setHrRiskAssumptions: (val: HRRiskAssumptions) => void;
    enabledFactors: EnabledFactors;
    setEnabledFactors: (val: EnabledFactors) => void;
}



export const AssumptionsDeck: React.FC<Props> = ({
    isOpen,
    onToggle,
    globalAssumptions,
    setGlobalAssumptions,
    demandAssumptions,
    setDemandAssumptions,
    supervisionRules,
    setSupervisionRules,
    hrRiskAssumptions,
    setHrRiskAssumptions,

}) => {
    if (!isOpen) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" onClick={onToggle}>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded">1</span>
                    Assumptions Control Deck
                </h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">[+] Show Inputs</span>
            </div>
        );
    }

    const renderGlobal = () => (
        <GlobalAssumptionsPanel
            assumptions={globalAssumptions}
            onChange={setGlobalAssumptions}
        />
    );

    const renderDemand = () => (
        <DemandUtilizationPanel
            assumptions={demandAssumptions}
            onChange={setDemandAssumptions}
        />
    );

    const renderRules = () => (
        <SupervisionRulesPanel
            rules={supervisionRules}
            onChange={setSupervisionRules}
        />
    );

    const renderHR = () => (
        <HRRiskAssumptionsPanel
            assumptions={hrRiskAssumptions}
            onChange={setHrRiskAssumptions}
        />
    );

    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header Bar */}
            <div className="bg-slate-800 dark:bg-slate-950 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700">
                <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
                    <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded">1</span>
                    <h2 className="text-lg font-bold text-white">Assumptions Control Deck</h2>
                </div>



                <button onClick={onToggle} className="text-slate-400 hover:text-white text-sm hidden md:block">
                    [-] Hide Inputs
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* === LEFT COLUMN: FINANCIALS & DEMAND === */}
                <div className="space-y-6">
                    {/* 1. Compensation (Top Left) */}
                    {renderGlobal()}

                    {/* 2. Demand & Utilization (Moved to Bottom Left) */}
                    {renderDemand()}
                </div>

                {/* === RIGHT COLUMN: RULES & RISK === */}
                <div className="space-y-6">
                    {/* 3. Supervision Rules (Top Right) */}
                    {renderRules()}

                    {/* 4. HR & Risk Factors (Bottom Right) */}
                    {renderHR()}
                </div>
            </div>
        </div>
    );
};
