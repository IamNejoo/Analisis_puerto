import React from 'react';
import type { ModelComparisonData, DataSource } from '../../types';
import { TrendingUp, TrendingDown, ArrowRight, BarChart2, Database } from 'lucide-react';

interface ModelComparisonPanelProps {
  comparisonData: ModelComparisonData[];
  selectedModel: DataSource;
  onSelectModel: (model: DataSource) => void;
  isLoading?: boolean;
}

/**
 * Panel para comparar resultados de modelos con datos históricos
 */
export const ModelComparisonPanel: React.FC<ModelComparisonPanelProps> = ({
  comparisonData,
  selectedModel,
  onSelectModel,
  isLoading = false
}) => {
  // Solo permitir seleccionar modelos, no datos históricos
  const handleModelSelect = (model: DataSource) => {
    if (model !== 'historical') {
      onSelectModel(model);
    }
  };

  // Obtener el nombre del modelo
  const getModelName = (model: DataSource): string => {
    switch (model) {
      case 'historical':
        return 'Datos Históricos';
      case 'modelMagdalena':
        return 'Modelo Magdalena';
      case 'modelCamila':
        return 'Modelo Camila';
      default:
        return '';
    }
  };

  // Función para colorear el delta
  const getDeltaColor = (delta: number): string => {
    if (delta < 0) return 'text-green-600';
    if (delta === 0) return 'text-gray-600';
    return 'text-red-600';
  };

  // Función para mostrar el delta con signo
  const formatDelta = (delta: number): string => {
    return delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <BarChart2 size={16} className="mr-2 text-blue-500" />
          Comparación de Modelos
        </h3>
        
        {/* Selector de modelo */}
        <div className="flex bg-gray-100 rounded-md p-0.5">
          <button
            className={`px-2 py-1 text-xs rounded-md flex items-center space-x-1 ${
              selectedModel === 'modelMagdalena' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleModelSelect('modelMagdalena')}
          >
            <span>Magdalena</span>
          </button>
          <button
            className={`px-2 py-1 text-xs rounded-md flex items-center space-x-1 ${
              selectedModel === 'modelCamila' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleModelSelect('modelCamila')}
          >
            <span>Camila</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Cargando datos de comparación...</span>
        </div>
      ) : comparisonData.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Database size={28} className="mx-auto mb-2" />
          <p>No hay datos de comparación disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 px-2">
            <div>Indicador</div>
            <div className="text-center">Histórico</div>
            <div className="text-center">
              {getModelName(selectedModel)}
            </div>
          </div>

          {/* Lista de comparaciones */}
          {comparisonData.map((item, index) => {
            const modelValue = selectedModel === 'modelMagdalena' 
              ? item.modelMagdalena 
              : item.modelCamila;
            
            const delta = modelValue !== undefined 
              ? modelValue - item.historical 
              : 0;
            
            const deltaPercentage = item.historical !== 0 
              ? (delta / item.historical) * 100 
              : 0;

            return (
              <div 
                key={`${item.indicator}-${index}`}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-sm font-medium text-gray-800">
                    {item.indicator}
                  </div>
                  
                  {/* Valor histórico */}
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-700 flex items-center justify-center">
                      <Database size={12} className="text-green-500 mr-1" />
                      {item.historical.toFixed(1)} {item.unit}
                    </div>
                  </div>
                  
                  {/* Valor del modelo */}
                  <div className="text-center">
                    {modelValue !== undefined ? (
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-gray-700">
                          {modelValue.toFixed(1)} {item.unit}
                        </div>
                        
                        {/* Delta */}
                        <div className={`text-xs flex items-center justify-center ${getDeltaColor(delta)}`}>
                          {delta < 0 ? (
                            <TrendingDown size={12} className="mr-1" />
                          ) : delta > 0 ? (
                            <TrendingUp size={12} className="mr-1" />
                          ) : (
                            <ArrowRight size={12} className="mr-1" />
                          )}
                          {formatDelta(delta)} ({Math.abs(deltaPercentage).toFixed(1)}%)
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No disponible</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p className="font-medium">Interpretación de resultados:</p>
        <p className="text-xs mt-1">
          Los valores <span className="text-green-600 font-medium">negativos</span> indican una mejora 
          en el rendimiento del modelo respecto a los datos históricos.
        </p>
      </div>
    </div>
  );
};