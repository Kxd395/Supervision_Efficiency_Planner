import React, { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type Section = 'guide' | 'pa' | 'cbh';

export const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [activeSection, setActiveSection] = useState<Section>('guide');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Guide & Configuration</h2>
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

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-900/50">
                    <button
                        onClick={() => setActiveSection('guide')}
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeSection === 'guide'
                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        📖 User Guide
                    </button>
                    <button
                        onClick={() => setActiveSection('pa')}
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeSection === 'pa'
                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        🏛️ PA Billing Guide
                    </button>
                    <button
                        onClick={() => setActiveSection('cbh')}
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeSection === 'cbh'
                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        🏙️ CBH (Philly)
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {activeSection === 'guide' && <GuideContent />}
                    {activeSection === 'pa' && <PABillingContent />}
                    {activeSection === 'cbh' && <CBHBillingContent />}
                </div>
            </div>
        </div>
    );
};

// Main User Guide Content
const GuideContent: React.FC = () => (
    <>
        <section>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">Getting Started</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                The <strong>Supervision Efficiency Planner</strong> is a financial modeling tool designed to help organizations
                evaluate the ROI of implementing a tiered peer supervision model.
            </p>
        </section>

        <section>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">Interface Overview</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                The application uses a <strong>2-column layout</strong>:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Left: Financials & Demand</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Compensation & Funding</li>
                        <li>• Demand & Volume</li>
                    </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Right: Rules & Risk</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Supervision Rules</li>
                        <li>• HR & Risk Factors</li>
                    </ul>
                </div>
            </div>
        </section>

        <section>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">Contextual Help System</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                Every critical input field includes a help tooltip marked with a <strong>?</strong> icon.
                Hover over these icons to see:
            </p>
            <ul className="text-slate-600 dark:text-slate-300 space-y-2 ml-4">
                <li>• <strong>Description</strong>: What this input represents</li>
                <li>• <strong>Impact</strong>: How this variable affects the model</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">Key Features</h3>

            <div className="space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-2">🆕 Grant-Funded Slots</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Configure how many CRSS positions are covered by grants. The model calculates the first N hires at $0 cost,
                        with additional hires using billable revenue offsets.
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">🆕 Peer (CRSS) Revenue</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Model scenarios where peers can bill services directly (e.g., H0038 peer support).
                        Set your local billing rate and expected utilization percentage.
                    </p>
                </div>
            </div>
        </section>

        <section>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">Best Practices</h3>
            <ul className="text-slate-600 dark:text-slate-300 space-y-2 ml-4">
                <li>• <strong>Start with accurate baseline data</strong> - Enter current wages precisely</li>
                <li>• <strong>Be conservative with revenue</strong> - Use 60-70% utilization for initial models</li>
                <li>• <strong>Model multiple scenarios</strong> - Test different wage levels and supervision ratios</li>
                <li>• <strong>Use the tooltips</strong> - Review the ? icons to understand cause-and-effect</li>
            </ul>
        </section>

        <section className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2">💡 Regional Configuration</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
                Use the <strong>PA Billing Guide</strong> and <strong>CBH (Philly)</strong> tabs above for region-specific
                billing rates and compliance requirements.
            </p>
        </section>
    </>
);

// Pennsylvania Billing Guide
const PABillingContent: React.FC = () => (
    <>
        <section>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">Pennsylvania Billing Benchmarks</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Region: Pennsylvania (HealthChoices / PROMISe / Medicare) | Last Updated: November 2024
            </p>
        </section>

        <section>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">1. Peer Support (CRSS) Settings</h4>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-300 dark:border-slate-600">
                            <th className="text-left py-2 text-slate-700 dark:text-slate-300">Input Field</th>
                            <th className="text-left py-2 text-slate-700 dark:text-slate-300">Recommended Value</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-2">Billable Rate ($)</td>
                            <td className="py-2 font-semibold text-indigo-600 dark:text-indigo-400">$54.00/hr</td>
                        </tr>
                        <tr>
                            <td className="py-2">Utilization (%)</td>
                            <td className="py-2 font-semibold text-indigo-600 dark:text-indigo-400">40% - 50%</td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                    <strong>Code H0038</strong>: Avg. rate $13.50 per unit (15 mins) × 4 = $54/hr
                </p>
            </div>
        </section>

        <section>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">2. Clinical Supervisor Settings</h4>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-300 dark:border-slate-600">
                            <th className="text-left py-2 text-slate-700 dark:text-slate-300">Approach</th>
                            <th className="text-left py-2 text-slate-700 dark:text-slate-300">Rate</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-2">Conservative</td>
                            <td className="py-2 font-semibold text-indigo-600 dark:text-indigo-400">$131/hr</td>
                        </tr>
                        <tr>
                            <td className="py-2">Aggressive (Blended)</td>
                            <td className="py-2 font-semibold text-indigo-600 dark:text-indigo-400">$150/hr</td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                    <strong>Code 90837</strong>: 60-min therapy session. Utilization: 60-75%
                </p>
            </div>
        </section>

        <section>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">3. Hybrid Funding Example</h4>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-indigo-900 dark:text-indigo-100 mb-2">
                    <strong>Scenario:</strong> County grant covers 2 FTE peers, you want to hire 4 total.
                </p>
                <ol className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1 ml-4">
                    <li>1. Set <strong>Grant-Funded Slots</strong> = 2</li>
                    <li>2. Set <strong>Peer Billable Rate</strong> = $54</li>
                    <li>3. Result: First 2 hires cost $0, next 2 use $54/hr offset</li>
                </ol>
            </div>
        </section>
    </>
);

// CBH (Philadelphia) Billing Guide
const CBHBillingContent: React.FC = () => (
    <>
        <section>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">CBH (Philadelphia) Configuration</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Community Behavioral Health (CBH) | Philadelphia County | Last Updated: November 2024
            </p>
        </section>

        <section>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">1. Peer Support (CPS) Settings</h4>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 mb-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-emerald-300 dark:border-emerald-700">
                            <th className="text-left py-2 text-emerald-900 dark:text-emerald-100">Input Field</th>
                            <th className="text-left py-2 text-emerald-900 dark:text-emerald-100">CBH Value</th>
                        </tr>
                    </thead>
                    <tbody className="text-emerald-800 dark:text-emerald-200">
                        <tr className="border-b border-emerald-200 dark:border-emerald-800">
                            <td className="py-2">Billable Rate ($)</td>
                            <td className="py-2 font-bold">$55.00/hr</td>
                        </tr>
                        <tr>
                            <td className="py-2">Utilization (%)</td>
                            <td className="py-2 font-bold">40% - 45%</td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-3">
                    <strong>Code H0038</strong>: $13.75/unit × 4 = $55/hr (CBH standard)
                </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-1">⚠️ CBH Compliance</p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• CBH audits H0038 heavily - ensure medical necessity documentation</li>
                    <li>• 16-unit daily cap per member (4 hours max)</li>
                    <li>• Weekly supervision required (minimum 1 hour individual)</li>
                </ul>
            </div>
        </section>

        <section>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">2. Clinical Supervisor Settings</h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-blue-300 dark:border-blue-700">
                            <th className="text-left py-2 text-blue-900 dark:text-blue-100">Setting</th>
                            <th className="text-left py-2 text-blue-900 dark:text-blue-100">CBH Value</th>
                        </tr>
                    </thead>
                    <tbody className="text-blue-800 dark:text-blue-200">
                        <tr className="border-b border-blue-200 dark:border-blue-800">
                            <td className="py-2">Billable Rate ($)</td>
                            <td className="py-2 font-bold">$135/hr</td>
                        </tr>
                        <tr>
                            <td className="py-2">Utilization (%)</td>
                            <td className="py-2 font-bold">65%</td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                    <strong>Code 90837</strong>: CBH standard ($130-$140 range)
                </p>
            </div>
        </section>

        <section>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">3. DBHIDS Grant Integration</h4>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-900 dark:text-purple-100 mb-3">
                    <strong>Gap Fill Strategy:</strong> Layer DBHIDS grants with CBH billing
                </p>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                    <li>• Set <strong>Grant Slots</strong> = Number of DBHIDS-funded FTEs</li>
                    <li>• Model applies CBH revenue ($55/hr) to additional staff</li>
                    <li>• Common for homeless outreach or program startup initiatives</li>
                </ul>
            </div>
        </section>

        <section>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">4. Common Audit Triggers</h4>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs font-semibold text-red-900 dark:text-red-100 mb-2">🚨 Watch Out For:</p>
                <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                    <li>• Billing over 20 units/day across all members</li>
                    <li>• Missing weekly supervision documentation</li>
                    <li>• Vague progress notes without treatment plan linkage</li>
                    <li>• Duplicate billing with other providers (same member/date)</li>
                </ul>
            </div>
        </section>

        <section>
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">5. Quick Reference</h4>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-300 dark:border-slate-600">
                            <th className="text-left py-2 text-slate-700 dark:text-slate-300">UI Label</th>
                            <th className="text-left py-2 text-slate-700 dark:text-slate-300">CBH Value</th>
                            <th className="text-left py-2 text-slate-700 dark:text-slate-300">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-2">Peer Billable Rate</td>
                            <td className="py-2 font-mono">$55</td>
                            <td className="py-2">H0038 @ $13.75/unit</td>
                        </tr>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-2">Sup. Billable Rate</td>
                            <td className="py-2 font-mono">$135</td>
                            <td className="py-2">90837</td>
                        </tr>
                        <tr>
                            <td className="py-2">Internal Max Ratio</td>
                            <td className="py-2 font-mono">1:7</td>
                            <td className="py-2">CBH prefers tighter than state 1:10</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </>
);
