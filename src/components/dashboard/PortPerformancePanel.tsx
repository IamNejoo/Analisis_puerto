import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTimeContext } from '../../contexts/TimeContext';
import { useMagdalenaData } from '../../hooks/useMagdalenaData';
import { useCamilaData } from '../../hooks/useCamilaData';
import { usePortKPIs } from '../../hooks/usePortKPIs';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Clock,
    AlertCircle,
    BarChart3
} from 'lucide-react';

interface TrendDataPoint {
    periodo: string;
    ocupacion: number;
    eficiencia: number;
}

interface ProcessedMetrics {
    ocupacion: number;
    eficiencia: number;
    productividad: number;
}

interface ProcessedData {
    trendData: TrendDataPoint[];
    metrics: ProcessedMetrics;
    hasData: boolean;
}

export const PortPerformancePanel: React.FC = () => {
    const { timeState } = useTimeContext();

    // Estados locales para evitar re-renders infinitos
    const [processedData, setProcessedData] = useState<ProcessedData>({
        trendData: [],
        metrics: { ocupacion: 0, eficiencia: 0, productividad: 0 },
        hasData: false
    });

    // Ref para evitar procesar los mismos datos múltiples veces
    const lastProcessedRef = useRef<string>('');

    const { magdalenaMetrics, realMetrics, isLoading: isMagdalenaLoading } = useMagdalenaData(
        timeState?.magdalenaConfig?.semana || 3,
        timeState?.magdalenaConfig?.participacion || 69,
        timeState?.magdalenaConfig?.conDispersion ?? true
    );

    const { camilaResults } = useCamilaData(
        timeState?.dataSource === 'modelCamila' ? (timeState.camilaConfig ?? null) : null
    );

    const { currentKPIs, aggregatedData, isLoading: isHistoricalLoading } = usePortKPIs({
        dataFilePath: '/data/resultados_congestion_SAI_2022.csv'
    });

    const isMagdalenaActive = timeState?.dataSource === 'modelMagdalena';
    const isCamilaActive = timeState?.dataSource === 'modelCamila';
    const isLoading = isMagdalenaActive ? isMagdalenaLoading : isHistoricalLoading;

    // Procesar datos cuando estén disponibles
    useEffect(() => {
        if (isLoading) return;

        // Crear una clave única para los datos actuales - CON VALIDACIONES
        const magdalenaDataLength = magdalenaMetrics?.ocupacionPorPeriodo?.length || 0;
        const camilaDataLength = camilaResults?.timeParticipation?.length || 0;
        const aggregatedDataLength = aggregatedData?.length || 0;
        const currentOcupacion = currentKPIs?.factorUtilizacionPatio || 0;

        const dataKey = `${isMagdalenaActive}-${isCamilaActive}-${magdalenaDataLength}-${camilaDataLength}-${aggregatedDataLength}-${currentOcupacion}`;

        // Solo procesar si los datos han cambiado
        if (dataKey === lastProcessedRef.current) return;

        let newTrendData: TrendDataPoint[] = [];
        let newMetrics: ProcessedMetrics = { ocupacion: 0, eficiencia: 0, productividad: 0 };
        let hasData = false;

        try {
            if (isMagdalenaActive && magdalenaMetrics && magdalenaMetrics.ocupacionPorPeriodo && magdalenaMetrics.ocupacionPorPeriodo.length > 0) {
                console.log('📊 Usando datos reales de Magdalena');

                newTrendData = magdalenaMetrics.ocupacionPorPeriodo.slice(0, 10).map((item) => ({
                    periodo: `P${item.periodo}`,
                    ocupacion: Math.max(0, Math.min(100, item.ocupacion || 0)),
                    eficiencia: 100 // Magdalena elimina reubicaciones = 100% eficiencia
                }));

                newMetrics = {
                    ocupacion: magdalenaMetrics.ocupacionPromedio || 0,
                    eficiencia: 100,
                    productividad: 30 // Estimado basado en optimización
                };

                hasData = true;

            } else if (isCamilaActive && camilaResults) {
                console.log('📊 Usando datos de Camila');

                // Procesar datos de Camila para tendencias
                newTrendData = camilaResults.timeParticipation.map((participation, index) => ({
                    periodo: `H${index + 8}`,
                    ocupacion: participation,
                    eficiencia: 100 - (camilaResults.congestionIndex * 10) // Estimación
                }));

                newMetrics = {
                    ocupacion: camilaResults.workloadBalance,
                    eficiencia: 100 - (camilaResults.congestionIndex * 10),
                    productividad: 20 // Productividad estándar de grúas
                };

                hasData = true;

            } else if (!isMagdalenaActive && !isCamilaActive && aggregatedData && aggregatedData.length > 0) {
                console.log('📊 Usando datos reales históricos del CSV');

                newTrendData = aggregatedData.slice(-10).map((item, index) => ({
                    periodo: `T${index + 1}`,
                    ocupacion: Math.max(0, Math.min(100, (item.data.factorUtilizacionPatio || 0) * 100)),
                    eficiencia: Math.max(0, Math.min(100, 100 - ((item.data.indiceRemanejo || 0) * 100)))
                }));

                if (currentKPIs) {
                    newMetrics = {
                        ocupacion: (currentKPIs.factorUtilizacionPatio || 0) * 100,
                        eficiencia: 100 - ((currentKPIs.indiceRemanejo || 0) * 100),
                        productividad: currentKPIs.productividadMuelle || 0
                    };
                }

                hasData = true;

            } else if (!isMagdalenaActive && !isCamilaActive && currentKPIs) {
                console.log('📊 Usando KPIs actuales sin datos agregados');

                // Solo métricas, sin tendencias
                newMetrics = {
                    ocupacion: (currentKPIs.factorUtilizacionPatio || 0) * 100,
                    eficiencia: 100 - ((currentKPIs.indiceRemanejo || 0) * 100),
                    productividad: currentKPIs.productividadMuelle || 0
                };

                hasData = true;
            }

            // Solo actualizar estado si hay datos reales
            if (hasData) {
                setProcessedData({
                    trendData: newTrendData,
                    metrics: newMetrics,
                    hasData: true
                });
                lastProcessedRef.current = dataKey;
            }

        } catch (error) {
            console.error('Error procesando datos de tendencias:', error);
            setProcessedData({
                trendData: [],
                metrics: { ocupacion: 0, eficiencia: 0, productividad: 0 },
                hasData: false
            });
        }

    }, [
        isLoading,
        isMagdalenaActive,
        isCamilaActive,
        magdalenaMetrics,
        camilaResults,
        aggregatedData,
        currentKPIs
    ]);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">Cargando datos reales...</p>
                </div>
            </div>
        );
    }

    if (!processedData.hasData) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Sin datos disponibles</p>
                    <p className="text-xs">
                        {isMagdalenaActive ? 'Esperando datos de Magdalena...' :
                            isCamilaActive ? 'Esperando datos de Camila...' :
                                'Esperando datos del CSV...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-3">
                <h4 className="font-bold text-gray-800 text-sm flex items-center">
                    <TrendingUp size={16} className="mr-2 text-green-600" />
                    {isMagdalenaActive ? 'Tendencias Magdalena' :
                        isCamilaActive ? 'Tendencias Camila' :
                            'Tendencias Históricas'}
                </h4>
                <p className="text-xs text-gray-600">
                    {processedData.trendData.length > 0 ?
                        `${processedData.trendData.length} puntos de datos reales` :
                        'Solo métricas actuales disponibles'
                    }
                </p>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xl font-bold text-blue-700">
                        {processedData.metrics.ocupacion.toFixed(1)}%
                    </div>
                    <div className="text-xs text-blue-600 font-semibold">Ocupación</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xl font-bold text-green-700">
                        {processedData.metrics.eficiencia.toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-600 font-semibold">Eficiencia</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-xl font-bold text-orange-700">
                        {processedData.metrics.productividad.toFixed(1)}
                    </div>
                    <div className="text-xs text-orange-600 font-semibold">Productividad</div>
                </div>
            </div>

            {/* Gráfico o mensaje */}
            <div className="flex-1 min-h-0 bg-gray-50 rounded-lg p-2 border border-gray-200">
                {processedData.trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData.trendData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                            <XAxis
                                dataKey="periodo"
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                axisLine={{ stroke: '#d1d5db' }}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                axisLine={{ stroke: '#d1d5db' }}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                                formatter={(value: any, name: string) => [
                                    `${Number(value).toFixed(1)}%`,
                                    name === 'ocupacion' ? 'Ocupación' : 'Eficiencia'
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="ocupacion"
                                stroke={isMagdalenaActive ? "#8B5CF6" : isCamilaActive ? "#EC4899" : "#3B82F6"}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                name="ocupacion"
                            />
                            <Line
                                type="monotone"
                                dataKey="eficiencia"
                                stroke="#10B981"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ r: 3 }}
                                name="eficiencia"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Solo métricas disponibles</p>
                            <p className="text-xs">Sin datos de tendencias temporales</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center font-medium">
                        {isMagdalenaActive ? (
                            <>
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                                <span className="text-purple-700">Datos Magdalena</span>
                            </>
                        ) : isCamilaActive ? (
                            <>
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                                <span className="text-purple-700">Datos Camila</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                <span className="text-blue-700">Datos CSV reales</span>
                            </>
                        )}
                    </span>
                    <span className="text-gray-500 font-mono">
                        {new Date().toLocaleTimeString().slice(0, 5)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PortPerformancePanel;