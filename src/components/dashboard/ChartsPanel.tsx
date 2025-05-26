import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart as ReBarChart, Bar, Cell } from 'recharts';
import type { OccupancyData, ProductivityData, TruckTimeData, TimeState } from '../../types';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface ChartsPanelProps {
  ocupacionData: OccupancyData[];
  productividadData: ProductivityData[];
  tiempoCamionData: TruckTimeData[];
  getColorForOcupacion: (value: number) => string;
  timeState?: TimeState;
  isLoading?: boolean;
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({
  ocupacionData,
  productividadData,
  tiempoCamionData,
  timeState,
  isLoading = false
}) => {
  // Formatear el período de tiempo para mostrar en los gráficos
  const getPeriodLabel = () => {
    if (!timeState) return 'Última semana';
    
    switch (timeState.unit) {
      case 'hour':
        return 'Última hora';
      case 'shift':
        return 'Último turno';
      case 'week':
        return 'Última semana';
      default:
        return 'Última semana';
    }
  };

  // Obtener la fuente de datos para mostrar en los gráficos
  const getDataSourceLabel = () => {
    if (!timeState) return '';
    
    switch (timeState.dataSource) {
      case 'historical':
        return 'Datos históricos';
      case 'modelMagdalena':
        return 'Modelo Magdalena';
      case 'modelCamila':
        return 'Modelo Camila';
      default:
        return '';
    }
  };

  // Contenido del panel
  return (
    <div className="relative">
      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* Información del período y fuente de datos */}
        {timeState && (
          <div className="col-span-12 flex justify-between items-center bg-blue-50 rounded-lg p-3 mb-1">
            <div className="flex items-center text-sm text-blue-800">
              <Clock size={16} className="mr-2 text-blue-500" />
              <span className="font-medium">Período:</span>
              <span className="ml-1">
                {timeState.unit === 'hour' ? 'Por hora' : timeState.unit === 'shift' ? 'Por turno' : 'Semanal'}
              </span>
            </div>
            <div className="text-sm text-blue-800">
              <span className="font-medium">Fuente:</span>
              <span className="ml-1">
                {timeState.dataSource === 'historical'
                  ? 'Datos Históricos'
                  : timeState.dataSource === 'modelMagdalena'
                    ? 'Modelo Magdalena'
                    : 'Modelo Camila'}
              </span>
            </div>
          </div>
        )}

        {/* Ocupación Sitio Chart */}
        <div className="col-span-4 bg-white rounded-lg shadow-md p-4">
          <h3 className="font-bold text-lg text-gray-800 mb-3">Tendencia de Ocupación</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={ocupacionData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                fill="#93C5FD" 
                fillOpacity={0.5} 
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{getPeriodLabel()}</span>
            <div className="flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+4.2%</span>
            </div>
          </div>
          {timeState && timeState.dataSource !== 'historical' && (
            <div className="text-xs text-blue-600 mt-1">
              {getDataSourceLabel()}
            </div>
          )}
        </div>
        
        {/* Productividad Chart */}
        <div className="col-span-4 bg-white rounded-lg shadow-md p-4">
          <h3 className="font-bold text-lg text-gray-800 mb-3">Productividad</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={productividadData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="bmph" 
                name="BMPH" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="gmph" 
                name="GMPH" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{getPeriodLabel()}</span>
            <div className="flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+5.8%</span>
            </div>
          </div>
          {timeState && timeState.dataSource !== 'historical' && (
            <div className="text-xs text-blue-600 mt-1">
              {getDataSourceLabel()}
            </div>
          )}
        </div>
        
        {/* Tiempo Camión Chart */}
        <div className="col-span-4 bg-white rounded-lg shadow-md p-4">
          <h3 className="font-bold text-lg text-gray-800 mb-3">Tiempo de Ciclo Camión</h3>
          <ResponsiveContainer width="100%" height={200}>
            <ReBarChart
              data={tiempoCamionData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar 
                dataKey="tiempo" 
                name="Minutos" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              >
                {tiempoCamionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.tiempo > 40 ? '#EF4444' : entry.tiempo > 35 ? '#F59E0B' : '#10B981'} 
                  />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{getPeriodLabel()}</span>
            <div className="flex items-center">
              <TrendingDown size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">-9.8%</span>
            </div>
          </div>
          {timeState && timeState.dataSource !== 'historical' && (
            <div className="text-xs text-blue-600 mt-1">
              {getDataSourceLabel()}
            </div>
          )}
        </div>
      </div>

      {/* Overlay de carga si isLoading es true */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Cargando datos...</span>
          </div>
        </div>
      )}
    </div>
  );
};