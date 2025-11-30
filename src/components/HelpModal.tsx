import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Guide</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">How to use the Supervision Efficiency Planner</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">

                    {/* Section 1: The Goal */}
                    <section>
                        <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded text-indigo-600 dark:text-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                            </span>
                            1. The Goal
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Model the financial impact of shifting supervision from Clinical Supervisors (High Cost) to Lead Peers (Lower Cost).
                            This tool helps you calculate the "Arbitrage" (Cost Savings) and "Revenue Opportunity" (Billable Hours) of this transition.
                        </p>
                    </section>

                    {/* Section 2: Workflow */}
                    <section>
                        <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded text-emerald-600 dark:text-emerald-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            2. Workflow
                        </h3>
                        <ol className="list-decimal list-inside space-y-3 text-slate-600 dark:text-slate-300 ml-1">
                            <li>
                                <strong className="text-slate-800 dark:text-slate-100">Set Wages:</strong> Open Settings (Gear Icon) to match your local market rates.
                            </li>
                            <li>
                                <strong className="text-slate-800 dark:text-slate-100">Adjust Drivers:</strong> Use the Control Deck to set Utilization, Caseloads, and Supervision Rules.
                            </li>
                            <li>
                                <strong className="text-slate-800 dark:text-slate-100">Stress Test:</strong> Use the 'Sensitivity Analysis' toggles to see the Worst Case vs. Best Case scenarios.
                            </li>
                        </ol>
                    </section>

                    {/* Section 3: Metric Definitions */}
                    <section>
                        <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-2">
                            <span className="bg-rose-100 dark:bg-rose-900/30 p-1 rounded text-rose-600 dark:text-rose-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                            </span>
                            3. Metric Definitions
                        </h3>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Hard Impact</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Real cash savings (Payroll reductions + Billed Revenue). This hits the P&L immediately.
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Soft Value</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Operational improvements (Retention + Efficiency) that don't immediately hit the bank account but add value.
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Strategic Investment</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    A scenario that costs money upfront but stabilizes operations and reduces long-term risk.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Close Guide
                    </button>
                </div>
            </div>
        </div>
    );
};
