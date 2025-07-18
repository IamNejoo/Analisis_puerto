// src/hooks/useSharedPortData.ts - VERSIÓN FINAL CORREGIDA
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTimeContext } from '../contexts/TimeContext';
import { useViewNavigation } from '../contexts/ViewNavigationContext';
import { portApi, type KPIFilters } from '../services/portApi';
import type { CorePortKPIs, PortMovementData } from '../types/portKpis';
import {
    getISOWeekDateRange,
    getISOWeekNumber,
    getISOYear
} from '../utils/isoWeekUtils';

// Estado compartido (singleton)
let sharedState: {
    kpis: CorePortKPIs | null;
    movements: PortMovementData[];
    isLoading: boolean;
    error: string | null;
    lastFetch: string;
    lastFetchTime: number;
    subscribers: Set<() => void>;
} = {
    kpis: null,
    movements: [],
    isLoading: false,
    error: null,
    lastFetch: '',
    lastFetchTime: 0,
    subscribers: new Set()
};

const CACHE_DURATION = 30000;

export const useSharedPortData = () => {
    const [, forceUpdate] = useState({});
    const { timeState } = useTimeContext();
    const { viewState } = useViewNavigation();
    const fetchTimeoutRef = useRef<NodeJS.Timeout>(null);

    const subscribe = useCallback(() => {
        const update = () => forceUpdate({});
        sharedState.subscribers.add(update);
        return () => {
            sharedState.subscribers.delete(update);
        };
    }, []);

    useEffect(() => {
        return subscribe();
    }, [subscribe]);

    const notifySubscribers = useCallback(() => {
        sharedState.subscribers.forEach(cb => cb());
    }, []);

    // Función para calcular las fechas correctas según TimeContext
    const calculateDateRange = useCallback((timeState: any) => {
        let startDate: Date;
        let endDate: Date;

        switch (timeState.unit) {
            case 'week':
                const weekNumber = getISOWeekNumber(timeState.currentDate);
                const year = getISOYear(timeState.currentDate);
                const weekRange = getISOWeekDateRange(weekNumber, year);
                startDate = weekRange.startDate;
                endDate = weekRange.endDate;
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'day':
                startDate = new Date(timeState.currentDate);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(timeState.currentDate);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'hour':
                startDate = new Date(timeState.currentDate);
                startDate.setHours(timeState.hourRange.start, 0, 0, 0);
                endDate = new Date(timeState.currentDate);
                endDate.setHours(timeState.hourRange.end, 59, 59, 999);
                break;

            case 'shift':
                const currentHour = timeState.currentDate.getHours();
                startDate = new Date(timeState.currentDate);
                endDate = new Date(timeState.currentDate);

                if (currentHour >= 8 && currentHour < 16) {
                    startDate.setHours(8, 0, 0, 0);
                    endDate.setHours(15, 59, 59, 999);
                } else if (currentHour >= 16 && currentHour < 24) {
                    startDate.setHours(16, 0, 0, 0);
                    endDate.setHours(23, 59, 59, 999);
                } else {
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(7, 59, 59, 999);
                }
                break;

            default:
                startDate = new Date(timeState.currentDate);
                endDate = new Date(timeState.currentDate);
        }

        return { startDate, endDate };
    }, []);

    const fetchData = useCallback(async (force: boolean = false) => {
        if (!timeState || timeState.dataSource !== 'historical') {
            if (sharedState.kpis || sharedState.movements.length > 0) {
                sharedState.kpis = null;
                sharedState.movements = [];
                sharedState.error = null;
                notifySubscribers();
            }
            return;
        }

        // Generar clave única para este fetch
        const fetchKey = [
            timeState.currentDate.toISOString(),
            timeState.unit,
            viewState.level,
            viewState.selectedPatio || 'all',
            viewState.selectedBloque || 'all',
            timeState.hourRange.start,
            timeState.hourRange.end
        ].join('|');

        const now = Date.now();
        const shouldFetch = force ||
            fetchKey !== sharedState.lastFetch ||
            (now - sharedState.lastFetchTime) > CACHE_DURATION;

        if (!shouldFetch || sharedState.isLoading) {
            console.log('📊 useSharedPortData - Skip fetch:', {
                reason: sharedState.isLoading ? 'Loading in progress' : 'Cache hit',
                fetchKey
            });
            return;
        }

        console.log('🚀 useSharedPortData - Starting fetch:', {
            fetchKey,
            timeState: {
                date: timeState.currentDate,
                unit: timeState.unit,
                hourRange: timeState.hourRange
            },
            viewState: {
                level: viewState.level,
                patio: viewState.selectedPatio,
                bloque: viewState.selectedBloque
            }
        });

        sharedState.isLoading = true;
        sharedState.lastFetch = fetchKey;
        notifySubscribers();

        try {
            // Calcular las fechas correctas
            const { startDate, endDate } = calculateDateRange(timeState);

            // Preparar filtros según el nivel de vista
            const filters: KPIFilters = {
                startDate,
                endDate,
                unit: timeState.unit === 'shift' ? 'hour' : timeState.unit
            };

            // LÓGICA CORRECTA DE FILTRADO:
            if (viewState.level === 'bloque' && viewState.selectedBloque) {
                // VISTA BLOQUE: Solo enviar bloque_filter, NO patio_filter
                filters.bloqueFilter = viewState.selectedBloque;
                // NO agregar patioFilter aquí
            } else if (viewState.level === 'patio' && viewState.selectedPatio) {
                // VISTA PATIO: Solo enviar patio_filter
                filters.patioFilter = viewState.selectedPatio;
                // NO agregar bloqueFilter aquí
            }
            // VISTA TERMINAL: No enviar ningún filtro adicional

            console.log('📅 Filtros a enviar:', {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                unit: timeState.unit,
                patioFilter: filters.patioFilter || 'none',
                bloqueFilter: filters.bloqueFilter || 'none',
                viewLevel: viewState.level
            });

            // Hacer llamadas en paralelo
            const [kpis, movements] = await Promise.all([
                portApi.calculateKPIs(filters),
                portApi.getHistoricalMovements(filters)
            ]);

            console.log('✅ useSharedPortData - Fetch successful:', {
                kpis: kpis ? 'OK' : 'null',
                movements: movements.length,
                filters
            });

            sharedState.kpis = kpis;
            sharedState.movements = movements;
            sharedState.error = null;
            sharedState.lastFetchTime = Date.now();

        } catch (err) {
            console.error('❌ useSharedPortData - Fetch error:', err);
            sharedState.error = err instanceof Error ? err.message : 'Error al cargar datos';
            sharedState.kpis = null;
            sharedState.movements = [];
        } finally {
            sharedState.isLoading = false;
            notifySubscribers();
        }
    }, [timeState, viewState, notifySubscribers, calculateDateRange]);

    useEffect(() => {
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        fetchTimeoutRef.current = setTimeout(() => {
            fetchData();
        }, 300);

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [fetchData]);
    // Agregar después de los otros useEffect
    useEffect(() => {
        const handleForceReload = () => {
            fetchData(true); // Forzar recarga
        };

        window.addEventListener('force-historical-reload', handleForceReload);

        return () => {
            window.removeEventListener('force-historical-reload', handleForceReload);
        };
    }, [fetchData]);
    const refresh = useCallback(() => {
        console.log('🔄 useSharedPortData - Manual refresh requested');
        fetchData(true);
    }, [fetchData]);

    return {
        ...sharedState,
        refresh
    };
};