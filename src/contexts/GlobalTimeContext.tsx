// src/contexts/GlobalTimeContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { TimeGranularity } from '../components/dashboard/MinimalTimeNavigator';

interface TimeRange {
    start: Date;
    end: Date;
    granularity: TimeGranularity;
}

interface GlobalTimeContextType {
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
    updateTime: (start: Date, end: Date, granularity: TimeGranularity) => void;
}

const GlobalTimeContext = createContext<GlobalTimeContextType | null>(null);

export const GlobalTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>({
        start: new Date('2022-01-01T00:00:00'),
        end: new Date('2022-01-01T23:59:59'),
        granularity: 'day'
    });

    const updateTime = useCallback((start: Date, end: Date, granularity: TimeGranularity) => {
        setTimeRange({ start, end, granularity });
    }, []);

    return (
        <GlobalTimeContext.Provider value={{ timeRange, setTimeRange, updateTime }}>
            {children}
        </GlobalTimeContext.Provider>
    );
};

export const useGlobalTime = () => {
    const context = useContext(GlobalTimeContext);
    if (!context) {
        throw new Error('useGlobalTime must be used within GlobalTimeProvider');
    }
    return context;
};