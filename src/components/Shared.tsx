import React from 'react';

// --- Reusable Components ---

export const HelpTooltip: React.FC<{ text?: string; content?: { description: string; impact: string } }> = ({ text, content }) => (
    <span className="group relative inline-block ml-1 cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg shadow-xl z-50 overflow-hidden border border-slate-700 dark:border-slate-600">
            {content ? (
                <>
                    <div className="p-3 bg-slate-800 dark:bg-slate-700 text-slate-200">
                        {content.description}
                    </div>
                    <div className="p-2 bg-slate-900/50 border-t border-slate-700/50 text-indigo-300 font-medium">
                        <span className="text-slate-500 uppercase text-[10px] tracking-wider font-bold mr-1">Impact:</span>
                        {content.impact}
                    </div>
                </>
            ) : (
                <div className="p-3 bg-slate-800 dark:bg-slate-700 text-slate-200 text-center">
                    {text}
                </div>
            )}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/50"></span>
        </div>
    </span>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
);

export const NumberInput: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    disabled?: boolean;
    className?: string;
}> = ({ label, value, onChange, min, max, step, prefix, suffix, disabled, className }) => (
    <div className={`flex flex-col ${className}`}>
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
        <div className="relative flex items-center">
            {prefix && <span className="absolute left-3 text-slate-400 dark:text-slate-500 text-sm">{prefix}</span>}
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className={`w-full min-w-0 bg-transparent border-none text-right focus:ring-0 p-0 text-sm font-mono text-slate-900 dark:text-slate-100 ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-8' : ''}`}
            />
            {suffix && <span className="absolute right-3 text-slate-400 dark:text-slate-500 text-sm">{suffix}</span>}
        </div>
    </div>
);

export const Badge: React.FC<{ label: string; color?: 'indigo' | 'emerald' | 'rose' | 'slate' | 'amber' | 'blue' }> = ({ label, color = 'slate' }) => {
    const colors = {
        indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        rose: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[color]}`}>
            {label}
        </span>
    );
};

export const SteppedNumberInput: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    disabled?: boolean;
    className?: string;
    helpContent?: { description: string; impact: string };
    inputWrapperClassName?: string;
}> = ({ label, value, onChange, min = 0, max, step = 1, prefix, suffix, disabled, className, helpContent, inputWrapperClassName }) => {
    const handleStep = (direction: -1 | 1) => {
        if (disabled) return;
        const newValue = value + (step * direction);
        if (min !== undefined && newValue < min) return;
        if (max !== undefined && newValue > max) return;
        onChange(Number(newValue.toFixed(2))); // Avoid floating point errors
    };

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex items-center mb-1">
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    {label}
                </label>
                {helpContent && <HelpTooltip content={helpContent} />}
            </div>
            <div className={`flex w-full items-center justify-between border border-slate-300 dark:border-slate-700 rounded-md h-9 overflow-hidden ${inputWrapperClassName || 'bg-slate-50 dark:bg-slate-900'}`}>
                {/* Decrement Button */}
                <button
                    onClick={() => handleStep(-1)}
                    disabled={disabled || (min !== undefined && value <= min)}
                    className="w-8 h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 cursor-pointer border-r border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    -
                </button>

                {/* Input Area */}
                <div className="flex-1 relative flex items-center justify-center px-2">
                    {prefix && <span className="text-slate-500 dark:text-slate-400 text-xs mr-1 font-medium">{prefix}</span>}
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        min={min}
                        max={max}
                        step={step}
                        disabled={disabled}
                        className="w-full text-center bg-transparent border-none focus:ring-0 p-0 text-sm font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                    {suffix && <span className="text-slate-500 dark:text-slate-400 text-xs ml-1 font-medium">{suffix}</span>}
                </div>

                {/* Increment Button */}
                <button
                    onClick={() => handleStep(1)}
                    disabled={disabled || (max !== undefined && value >= max)}
                    className="w-8 h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 cursor-pointer border-l border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    +
                </button>
            </div>
        </div>
    );
};

export const TextInput: React.FC<{
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}> = ({ label, value, onChange, placeholder, disabled, className }) => {
    return (
        <div className={`flex flex-col ${className}`}>
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
                {label}
            </label>
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden h-9 px-3">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full bg-transparent border-none text-left focus:ring-0 p-0 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
            </div>
        </div>
    );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300 ${className}`}>
        {children}
    </div>
);
