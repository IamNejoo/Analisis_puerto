// src/contexts/MagdalenaContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { OptimizationConfig } from '../types/optimization';

interface MagdalenaContextType {
    config: OptimizationConfig;
    updateConfig: (updates: Partial<OptimizationConfig>) => void;
    setConfig: (config: OptimizationConfig) => void;
}

const MagdalenaContext = createContext<MagdalenaContextType | null>(null);

export const MagdalenaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<OptimizationConfig>({
        anio: 2022,
        semana: 1,
        participacion: 68,
        conDispersion: true
    });

    const updateConfig = useCallback((updates: Partial<OptimizationConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    }, []);

    return (
        <MagdalenaContext.Provider value={{ config, updateConfig, setConfig }}>
            {children}
        </MagdalenaContext.Provider>
    );
};

export const useMagdalenaContext = () => {
    const context = useContext(MagdalenaContext);
    if (!context) {
        throw new Error('useMagdalenaContext must be used within MagdalenaProvider');
    }
    return context;
};