import React, { useState } from 'react';
import { patioData } from '../../../data/patioData';
import type { BloqueData, PatioData, PatioStatsExtended, PatioInfoPanelProps } from '../../../types';
import { Activity, Users, Clock, AlertTriangle, Settings, TrendingUp } from 'lucide-react';

interface PatioViewProps {
  patioId: string;
  onBloqueClick: (patioId: string, bloqueId: string) => void;
  getColorForOcupacion: (value: number) => string;
}

// Función helper para calcular estadísticas del patio
const calculatePatioStats = (patio: PatioData): PatioStatsExtended => {
  const totalCapacity = patio.bloques.reduce((sum, bloque) => sum + bloque.capacidadTotal, 0);
  const totalOccupied = patio.bloques.reduce((sum, bloque) => sum + Math.round(bloque.capacidadTotal * bloque.ocupacion / 100), 0);
  const blocksActive = patio.bloques.filter(b => b.operationalStatus === 'active').length;
  const blocksInMaintenance = patio.bloques.filter(b => b.operationalStatus === 'maintenance').length;

  return {
    totalCapacity,
    currentOccupancy: totalOccupied,
    occupancyRate: Math.round((totalOccupied / totalCapacity) * 100),
    blocksActive,
    blocksInMaintenance,
    avgTurnoverTime: Math.floor(Math.random() * 48) + 24,
    recentMovements: Math.floor(Math.random() * 100) + 50
  };
};

export const PatioView: React.FC<PatioViewProps> = ({
  patioId,
  onBloqueClick,
  getColorForOcupacion
}) => {
  const [selectedBloque, setSelectedBloque] = useState<string | null>(null);
  const patio = patioData.find(p => p.id === patioId);
  
  if (!patio) return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center text-gray-500">
        <AlertTriangle size={48} className="mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Patio no encontrado</h3>
        <p>El patio solicitado no existe o no está disponible</p>
      </div>
    </div>
  );

  const stats = calculatePatioStats(patio);

  return (
    <div className="w-full h-full bg-gray-50 flex">
      {/* Panel principal del mapa */}
      <div className="flex-1 p-6">
        {/* Header del patio */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{patio.name}</h2>
              <p className="text-gray-600 mt-1">{patio.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{patio.ocupacionTotal}%</div>
                <div className="text-sm text-gray-500">Ocupación Total</div>
              </div>
              <div className={`w-4 h-4 rounded-full ${
                patio.ocupacionTotal < 70 ? 'bg-green-500' :
                patio.ocupacionTotal < 85 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Activity className="text-blue-500 mr-3" size={20} />
                <div>
                  <div className="text-xl font-bold">{stats.blocksActive}</div>
                  <div className="text-sm text-gray-500">Bloques Activos</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Users className="text-green-500 mr-3" size={20} />
                <div>
                  <div className="text-xl font-bold">{stats.currentOccupancy}</div>
                  <div className="text-sm text-gray-500">Contenedores</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Clock className="text-orange-500 mr-3" size={20} />
                <div>
                  <div className="text-xl font-bold">{stats.avgTurnoverTime}h</div>
                  <div className="text-sm text-gray-500">Tiempo Rotación</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="text-purple-500 mr-3" size={20} />
                <div>
                  <div className="text-xl font-bold">{stats.recentMovements}</div>
                  <div className="text-sm text-gray-500">Movimientos/día</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de bloques */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Bloques del Patio</h3>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            {patio.bloques.map((bloque) => (
              <BloqueComponent
                key={bloque.id}
                bloque={bloque}
                isSelected={selectedBloque === bloque.id}
                onClick={() => {
                  setSelectedBloque(bloque.id);
                  setTimeout(() => {
                    onBloqueClick(patioId, bloque.id);
                  }, 200);
                }}
                getColorForOcupacion={getColorForOcupacion}
              />
            ))}
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span>Disponible (&lt;70%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span>Moderado (70-85%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span>Crítico (&gt;85%)</span>
              </div>
              <div className="flex items-center">
                <Settings className="text-gray-400 mr-2" size={16} />
                <span>Mantenimiento</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Haga clic en un bloque para ver las bahías en detalle
            </div>
          </div>
        </div>
      </div>

      {/* Panel lateral con información detallada */}
      <PatioInfoPanel patio={patio} stats={stats} selectedBloque={selectedBloque} />
    </div>
  );
};

// Componente para un bloque individual
interface BloqueComponentProps {
  bloque: BloqueData;
  isSelected: boolean;
  onClick: () => void;
  getColorForOcupacion: (value: number) => string;
}

const BloqueComponent: React.FC<BloqueComponentProps> = ({ 
  bloque, 
  isSelected, 
  onClick, 
  getColorForOcupacion 
}) => {
  const color = bloque.operationalStatus === 'maintenance' ? '#6B7280' : getColorForOcupacion(bloque.ocupacion);
  const ocupiedSlots = Math.round(bloque.capacidadTotal * bloque.ocupacion / 100);
  
  return (
    <div
      className={`relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isSelected ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'
      } ${bloque.operationalStatus === 'maintenance' ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      {/* Header del bloque */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg">{bloque.id}</h4>
          <div 
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: color }}
          ></div>
        </div>
        <p className="text-sm text-gray-500">{bloque.name}</p>
      </div>

      {/* Contenido del bloque */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Ocupación */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Ocupación</span>
              <span className="text-sm font-bold" style={{ color }}>{bloque.ocupacion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${bloque.ocupacion}%`, backgroundColor: color }}
              ></div>
            </div>
          </div>

          {/* Capacidad */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Capacidad:</span>
            <span className="font-medium">{ocupiedSlots}/{bloque.capacidadTotal}</span>
          </div>

          {/* Equipamiento */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Equipo:</span>
            <span className="font-medium capitalize">{bloque.equipmentType?.replace('_', ' ')}</span>
          </div>

          {/* Estado operacional */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estado:</span>
            <span className={`font-medium capitalize ${
              bloque.operationalStatus === 'active' ? 'text-green-600' :
              bloque.operationalStatus === 'maintenance' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {bloque.operationalStatus}
            </span>
          </div>
        </div>

        {/* Indicador de click */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-400 bg-gray-50 rounded px-2 py-1">
            Click para ver bahías
          </div>
        </div>
      </div>

      {/* Overlay de selección */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Seleccionado
          </div>
        </div>
      )}
    </div>
  );
};

// Panel lateral con información del patio
const PatioInfoPanel: React.FC<PatioInfoPanelProps> = ({ patio, stats, selectedBloque }) => {
  const selectedBloqueData = selectedBloque ? patio.bloques.find(b => b.id === selectedBloque) : null;

  return (
    <div className="w-80 bg-white shadow-lg border-l border-gray-200 p-6 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Información Detallada</h3>
      
      {/* Información general del patio */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3">Detalles del Patio</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Responsable:</span>
            <span className="font-medium">{patio.manager}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Horario:</span>
            <span className="font-medium">{patio.operatingHours.start} - {patio.operatingHours.end}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contacto:</span>
            <span className="font-medium text-blue-600">{patio.emergencyContact}</span>
          </div>
        </div>
      </div>

      {/* Restricciones */}
      {patio.restrictions && patio.restrictions.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Restricciones</h4>
          <ul className="space-y-1">
            {patio.restrictions.map((restriction: string, index: number) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {restriction}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Información del bloque seleccionado */}
      {selectedBloqueData && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-3">Bloque Seleccionado: {selectedBloqueData.id}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-600">Ocupación:</span>
              <span className="font-medium">{selectedBloqueData.ocupacion}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Bahías ocupadas:</span>
              <span className="font-medium">
                {Math.round(selectedBloqueData.capacidadTotal * selectedBloqueData.ocupacion / 100)}/{selectedBloqueData.capacidadTotal}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Equipo:</span>
              <span className="font-medium capitalize">{selectedBloqueData.equipmentType?.replace('_', ' ')}</span>
            </div>
            <div className="mt-3 text-xs text-blue-600">
              Haga clic en el bloque para ver las bahías individuales
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas operacionales */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3">Estadísticas Operacionales</h4>
        <div className="space-y-3">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-sm text-gray-600">Capacidad Total</div>
            <div className="text-xl font-bold text-gray-800">{stats.totalCapacity}</div>
          </div>
          
          <div className="bg-gray-50 rounded p-3">
            <div className="text-sm text-gray-600">Contenedores Actuales</div>
            <div className="text-xl font-bold text-gray-800">{stats.currentOccupancy}</div>
          </div>
          
          <div className="bg-gray-50 rounded p-3">
            <div className="text-sm text-gray-600">Bloques en Mantenimiento</div>
            <div className="text-xl font-bold text-orange-600">{stats.blocksInMaintenance}</div>
          </div>
        </div>
      </div>

      {/* Última actualización */}
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
        <div className="flex items-center">
          <Clock size={12} className="mr-1" />
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};