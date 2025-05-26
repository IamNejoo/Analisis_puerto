import React from 'react';
import type { CongestionIndicator, DataSource } from '../../types';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Activity, Clock } from 'lucide-react';

interface CongestionIndicatorsPanelProps {
  indicators: CongestionIndicator[];
  dataSource: DataSource;
  isLoading?: boolean;
  onCompareWithHistorical?: () => void;
}

/**
 * Panel que muestra los indicadores de congestión calculados por el modelo de Enzo
 */
export const CongestionIndicatorsPanel: React.FC<CongestionIndicatorsPanelProps> = ({
  indicators,
  dataSource,
  isLoading = false,
  onCompareWithHistorical
}) => {
  // Calcular el nivel de congestión general
  const criticalIndicators = indicators.filter(ind => ind.value > ind.threshold);
  const congestionLevel = criticalIndicators.length > 2 
    ? 'high' 
    : criticalIndicators.length > 0 
      ? 'medium' 
      : 'low';

  // Función para obtener colores según el nivel de congestión
  const getIndicatorColor = (value: number, threshold: number): string => {
    const ratio = value / threshold;
    if (ratio < 0.8) return 'text-green-600';
    if (ratio < 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Función para obtener el icono de tendencia
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-red-500" />;
      case 'down':
        return <TrendingDown size={14} className="text-green-500" />;
      case 'stable':
        return <Minus size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <Activity size={16} className="mr-2 text-blue-500" />
          Indicadores de Congestión
        </h3>
        
        {dataSource !== 'historical' && (
          <button 
            onClick={onCompareWithHistorical}
            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
          >
            Comparar con históricos
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Cargando indicadores...</span>
        </div>
      ) : indicators.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <AlertCircle size={28} className="mx-auto mb-2" />
          <p>No hay indicadores disponibles para el período seleccionado</p>
        </div>
      ) : (
        <>
          {/* Nivel de congestión general */}
          <div className={`mb-4 p-3 rounded-lg flex items-center ${
            congestionLevel === 'low'
              ? 'bg-green-50 text-green-800'
              : congestionLevel === 'medium'
                ? 'bg-yellow-50 text-yellow-800'
                : 'bg-red-50 text-red-800'
          }`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${
              congestionLevel === 'low'
                ? 'bg-green-500'
                : congestionLevel === 'medium'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}></div>
            <div className="text-sm font-medium">
              Nivel de congestión: {' '}
              {congestionLevel === 'low'
                ? 'Bajo'
                : congestionLevel === 'medium'
                  ? 'Moderado'
                  : 'Alto'
              }
            </div>
          </div>

          {/* Lista de indicadores */}
          <div className="space-y-3">
            {indicators.map(indicator => (
              <div 
                key={indicator.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium text-gray-800">{indicator.name}</div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(indicator.trend)}
                    <span className={`font-bold ${getIndicatorColor(indicator.value, indicator.threshold)}`}>
                      {indicator.value.toFixed(1)} {indicator.unit}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{indicator.description}</div>
                
                {/* Barra de progreso */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>0</span>
                    <span>Umbral: {indicator.threshold}</span>
                    <span>{Math.ceil(indicator.threshold * 1.5)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        indicator.value < indicator.threshold * 0.8
                          ? 'bg-green-500'
                          : indicator.value < indicator.threshold
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((indicator.value / (indicator.threshold * 1.5)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pie informativo */}
      <div className="mt-4 text-xs text-gray-500 flex items-center border-t border-gray-200 pt-2">
        <Clock size={12} className="mr-1" />
        <span>Última actualización: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};