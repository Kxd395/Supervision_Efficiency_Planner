import React from 'react';

interface MathExplainerProps {
    label: string;
    value: string; // The formatted money string (e.g. "+$303")
    formula: string; // e.g. "(Supervisor Rate - CRSS Rate) * Hours"
    math: string; // e.g. "($60.75 - $37.80) * 13.6"
    description: string;
}

export const MathExplainer: React.FC<MathExplainerProps> = ({ label, value, formula, math, description }) => {
    return (
        <div className="group relative flex justify-between items-center w-full py-1 border-b border-dashed border-slate-200 dark:border-slate-700 last:border-0">
            <div className="flex items-center gap-1 cursor-help">
                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 text-sm">
                    {label}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 opacity-50 hover:opacity-100">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                </span>

                {/* The Hover Card */}
                <div className="absolute left-0 bottom-6 z-50 hidden group-hover:block w-64 p-3 bg-slate-900 border border-slate-700 rounded shadow-xl text-xs text-slate-200">
                    <p className="font-bold text-white mb-1">{label}</p>
                    <p className="text-slate-400 italic mb-2">{description}</p>
                    <div className="bg-slate-950 p-2 rounded font-mono space-y-1">
                        <div className="text-slate-500 text-[10px] uppercase">Formula</div>
                        <div className="text-slate-300">{formula}</div>
                        <div className="border-t border-slate-800 my-1"></div>
                        <div className="text-slate-500 text-[10px] uppercase">Trace</div>
                        <div className="text-emerald-400">{math}</div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                </div>
            </div>
            <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400 text-sm">{value}</span>
        </div>
    );
};
