import React, { useState, useEffect } from 'react';
import { patioData } from '../../data/patioData';
import { SegregationPanel } from '../../components/dashboard/SegregationPanel';
import { ObjectiveFunctionPanel } from '../../components/dashboard/ObjectiveFunctionPanel';
import { useTimeContext } from '../../contexts/TimeContext';
import type { 
  BahiaData, 
  BloqueData, 
  BloqueStats, 
  SegregationData,
  ObjectiveFunction
} from '../../types';
import { Package, Clock, Truck, AlertCircle, Filter, Search, Download, Calendar } from 'lucide-react';

interface TimeAwareBloqueViewProps {
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
  segregation?: string;
  segregationColor?: string;
}

// Datos simulados de segregación
const mockSegregationData: SegregationData[] = [
  {
    id: 'seg-1',
    patioId: 'costanera',
    bloqueId: 'C1',
    bahiaId: 'C1-01',
    segregationType: 'Import 40HC',
    colorCode: '#3B82F6',
    assignedBy: 'modelMagdalena',
    timestamp: new Date()
  },
  {
    id: 'seg-2',
    patioId: 'costanera',
    bloqueId: 'C1',
    bahiaId: 'C1-02',
    segregationType: 'Export 20DC',
    colorCode: '#F59E0B',
    assignedBy: 'modelMagdalena',
    timestamp: new Date()
  },
  {
    id: 'seg-3',
    patioId: 'costanera',
    bloqueId: 'C1',
    bahiaId: 'C1-03',
    segregationType: 'Empty 20DC',
    colorCode: '#6B7280',
    assignedBy: 'modelMagdalena',
    timestamp: new Date()
  },
  {
    id: 'seg-4',
    patioId: 'costanera',
    bloqueId: 'C1',
    bahiaId: 'C1-04', 
    segregationType: 'Reefer 40HC',
    colorCode: '#8B5CF6',
    assignedBy: 'modelMagdalena',
    timestamp: new Date()
  },
  {
    id: 'seg-5',
    patioId: 'costanera',
    bloqueId: 'C1',
    bahiaId: 'C1-05',
    segregationType: 'IMO Class 1',
    colorCode: '#EF4444',
    assignedBy: 'modelMagdalena',
    timestamp: new Date()
  }
];

// Datos simulados de funciones objetivo
const mockObjectiveFunctions: ObjectiveFunction[] = [
  {
    id: 'obj-1',
    name: 'Minimizar Distancia de Traslado',
    value: 2850,
    dataSource: 'modelMagdalena',
    timestamp: new Date(),
    description: 'Distancia total recorrida por las grúas RTG en el patio',
    target: 3000,
    unit: 'm'
  },
  {
    id: 'obj-2',
    name: 'Maximizar Agrupación por Tipo',
    value: 85,
    dataSource: 'modelMagdalena',
    timestamp: new Date(),
    description: 'Porcentaje de contenedores agrupados por tipo',
    target: 90,
    unit: '%'
  },
  {
    id: 'obj-3',
    name: 'Minimizar Reubicaciones',
    value: 12,
    dataSource: 'modelMagdalena',
    timestamp: new Date(),
    description: 'Número de reubicaciones necesarias',
    target: 10,
    unit: ''
  },
  {
    id: 'obj-4',
    name: 'Optimizar Tiempo de Atención',
    value: 28.5,
    dataSource: 'modelCamila',
    timestamp: new Date(),
    description: 'Tiempo promedio de atención por contenedor',
    target: 30,
    unit: 'min'
  }
];

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

export const TimeAwareBloqueView: React.FC<TimeAwareBloqueViewProps> = ({
  patioId,
  bloqueId,
}) => {
  // Estado local
  const [selectedBahia, setSelectedBahia] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSegregations, setShowSegregations] = useState(true);
  const [segregationFilter, setSegregationFilter] = useState('all');
  const [showObjectiveInfo, setShowObjectiveInfo] = useState<string | null>(null);
  
  // Contexto de tiempo
  const { timeState, isLoadingData } = useTimeContext();

  // Encontrar los datos del patio y bloque
  const patio = patioData.find(p => p.id === patioId);
  const bloque = patio?.bloques.find(b => b.id === bloqueId);
  
  // Obtener segregaciones para el bloque actual (simular datos dinámicos)
  const [currentSegregations, setCurrentSegregations] = useState<SegregationData[]>([]);
  
  // Efectos para cargar datos según el estado de tiempo
  useEffect(() => {
    // Simular carga de datos para diferentes periodos de tiempo
    const loadSegregationData = () => {
      // En un caso real, esto cargaría datos del servidor según timeState
      const filteredData = mockSegregationData.filter(seg => 
        seg.patioId === patioId && 
        seg.bloqueId === bloqueId &&
        (seg.assignedBy === timeState.dataSource || timeState.dataSource === 'historical')
      );
      
      // Generar algunos datos aleatorios adicionales para simular diferentes segregaciones
      const additionalData: SegregationData[] = [];
      if (bloque) {
        // Tomar algunas bahías aleatorias para asignar segregaciones
        const sampleBahias = bloque.bahias
          .filter(b => !filteredData.some(seg => seg.bahiaId === b.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 20);
        
        const segregationTypes = [
          'Import 40HC', 'Export 20DC', 'Empty 20DC', 'Reefer 40HC', 
          'IMO Class 1', 'Import 20DC', 'Export 40HC'
        ];
        
        sampleBahias.forEach((bahia, index) => {
          const type = segregationTypes[index % segregationTypes.length];
          additionalData.push({
            id: `seg-gen-${index}`,
            patioId,
            bloqueId,
            bahiaId: bahia.id,
            segregationType: type,
            colorCode: '', // Se generará dinámicamente
            assignedBy: timeState.dataSource,
            timestamp: new Date()
          });
        });
      }
      
      setCurrentSegregations([...filteredData, ...additionalData]);
    };
    
    // Simular demora en carga
    setTimeout(loadSegregationData, 500);
  }, [patioId, bloqueId, timeState, bloque]);
  
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
    
    // Filtrar por segregación si está activado
    const segregation = currentSegregations.find(seg => seg.bahiaId === bahia.id);
    const matchesSegregation = !showSegregations || 
      segregationFilter === 'all' || 
      (segregation && segregation.segregationType === segregationFilter);
    
    return matchesStatus && matchesSearch && matchesSegregation;
  });

  const stats = calculateBloqueStats(bloque);

  // Organizar bahías en grid 7x7
  const rows = 7;
  const cols = 7;
  const bahiaWidth = 70;
  const bahiaHeight = 50;
  const spacing = 8;

  // Obtener el color de segregación para una bahía específica
  const getSegregationForBahia = (bahiaId: string) => {
    const segregation = currentSegregations.find(seg => seg.bahiaId === bahiaId);
    if (!segregation || !showSegregations) return undefined;
    
    // Usar el color predefinido si existe, o generar uno basado en el tipo
    const color = segregation.colorCode || (() => {
      // Colores predefinidos para tipos comunes
      const colorMap: Record<string, string> = {
        'Import 40HC': '#3B82F6',
        'Export 20DC': '#F59E0B',
        'Empty 20DC': '#6B7280',
        'Reefer 40HC': '#8B5CF6',
        'IMO Class 1': '#EF4444',
        'Import 20DC': '#0EA5E9',
        'Export 40HC': '#F97316'
      };
      
      return colorMap[segregation.segregationType] || '#9CA3AF';
    })();
    
    return {
      type: segregation.segregationType,
      color
    };
  };

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

          {/* Info de tiempo */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-blue-800">
              <Calendar size={16} className="mr-2 text-blue-500" />
              <span className="font-medium">Período:</span> 
              <span className="ml-1">{timeState.unit === 'hour' ? 'Por hora' : timeState.unit === 'shift' ? 'Por turno' : 'Semanal'}</span>
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

              {/* Toggle de segregaciones */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Mostrar segregaciones:</span>
                <div 
                  className={`relative w-10 h-5 transition-colors duration-200 ease-in-out rounded-full ${
                    showSegregations ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  onClick={() => setShowSegregations(!showSegregations)}
                >
                  <div 
                    className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform ${
                      showSegregations ? 'translate-x-5' : ''
                    }`}
                  ></div>
                </div>
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
          
          {isLoadingData ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando datos del bloque...</span>
            </div>
          ) : (
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
                    
                    // Obtener información de segregación
                    const segregation = getSegregationForBahia(bahia.id);
                    
                    return (
                      <BahiaComponent
                        key={bahia.id}
                        bahia={bahia}
                        position={{ x, y }}
                        size={{ width: bahiaWidth, height: bahiaHeight }}
                        isSelected={selectedBahia === bahia.id}
                        isVisible={isVisible}
                        onClick={() => setSelectedBahia(bahia.id)}
                        segregation={segregation?.type}
                        segregationColor={segregation?.color}
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
          )}
        </div>
      </div>

      {/* Panel lateral con información detallada */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200 p-6 overflow-y-auto">
        {/* Pestañas para la información lateral */}
        <div className="flex border-b border-gray-200 mb-4">
          <button 
            className={`pb-2 px-4 text-sm font-medium ${
              !showObjectiveInfo ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setShowObjectiveInfo(null)}
          >
            Detalles
          </button>
          <button 
            className={`pb-2 px-4 text-sm font-medium ${
              showObjectiveInfo ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setShowObjectiveInfo('summary')}
          >
            Funciones Objetivo
          </button>
        </div>

        {showObjectiveInfo ? (
          <ObjectiveFunctionPanel 
            objectiveFunctions={mockObjectiveFunctions}
            timeState={timeState}
            isLoading={isLoadingData}
            onShowInfo={(id) => setShowObjectiveInfo(id)}
          />
        ) : (
          <>
            {/* Panel de segregación */}
            {showSegregations && (
              <div className="mb-6">
                <SegregationPanel 
                  segregationData={currentSegregations}
                  timeState={timeState}
                  isLoading={isLoadingData}
                  onFilterChange={setSegregationFilter}
                  currentFilter={segregationFilter}
                />
              </div>
            )}

            {/* Información del bloque */}
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
                  Bahía Seleccionada: {selectedBahia}
                </h4>
                
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-blue-600">Cargando...</span>
                  </div>
                ) : (
                  <>
                    {/* Datos de la bahía */}
                    {(() => {
                      const bahia = bloque.bahias.find(b => b.id === selectedBahia);
                      if (!bahia) return <p className="text-sm text-blue-600">Bahía no encontrada</p>;
                      
                      // Encontrar información de segregación
                      const segregation = currentSegregations.find(s => s.bahiaId === bahia.id);
                      
                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-600">Estado:</span>
                            <span className="font-medium">
                              {bahia.occupied ? 'Ocupada' : 'Libre'}
                            </span>
                          </div>
                          
                          {/* Información de segregación */}
                          {segregation && showSegregations && (
                            <div className="flex justify-between">
                              <span className="text-blue-600">Segregación:</span>
                              <span className="font-medium">
                                {segregation.segregationType}
                              </span>
                            </div>
                          )}
                          
{bahia.occupied && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-blue-600">Tipo:</span>
                                <span className="font-medium capitalize">
                                  {bahia.containerType}
                                </span>
                              </div>
                              
                              {bahia.containerId && (
                                <div className="flex justify-between">
                                  <span className="text-blue-600">Contenedor:</span>
                                  <span className="font-medium font-mono text-xs">
                                    {bahia.containerId}
                                  </span>
                                </div>
                              )}
                              
                              {bahia.size && (
                                <div className="flex justify-between">
                                  <span className="text-blue-600">Tamaño:</span>
                                  <span className="font-medium">{bahia.size}'</span>
                                </div>
                              )}
                              
                              {bahia.weight && (
                                <div className="flex justify-between">
                                  <span className="text-blue-600">Peso:</span>
                                  <span className="font-medium">{bahia.weight.toLocaleString()} kg</span>
                                </div>
                              )}
                              
                              {bahia.destination && (
                                <div className="flex justify-between">
                                  <span className="text-blue-600">Destino:</span>
                                  <span className="font-medium">{bahia.destination}</span>
                                </div>
                              )}
                              
                              {bahia.lastMovement && (
                                <div className="flex justify-between">
                                  <span className="text-blue-600">Último movimiento:</span>
                                  <span className="font-medium text-xs">
                                    {bahia.lastMovement.toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* Última actualización */}
            <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                Última actualización: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </>
        )}
      </div>
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
  onClick,
  segregation,
  segregationColor
}) => {
  // Priorizar el color de segregación si está disponible
  const getFillColor = (): string => {
    if (segregationColor) return segregationColor;
    
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
    if (segregation) return '🔵'; // Indicador de segregación
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
        fill={getFillColor()}
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
      
      {/* Icono de estado o segregación */}
      <text
        x={size.width / 2}
        y="28"
        textAnchor="middle"
        className="pointer-events-none"
        fontSize="12"
      >
        {getStatusIcon()}
      </text>
      
      {/* Tipo de segregación o ID del contenedor */}
      {segregation ? (
        <text
          x={size.width / 2}
          y="40"
          textAnchor="middle"
          className="fill-white text-xs pointer-events-none font-bold"
          fontSize="7"
        >
          {segregation.substring(0, 10)}
        </text>
      ) : bahia.occupied && bahia.containerId && (
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