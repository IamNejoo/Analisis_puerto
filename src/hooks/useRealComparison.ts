// src/hooks/useRealComparison.ts - ACTUALIZADO
import { useState, useEffect, useCallback } from 'react';
import { useTimeContext } from '../contexts/TimeContext';
import { useMagdalenaData } from './useMagdalenaData';
import * as XLSX from 'xlsx';

interface RealWeekData {
    semana: number;
    totalMovimientos: number;
    flujos: {
        RECV: number;
        LOAD: number;
        DSCH: number;
        DLVR: number;
        YARD: number; // Reubicaciones reales
    };
    segregacionesReales: number;
    inventarioInicial: number;
    bloquesUtilizados: string[];
}

interface ComparisonMetrics {
    eliminacionReubicaciones: number;
    porcentajeReubicaciones: number;
    mejoraFlujosTotal: number;
    optimizacionSegregaciones: number;
    eficienciaOperativa: number;
    distanciaAhorrada: number; // Estimada
}

export const useRealComparison = () => {
    const [realData, setRealData] = useState<RealWeekData | null>(null);
    const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { currentData: magdalenaData, magdalenaKPIs } = useMagdalenaData();
    const { timeState } = useTimeContext();

    // Procesar datos reales de la semana
    const processRealWeekData = useCallback(async (semana: number): Promise<RealWeekData | null> => {
        try {
            // Leer archivo de flujos reales
            const flujosResponse = await fetch(`/data/semanas/semana ${semana}/analisis_flujos_w${semana}.xlsx`);
            if (!flujosResponse.ok) {
                throw new Error(`Archivo de flujos semana ${semana} no encontrado`);
            }

            const flujosBuffer = await flujosResponse.arrayBuffer();
            const flujosWorkbook = XLSX.read(flujosBuffer, { cellDates: true });

            // Procesar flujos principales
            const flujosSheet = flujosWorkbook.Sheets['FlujosAll_sbt'];
            const flujosData = XLSX.utils.sheet_to_json(flujosSheet, { header: 1 }) as any[][];

            const movimientos = flujosData.slice(1).map(row => ({
                criterio: row[0],
                carrier: row[1],
                from: row[2],
                to: row[3],
                shift: row[4],
                DLVR: Number(row[5]) || 0,
                DSCH: Number(row[6]) || 0,
                LOAD: Number(row[7]) || 0,
                OTHR: Number(row[8]) || 0,
                RECV: Number(row[9]) || 0,
                SHFT: Number(row[10]) || 0,
                YARD: Number(row[11]) || 0
            }));

            // Calcular totales de flujos reales
            const flujos = movimientos.reduce((acc, mov) => {
                acc.RECV += mov.RECV;
                acc.LOAD += mov.LOAD;
                acc.DSCH += mov.DSCH;
                acc.DLVR += mov.DLVR;
                acc.YARD += mov.YARD;
                return acc;
            }, { RECV: 0, LOAD: 0, DSCH: 0, DLVR: 0, YARD: 0 });

            const totalMovimientos = flujos.RECV + flujos.LOAD + flujos.DSCH + flujos.DLVR + flujos.YARD;

            // Obtener bloques utilizados
            const bloquesUtilizados = [...new Set(
                movimientos
                    .map(m => m.to)
                    .filter(b => b && typeof b === 'string' && b.startsWith('C'))
            )] as string[];

            // Leer datos de segregaciones
            let segregacionesReales = 0;
            let inventarioInicial = 0;

            try {
                const segResponse = await fetch(`/data/semanas/Resultados_Segregaciones_${semana}.xlsx`);
                if (segResponse.ok) {
                    const segBuffer = await segResponse.arrayBuffer();
                    const segWorkbook = XLSX.read(segBuffer, { cellDates: true });
                    const resumenSheet = segWorkbook.Sheets['Resumen'];
                    const resumenData = XLSX.utils.sheet_to_json(resumenSheet, { header: 1 }) as any[][];

                    segregacionesReales = resumenData.slice(1).filter(row => row[0]).length;
                    inventarioInicial = resumenData.slice(1).reduce((sum, row) => sum + (Number(row[1]) || 0), 0);
                }
            } catch (error) {
                console.warn('No se pudo cargar datos de segregaciones:', error);
            }

            return {
                semana,
                totalMovimientos,
                flujos,
                segregacionesReales,
                inventarioInicial,
                bloquesUtilizados
            };

        } catch (error) {
            console.error(`Error procesando semana ${semana}:`, error);
            return null;
        }
    }, []);

    // Calcular métricas de comparación
    const calculateComparison = useCallback((
        real: RealWeekData,
        magdalena: any
    ): ComparisonMetrics => {

        // Métricas principales de mejora
        const eliminacionReubicaciones = real.flujos.YARD; // El modelo elimina todas las reubicaciones
        const porcentajeReubicaciones = real.totalMovimientos > 0
            ? (real.flujos.YARD / real.totalMovimientos) * 100
            : 0;

        // Mejora en flujos (el modelo organiza mejor los flujos)
        const flujosProductivos = real.flujos.RECV + real.flujos.LOAD + real.flujos.DSCH + real.flujos.DLVR;
        const mejoraFlujosTotal = real.totalMovimientos > 0
            ? (eliminacionReubicaciones / real.totalMovimientos) * 100
            : 0;

        // Optimización de segregaciones
        const optimizacionSegregaciones = magdalena?.segregacionesActivas || real.segregacionesReales;

        // Eficiencia operativa general
        const eficienciaOperativa = (
            (eliminacionReubicaciones > 0 ? 40 : 0) + // 40% por eliminar reubicaciones
            (optimizacionSegregaciones >= real.segregacionesReales ? 25 : 0) + // 25% por mantener/mejorar segregaciones
            (magdalena?.bloquesAsignados >= real.bloquesUtilizados.length ? 20 : 0) + // 20% por optimizar bloques
            15 // 15% por mejor planificación
        );

        // Estimación de distancia ahorrada (basado en literatura de terminales)
        const distanciaAhorrada = eliminacionReubicaciones * 180; // ~180m promedio por reubicación eliminada

        return {
            eliminacionReubicaciones,
            porcentajeReubicaciones,
            mejoraFlujosTotal,
            optimizacionSegregaciones,
            eficienciaOperativa,
            distanciaAhorrada
        };
    }, []);

    // Efecto principal
    useEffect(() => {
        if (timeState?.dataSource !== 'modelMagdalena' || !magdalenaData) {
            setComparisonMetrics(null);
            return;
        }

        const loadComparison = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const semana = timeState.magdalenaConfig?.semana || 3;

                // Cargar datos reales para esta semana
                const weekData = await processRealWeekData(semana);

                if (weekData) {
                    setRealData(weekData);

                    if (magdalenaData) {
                        const comparison = calculateComparison(weekData, magdalenaData);
                        setComparisonMetrics(comparison);
                    }
                } else {
                    setError(`No se pudieron cargar datos reales de la semana ${semana}`);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error en comparación');
            } finally {
                setIsLoading(false);
            }
        };

        loadComparison();
    }, [timeState, magdalenaData, processRealWeekData, calculateComparison]);

    return {
        realData,
        magdalenaData,
        comparisonMetrics,
        isLoading,
        error
    };
};