import React, { useState } from 'react';
import { patioData } from '../../../data/patioData';
import type { BahiaData, BloqueData, BloqueStats, BloqueInfoPanelProps } from '../../../types';
import { Package, Clock, Truck, AlertCircle, Filter, Search, Download } from 'lucide-react';

interface BloqueViewProps {
  patioId: string;
  bloqueId: string;
  getColorForOcupacion: (value: number) => string;
}

interface BahiaComponentProps {
  bahia: BahiaData;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isSelected: boolean;
  isVisible: boolean;
  onClick: () => void;
}

// Función helper para calcular estadísticas del bloque
const calculateBloqueStats = (bloque: BloqueData): BloqueStats => {
  return {
    total: bloque.bahias.length,
    occupied: bloque.bahias.filter(b => b.occupied).length,
    free: bloque.bahias.filter(b => !b.occupied).length,
    import: bloque.bahias.filter(b => b.containerType === 'import').length,
    export: bloque.bahias.filter(b => b.containerType === 'export').length,
    empty: bloque.bahias.filter(b => b.containerType === 'empty').length,
    reefer: bloque.bahias.filter(b => b.containerType === 'reefer').length
  };
};

export const BloqueView: React.FC<BloqueViewProps> = ({
  patioId,
  bloqueId,
}) => {
  const [selectedBahia, setSelectedBahia] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const patio = patioData.find(p => p.id === patioId);
  const bloque = patio?.bloques.find(b => b.id === bloqueId);
  
  if (!bloque) return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center text-gray-500">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Bloque no encontrado</h3>
        <p>El bloque solicitado no existe o no está disponible</p>
      </div>
    </div>
  );

  // Filtrar bahías según criterios
  const filteredBahias = bloque.bahias.filter(bahia => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'occupied' && bahia.occupied) ||
      (filterStatus === 'free' && !bahia.occupied) ||
      (filterStatus === bahia.containerType);
    
    const matchesSearch = !searchTerm || 
      bahia.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bahia.containerId && bahia.containerId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const stats = calculateBloqueStats(bloque);

  // Organizar bahías en grid 7x7
  const rows = 7;
  const cols = 7;
  const bahiaWidth = 70;
  const bahiaHeight = 50;
  const spacing = 8;

  return (
    <div className="w-full h-full bg-gray-50 flex">
      {/* Panel principal */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{bloque.name}</h2>
              <p className="text-gray-600 mt-1">
                Ocupación: {bloque.ocupacion}% ({stats.occupied}/{stats.total} bahías)
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{stats.occupied}</div>
                <div className="text-sm text-gray-500">Bahías Ocupadas</div>
              </div>
              <div className={`w-4 h-4 rounded-full ${
                bloque.ocupacion < 70 ? 'bg-green-500' :
                bloque.ocupacion < 85 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 text-center">
              <div className="text-lg font-bold text-green-600">{stats.free}</div>
              <div className="text-xs text-gray-500">Libres</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 text-center">
              <div className="text-lg font-bold text-blue-600">{stats.import}</div>
              <div className="text-xs text-gray-500">Importación</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 text-center">
              <div className="text-lg font-bold text-orange-600">{stats.export}</div>
              <div className="text-xs text-gray-500">Exportación</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 text-center">
              <div className="text-lg font-bold text-gray-600">{stats.empty}</div>
              <div className="text-xs text-gray-500">Vacíos</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 text-center">
              <div className="text-lg font-bold text-purple-600">{stats.reefer}</div>
              <div className="text-xs text-gray-500">Refrigerados</div>
            </div>
          </div>

          {/* Controles de filtrado */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Filtro por estado */}
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las bahías</option>
                  <option value="free">Solo libres</option>
                  <option value="occupied">Solo ocupadas</option>
                  <option value="import">Importación</option>
                  <option value="export">Exportación</option>
                  <option value="empty">Vacíos</option>
                  <option value="reefer">Refrigerados</option>
                </select>
              </div>

              {/* Búsqueda */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar bahía o contenedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                <Download size={14} />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid de bahías */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Layout del Bloque ({filteredBahias.length} bahías mostradas)
            </h3>
            
            {/* Leyenda */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 mr-2 rounded"></div>
                <span>Libre</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 mr-2 rounded"></div>
                <span>Importación</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 mr-2 rounded"></div>
                <span>Exportación</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-400 mr-2 rounded"></div>
                <span>Vacío</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 mr-2 rounded"></div>
                <span>Refrigerado</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-auto">
            <svg width="600" height="400" viewBox="0 0 600 400" className="border border-gray-200 rounded">
              {/* Grid de bahías */}
              <g id="bahias-grid">
                {bloque.bahias.map((bahia, index) => {
                  const row = Math.floor(index / cols);
                  const col = index % cols;
                  const x = col * (bahiaWidth + spacing) + 20;
                  const y = row * (bahiaHeight + spacing) + 20;
                  
                  // Verificar si la bahía pasa el filtro
                  const isVisible = filteredBahias.includes(bahia);
                  
                  return (
                    <BahiaComponent
                      key={bahia.id}
                      bahia={bahia}
                      position={{ x, y }}
                      size={{ width: bahiaWidth, height: bahiaHeight }}
                      isSelected={selectedBahia === bahia.id}
                      isVisible={isVisible}
                      onClick={() => setSelectedBahia(bahia.id)}
                    />
                  );
                })}
              </g>
              
              {/* Números de fila y columna */}
              <g id="grid-labels">
                {Array.from({ length: rows }, (_, i) => (
                  <text
                    key={`row-${i}`}
                    x="8"
                    y={i * (bahiaHeight + spacing) + 45}
                    className="fill-gray-500 text-sm font-medium"
                    fontSize="12"
                  >
                    {i + 1}
                  </text>
                ))}
                {Array.from({ length: cols }, (_, i) => (
                  <text
                    key={`col-${i}`}
                    x={i * (bahiaWidth + spacing) + 55}
                    y="12"
                    className="fill-gray-500 text-sm font-medium"
                    textAnchor="middle"
                    fontSize="12"
                  >
                    {String.fromCharCode(65 + i)}
                  </text>
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Panel lateral con información detallada */}
      <BloqueInfoPanel 
        bloque={bloque} 
        selectedBahia={selectedBahia ? bloque.bahias.find(b => b.id === selectedBahia) : null}
        stats={stats}
      />
    </div>
  );
};

// Componente para cada bahía individual
const BahiaComponent: React.FC<BahiaComponentProps> = ({ 
  bahia, 
  position, 
  size, 
  isSelected, 
  isVisible, 
  onClick 
}) => {
  const getStatusColor = (): string => {
    if (!bahia.occupied) return '#10B981'; // Verde - libre
    switch (bahia.containerType) {
      case 'import': return '#3B82F6'; // Azul
      case 'export': return '#F59E0B'; // Naranja
      case 'empty': return '#6B7280'; // Gris
      case 'reefer': return '#8B5CF6'; // Morado
      default: return '#EF4444'; // Rojo - desconocido
    }
  };

  const getStatusIcon = (): string => {
    if (!bahia.occupied) return '⬜';
    switch (bahia.containerType) {
      case 'import': return '📦';
      case 'export': return '📤';
      case 'empty': return '📭';
      case 'reefer': return '🧊';
      default: return '❓';
    }
  };

  return (
    <g 
      transform={`translate(${position.x}, ${position.y})`}
      className={`cursor-pointer transition-all duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-30'
      }`}
      onClick={onClick}
    >
      {/* Rectángulo de la bahía */}
      <rect
        width={size.width}
        height={size.height}
        fill={getStatusColor()}
        stroke={isSelected ? '#1D4ED8' : '#374151'}
        strokeWidth={isSelected ? 3 : 1}
        rx="4"
        className="hover:stroke-2 transition-all"
        opacity={isVisible ? 1 : 0.3}
      />
      
      {/* Número de posición */}
      <text
        x={size.width / 2}
        y="14"
        textAnchor="middle"
        className="fill-white font-bold text-xs pointer-events-none"
        fontSize="10"
      >
        {bahia.position}
      </text>
      
      {/* Icono de estado */}
      <text
        x={size.width / 2}
        y="28"
        textAnchor="middle"
        className="pointer-events-none"
        fontSize="12"
      >
        {getStatusIcon()}
      </text>
      
      {/* ID del contenedor si está ocupado */}
      {bahia.occupied && bahia.containerId && (
        <text
          x={size.width / 2}
          y="40"
          textAnchor="middle"
          className="fill-white text-xs pointer-events-none"
          fontSize="8"
        >
          {bahia.containerId.substring(0, 6)}
        </text>
      )}
      
      {/* Overlay de selección */}
      {isSelected && (
        <rect
          width={size.width}
          height={size.height}
          fill="rgba(29, 78, 216, 0.2)"
          stroke="rgba(29, 78, 216, 0.8)"
          strokeWidth="2"
          rx="4"
          strokeDasharray="4,2"
          className="pointer-events-none"
        />
      )}
    </g>
  );
};

// Panel lateral con información del bloque
const BloqueInfoPanel: React.FC<BloqueInfoPanelProps> = ({ 
  bloque, 
  selectedBahia, 
  stats 
}) => {
  return (
    <div className="w-80 bg-white shadow-lg border-l border-gray-200 p-6 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Información del Bloque</h3>
      
      {/* Información general */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
          <Package className="mr-2 text-blue-500" size={16} />
          Detalles Generales
        </h4>
        <div className="space-y-2 text-sm bg-gray-50 rounded p-3">
          <div className="flex justify-between">
            <span className="text-gray-600">ID del Bloque:</span>
            <span className="font-medium">{bloque.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Capacidad Total:</span>
            <span className="font-medium">{bloque.capacidadTotal} bahías</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Equipamiento:</span>
            <span className="font-medium capitalize">{bloque.equipmentType?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estado Operacional:</span>
            <span className={`font-medium capitalize ${
              bloque.operationalStatus === 'active' ? 'text-green-600' :
              bloque.operationalStatus === 'maintenance' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {bloque.operationalStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas detalladas */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
          <Truck className="mr-2 text-green-500" size={16} />
          Distribución por Tipo
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-sm">Libres</span>
            </div>
            <span className="font-medium">{stats.free}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm">Importación</span>
            </div>
            <span className="font-medium">{stats.import}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
              <span className="text-sm">Exportación</span>
            </div>
            <span className="font-medium">{stats.export}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
              <span className="text-sm">Vacíos</span>
            </div>
            <span className="font-medium">{stats.empty}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span className="text-sm">Refrigerados</span>
            </div>
            <span className="font-medium">{stats.reefer}</span>
          </div>
        </div>
      </div>

      {/* Información de la bahía seleccionada */}
      {selectedBahia && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center">
            <AlertCircle className="mr-2" size={16} />
            Bahía Seleccionada: {selectedBahia.id}
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-600">Estado:</span>
              <span className="font-medium">
                {selectedBahia.occupied ? 'Ocupada' : 'Libre'}
              </span>
            </div>
            
            {selectedBahia.occupied && (
              <>
                <div className="flex justify-between">
                  <span className="text-blue-600">Tipo:</span>
                  <span className="font-medium capitalize">
                    {selectedBahia.containerType}
                  </span>
                </div>
                
                {selectedBahia.containerId && (
                  <div className="flex justify-between">
                    <span className="text-blue-600">Contenedor:</span>
                    <span className="font-medium font-mono text-xs">
                      {selectedBahia.containerId}
                    </span>
                  </div>
                )}
                
                {selectedBahia.size && (
                  <div className="flex justify-between">
                    <span className="text-blue-600">Tamaño:</span>
                    <span className="font-medium">{selectedBahia.size}'</span>
                  </div>
                )}
                
                {selectedBahia.weight && (
                  <div className="flex justify-between">
                    <span className="text-blue-600">Peso:</span>
                    <span className="font-medium">{selectedBahia.weight.toLocaleString()} kg</span>
                  </div>
                )}
                
                {selectedBahia.destination && (
                  <div className="flex justify-between">
                    <span className="text-blue-600">Destino:</span>
                    <span className="font-medium">{selectedBahia.destination}</span>
                  </div>
                )}
                
                {selectedBahia.lastMovement && (
                  <div className="flex justify-between">
                    <span className="text-blue-600">Último movimiento:</span>
                    <span className="font-medium text-xs">
                      {selectedBahia.lastMovement.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Última actualización */}
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
        <div className="flex items-center">
          <Clock size={12} className="mr-1" />
          Última actualización: {bloque.lastUpdate?.toLocaleTimeString() || 'N/A'}
        </div>
      </div>
    </div>
  );
};