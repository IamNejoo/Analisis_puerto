import React from 'react';
import type { SegregationData, DataSource, TimeState } from '../../types';
import { Grid, Layers, Clock, Filter, Download } from 'lucide-react';

interface SegregationPanelProps {
  segregationData: SegregationData[];
  timeState: TimeState;
  isLoading?: boolean;
  onFilterChange?: (filter: string) => void;
  currentFilter?: string;
}

/**
 * Panel para visualizar las segregaciones por bahía
 * Utilizado en el nivel micro para mostrar la coloración por segregación
 */
export const SegregationPanel: React.FC<SegregationPanelProps> = ({
  segregationData,
  timeState,
  isLoading = false,
  onFilterChange,
  currentFilter = 'all'
}) => {
  // Obtener todos los tipos de segregación únicos
  const segregationTypes = React.useMemo(() => {
    const types = segregationData.map(item => item.segregationType);
    return ['all', ...Array.from(new Set(types))];
  }, [segregationData]);
  
  // Agrupar por tipo de segregación para mostrar estadísticas
  const segregationStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    
    segregationData.forEach(item => {
      if (!stats[item.segregationType]) {
        stats[item.segregationType] = 0;
      }
      stats[item.segregationType]++;
    });
    
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [segregationData]);

  // Función para obtener el nombre del modelo
  const getSourceName = (source: DataSource): string => {
    switch (source) {
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

  // Función para generar un color diferente para cada tipo de segregación
  const getColorForSegregation = (type: string): string => {
    // Usar el color predefinido si existe
    const segregationItem = segregationData.find(item => item.segregationType === type);
    if (segregationItem && segregationItem.colorCode) {
      return segregationItem.colorCode;
    }
    
    // Generar un color basado en el hash del nombre
    let hash = 0;
    for (let i = 0; i < type.length; i++) {
      hash = type.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <Layers size={16} className="mr-2 text-blue-500" />
          Segregaciones por Bahía
        </h3>
        
        {/* Dropdown para filtrar por tipo de segregación */}
        <div className="flex items-center space-x-2">
          <Filter size={14} className="text-gray-500" />
          <select
            value={currentFilter}
            onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {segregationTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'Todas las segregaciones' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Cargando segregaciones...</span>
        </div>
      ) : segregationData.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Grid size={28} className="mx-auto mb-2" />
          <p>No hay datos de segregación disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Origen de las segregaciones */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 flex items-center">
            <Clock size={16} className="mr-2 text-blue-500" />
            <div>
              <span className="font-medium">Fuente:</span> {getSourceName(timeState.dataSource)}
            </div>
          </div>

          {/* Resumen de segregaciones */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Distribución de Segregaciones</h4>
            <div className="space-y-2">
              {segregationStats.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2" 
                      style={{ backgroundColor: getColorForSegregation(type) }}
                    ></div>
                    <span className="text-sm">{type}</span>
                  </div>
                  <div className="text-sm font-medium">{count} bahías</div>
                </div>
              ))}
            </div>
          </div>

          {/* Leyenda explicativa */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Códigos de Segregación</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                Los códigos de segregación indican qué tipo de contenedores pueden
                almacenarse en cada bahía, optimizando el uso del espacio.
              </p>
              <p>
                El color de cada bahía en el mapa corresponde a su tipo de segregación.
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end pt-2">
            <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
              <Download size={12} />
              <span>Exportar Segregaciones</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};