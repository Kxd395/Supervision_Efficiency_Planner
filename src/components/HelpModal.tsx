import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 flex flex-col">
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
                <div className="p-6 space-y-6">

                    {/* Section 1: Interface Overview */}
                    <section>
                        <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded text-indigo-600 dark:text-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                            </span>
                            Interface Overview
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                            The application uses a <strong>2-column layout</strong> designed to guide you from foundational data to strategic modeling:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Left Column: Financials & Demand</h4>
                                <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                                    <li>• Compensation Assumptions (wages, benefits)</li>
                                    <li>• Demand & Utilization (caseload, staffing)</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Right Column: Rules & Risk</h4>
                                <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                                    <li>• Supervision Rules (hour allocation)</li>
                                    <li>• HR & Risk Factors (transition costs)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Contextual Help System */}
                    <section>
                        <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded text-emerald-600 dark:text-emerald-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                            </span>
                            Contextual Help System
                        </h3>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
                            <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                                <strong>Look for the <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-xs">?</span> icon</strong> next to input fields. Hover or click to see:
                            </p>
                            <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <li><strong>Description:</strong> What this input represents</li>
                                <li><strong>Impact:</strong> How it affects the financial model</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <details className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <summary className="cursor-pointer p-3 font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg">
                                    Example: Fringe Benefits (%)
                                </summary>
                                <div className="p-3 pt-0 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                    <p><strong>Description:</strong> Employer costs (FICA, Health, Liability, 403b). Jefferson Standard ~35%.</p>
                                    <p><strong>Impact:</strong> Multiplies ALL base wages. $1.00 becomes $1.35.</p>
                                </div>
                            </details>
                            <details className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <summary className="cursor-pointer p-3 font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg">
                                    Example: Utilization (%)
                                </summary>
                                <div className="p-3 pt-0 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                    <p><strong>Description:</strong> Target percentage of freed time that can be converted to billable activities.</p>
                                    <p><strong>Impact:</strong> Conservative estimates (60-75%) account for admin time and scheduling gaps.</p>
                                </div>
                            </details>
                        </div>
                    </section>

                    {/* Section 3: Supervision Rules Panel */}
                    <section>
                        <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                            <span className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded text-purple-600 dark:text-purple-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                            </span>
                            Supervision Rules: "Delegation Split"
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                            This panel visually shows how supervision hours are allocated using a <strong>2-column design</strong>:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Director Load (Retained)</h4>
                                <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-2">High-cost hours the Director keeps</p>
                                <ul className="text-sm text-indigo-600 dark:text-indigo-200 space-y-1">
                                    <li>• Retained 1:1 supervision</li>
                                    <li>• Director-only groups</li>
                                    <li>• CRSS oversight time</li>
                                </ul>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-2">CRSS Load (Delegated)</h4>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-2">Efficiency hours moved to CRSS</p>
                                <ul className="text-sm text-emerald-600 dark:text-emerald-200 space-y-1">
                                    <li>• Delegated 1:1 supervision</li>
                                    <li>• CRSS-only groups</li>
                                    <li>• Co-facilitated groups</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Workflow */}
                    <section>
                        <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-2">
                            <span className="bg-rose-100 dark:bg-rose-900/30 p-1 rounded text-rose-600 dark:text-rose-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            Quick Start Workflow
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300">
                            <li>
                                <strong className="text-slate-800 dark:text-slate-100">Enter Baseline Data:</strong> Set accurate wages and benefits in the Compensation Assumptions panel
                            </li>
                            <li>
                                <strong className="text-slate-800 dark:text-slate-100">Configure Supervision Rules:</strong> Use Scenario B/C tabs to model different delegation strategies
                            </li>
                            <li>
                                <strong className="text-slate-800 dark:text-slate-100">Review Results:</strong> Check the Executive Summary dashboard for ROI metrics
                            </li>
                            <li>
                                <strong className="text-slate-800 dark:text-slate-100">Test Sensitivity:</strong> Toggle factors on/off to see best-case vs worst-case scenarios
                            </li>
                        </ol>
                    </section>

                    {/* Section 5: Metric Definitions */}
                    <section>
                        <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                            <span className="bg-amber-100 dark:bg-amber-900/30 p-1 rounded text-amber-600 dark:text-amber-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                </svg>
                            </span>
                            Key Metrics
                        </h3>
                        <div className="grid gap-3">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Hard Impact</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Real cash savings (Payroll reductions + Billed Revenue). This hits the P&L immediately.
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Soft Value</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Operational improvements (Retention + Efficiency) that don't immediately hit the bank account but add strategic value.
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Break-Even Timeline</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Number of months to recover transition costs (recruiting, onboarding, training).
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl flex justify-between items-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        See <strong>docs/USER_GUIDE.md</strong> for complete documentation
                    </p>
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
