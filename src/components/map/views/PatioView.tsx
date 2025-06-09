// src/components/map/views/PatioView.tsx - VISTA COMPACTA SIN SOLAPAMIENTOS
import React, { useState } from 'react';
import { patioData } from '../../../data/patioData';
import type { BloqueData, PatioData } from '../../../types';
import { Activity, Users, Clock, AlertTriangle, Settings, TrendingUp } from 'lucide-react';

interface PatioViewProps {
  patioId: string;
  onBloqueClick: (patioId: string, bloqueId: string) => void;
  getColorForOcupacion: (value: number) => string;
}

interface BloqueComponentProps {
  bloque: BloqueData;
  isSelected: boolean;
  onClick: () => void;
  getColorForOcupacion: (value: number) => string;
}

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

  return (
    <div className="w-full h-full bg-gray-50 overflow-hidden">
      {/* Contenido principal con scroll controlado */}
      <div className="h-full overflow-y-auto p-4">

        {/* Header compacto */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{patio.name}</h2>
              <p className="text-gray-600">{patio.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{patio.ocupacionTotal}%</div>
              <div className="text-sm text-gray-500">Ocupación Total</div>
            </div>
          </div>

          {/* Stats compactas */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="text-blue-500 mr-2" size={16} />
                <div className="text-lg font-bold">{patio.bloques.filter(b => b.operationalStatus === 'active').length}</div>
              </div>
              <div className="text-xs text-gray-500">Bloques Activos</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="text-green-500 mr-2" size={16} />
                <div className="text-lg font-bold">344</div>
              </div>
              <div className="text-xs text-gray-500">Contenedores</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="text-orange-500 mr-2" size={16} />
                <div className="text-lg font-bold">63h</div>
              </div>
              <div className="text-xs text-gray-500">Tiempo Rotación</div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="text-purple-500 mr-2" size={16} />
                <div className="text-lg font-bold">116</div>
              </div>
              <div className="text-xs text-gray-500">Movimientos/día</div>
            </div>
          </div>
        </div>

        {/* Grid de bloques CONTROLADO */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4">Bloques del Patio</h3>

          {/* Grid responsivo y controlado */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-4xl">
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

          {/* Leyenda compacta */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span>Bajo (&lt;70%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                <span>Medio (70-85%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span>Alto (&gt;85%)</span>
              </div>
              <div className="flex items-center">
                <Settings className="text-gray-400 mr-2" size={14} />
                <span>Mantenimiento</span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Clic en bloque para vista micro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de bloque COMPACTO
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
      className={`relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${isSelected ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'
        } ${bloque.operationalStatus === 'maintenance' ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      {/* Header del bloque */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg">{bloque.id}</h4>
          <div
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: color }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 truncate">{bloque.name}</p>
      </div>

      {/* Contenido del bloque */}
      <div className="p-3">
        <div className="space-y-2">
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

          {/* Información adicional compacta */}
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Capacidad:</span>
              <span className="font-medium">{ocupiedSlots}/{bloque.capacidadTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Estado:</span>
              <span className={`font-medium capitalize ${bloque.operationalStatus === 'active' ? 'text-green-600' :
                  bloque.operationalStatus === 'maintenance' ? 'text-orange-600' :
                    'text-red-600'
                }`}>
                {bloque.operationalStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Indicador de click */}
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-400 bg-gray-50 rounded px-2 py-1">
            Clic para vista micro
          </div>
        </div>
      </div>

      {/* Overlay de selección */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Seleccionado
          </div>
        </div>
      )}
    </div>
  );
};