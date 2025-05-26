import React from 'react';
import type { TimeUnit, DataSource } from '../../hooks/useTimeNavigation';
import { ChevronLeft, ChevronRight, Clock, Calendar, RotateCcw, Database, Calculator } from 'lucide-react';

interface TimeNavigationPanelProps {
  timeUnit: TimeUnit;
  dataSource: DataSource;
  displayFormat: string;
  onUnitChange: (unit: TimeUnit) => void;
  onDataSourceChange: (source: DataSource) => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onResetToNow: () => void;
  isLoading?: boolean;
}

/**
 * Panel de navegación temporal que permite cambiar entre diferentes unidades
 * de tiempo (hora, turno, semana) y fuentes de datos (históricos vs modelos)
 */
export const TimeNavigationPanel: React.FC<TimeNavigationPanelProps> = ({
  timeUnit,
  dataSource,
  displayFormat,
  onUnitChange,
  onDataSourceChange,
  onMoveForward,
  onMoveBackward,
  onResetToNow,
  isLoading = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        {/* Título del panel */}
        <div className="font-medium text-gray-700 flex items-center space-x-2">
          <Clock size={16} className="text-blue-500" />
          <span>Navegación Temporal</span>
        </div>
        
        {/* Botón para volver a la fecha/hora actual */}
        <button
          onClick={onResetToNow}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Volver a fecha actual"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Controles de tiempo */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-3">
          {/* Selector de unidad de tiempo */}
          <div className="flex items-center space-x-1">
            <div className="text-xs text-gray-500">Unidad:</div>
            <div className="flex bg-gray-100 rounded-md p-0.5">
              <button
                className={`px-2 py-0.5 text-xs rounded-md ${
                  timeUnit === 'hour' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onUnitChange('hour')}
              >
                Hora
              </button>
              <button
                className={`px-2 py-0.5 text-xs rounded-md ${
                  timeUnit === 'shift' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onUnitChange('shift')}
              >
                Turno
              </button>
              <button
                className={`px-2 py-0.5 text-xs rounded-md ${
                  timeUnit === 'week' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onUnitChange('week')}
              >
                Semana
              </button>
            </div>
          </div>

          {/* Selector de fuente de datos */}
          <div className="flex items-center space-x-1">
            <div className="text-xs text-gray-500">Datos:</div>
            <div className="flex bg-gray-100 rounded-md p-0.5">
              <button
                className={`px-2 py-0.5 text-xs rounded-md flex items-center space-x-1 ${
                  dataSource === 'historical' 
                    ? 'bg-green-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onDataSourceChange('historical')}
              >
                <Database size={10} />
                <span>Históricos</span>
              </button>
              <button
                className={`px-2 py-0.5 text-xs rounded-md flex items-center space-x-1 ${
                  dataSource === 'modelMagdalena' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onDataSourceChange('modelMagdalena')}
              >
                <Calculator size={10} />
                <span>Modelo M.</span>
              </button>
              <button
                className={`px-2 py-0.5 text-xs rounded-md flex items-center space-x-1 ${
                  dataSource === 'modelCamila' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onDataSourceChange('modelCamila')}
              >
                <Calculator size={10} />
                <span>Modelo C.</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navegador de tiempo */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
          <button
            onClick={onMoveBackward}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            disabled={isLoading}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-blue-500" />
            <span className={`text-sm font-medium ${isLoading ? 'text-gray-400' : 'text-gray-800'}`}>
              {isLoading ? 'Cargando...' : displayFormat}
            </span>
          </div>
          
          <button
            onClick={onMoveForward}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            disabled={isLoading}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Pie de ayuda */}
      <div className="mt-2 text-xs text-gray-500 italic">
        {dataSource === 'historical' ? (
          'Visualizando datos históricos reales'
        ) : dataSource === 'modelMagdalena' ? (
          'Visualizando resultados del modelo de optimización semanal'
        ) : (
          'Visualizando resultados del modelo de planificación por turno'
        )}
      </div>
    </div>
  );
};