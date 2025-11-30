import { useState, useEffect } from 'react';

export function usePersistedState<T>(key: string, defaultValue: T) {
    // 1. Initialize state from localStorage
    const [state, setState] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                // Deep merge-ish: Ensure keys from default exist if missing in parsed
                // This prevents crashes when we add new fields (like tieredB/C)
                return { ...defaultValue, ...parsed };
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
