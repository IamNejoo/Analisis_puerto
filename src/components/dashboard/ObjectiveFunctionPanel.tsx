import React from 'react';
import type { ObjectiveFunction, DataSource, TimeState } from '../../types';
import { Target, Info } from 'lucide-react';

interface ObjectiveFunctionPanelProps {
  objectiveFunctions: ObjectiveFunction[];
  timeState: TimeState;
  isLoading?: boolean;
  onShowInfo?: (functionId: string) => void;
}

/**
 * Panel para visualizar las funciones objetivo de los modelos
 */
export const ObjectiveFunctionPanel: React.FC<ObjectiveFunctionPanelProps> = ({
  objectiveFunctions,
  timeState,
  isLoading = false,
  onShowInfo
}) => {
  // Solo mostrar funciones objetivo para el modelo seleccionado
  const filteredFunctions = objectiveFunctions.filter(
    func => func.dataSource === timeState.dataSource
  );

  // Determinar si mostrar algún contenido para datos históricos
  const showHistoricalMessage = timeState.dataSource === 'historical' && objectiveFunctions.length > 0;

  // Función para obtener el nombre del modelo
  const getModelName = (source: DataSource): string => {
    switch (source) {
      case 'modelMagdalena':
        return 'Modelo Magdalena';
      case 'modelCamila':
        return 'Modelo Camila';
      default:
        return '';
    }
  };

  // Función para colorear según cumplimiento del objetivo
  const getStatusColor = (value: number, target: number): string => {
    const ratio = value / target;
    if (ratio < 0.8) return 'text-red-600';
    if (ratio < 1) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Función para calcular el porcentaje de cumplimiento
  const getAchievementPercentage = (value: number, target: number): number => {
    return Math.min(Math.round((value / target) * 100), 100);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <Target size={16} className="mr-2 text-blue-500" />
          Funciones Objetivo
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Cargando funciones objetivo...</span>
        </div>
      ) : showHistoricalMessage ? (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-blue-800 text-sm">
            <p className="mb-2 font-medium">Datos Históricos</p>
            <p>
              Las funciones objetivo solo están disponibles para resultados de modelos.
              Seleccione un modelo en el panel de navegación temporal para visualizar
              sus funciones objetivo.
            </p>
          </div>
        </div>
      ) : filteredFunctions.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Target size={28} className="mx-auto mb-2" />
          <p>No hay funciones objetivo disponibles para el modelo seleccionado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Encabezado del modelo */}
          {timeState.dataSource !== 'historical' && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
              <div className="font-medium">
                Funciones Objetivo: {getModelName(timeState.dataSource)}
              </div>
              <div className="text-xs mt-1">
                Resultados de la optimización según los objetivos del modelo
              </div>
            </div>
          )}

          {/* Lista de funciones objetivo */}
          <div className="space-y-4 mt-3">
            {filteredFunctions.map(func => (
              <div 
                key={func.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-800 flex items-center">
                      {func.name}
                      <button 
                        className="ml-1 text-gray-400 hover:text-gray-600"
                        onClick={() => onShowInfo && onShowInfo(func.id)}
                      >
                        <Info size={14} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{func.description}</div>
                  </div>
                  <div className={`font-bold ${getStatusColor(func.value, func.target)}`}>
                    {func.value.toFixed(1)} {func.unit}
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>0</span>
                    <span>Meta: {func.target} {func.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        func.value < func.target * 0.8
                          ? 'bg-red-500'
                          : func.value < func.target
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${getAchievementPercentage(func.value, func.target)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Explicación de la leyenda */}
          <div className="border-t border-gray-200 pt-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span>Objetivo cumplido</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                <span>Cercano a meta</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span>Por debajo de meta</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};