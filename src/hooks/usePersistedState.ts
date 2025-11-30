import { useState, useEffect } from 'react';

// Helper for deep merging objects (preserves defaults for missing keys)
function deepMerge(target: any, source: any): any {
    // If either is not an object (or is null/array), return source if it exists, else target
    // Arrays are usually treated as atomic replacements in this context, or we could merge them.
    // For this app, atomic array replacement is safer (e.g. riskFactors list).
    if (
        typeof target !== 'object' || target === null || Array.isArray(target) ||
        typeof source !== 'object' || source === null || Array.isArray(source)
    ) {
        return source !== undefined ? source : target;
    }

    const output = { ...target };

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
                // Both have the key, recurse if objects
                output[key] = deepMerge(target[key], source[key]);
            } else {
                // Target doesn't have it (weird case if target is default, but okay), just copy
                output[key] = source[key];
            }
        }
    }

    return output;
}

export function usePersistedState<T>(key: string, defaultValue: T) {
    // 1. Initialize state from localStorage
    const [state, setState] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                // Use deep merge to ensure new schema fields in defaultValue are preserved
                // when loading old data from localStorage.
                return deepMerge(defaultValue, parsed) as T;
            }
            return defaultValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    // 2. Write to localStorage whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState] as const;
}
