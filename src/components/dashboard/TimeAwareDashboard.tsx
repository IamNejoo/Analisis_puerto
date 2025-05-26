import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { MapPanel } from './MapPanel';
import { KPIPanel } from './KPIPanel';
import { AlertsPanel } from './AlertsPanel';
import { ShipSchedulePanel } from './ShipSchedulePanel';
import { ChartsPanel } from './ChartsPanel';
import { TimeNavigationPanel } from './TimeNavigationPanel';
import { CongestionIndicatorsPanel } from './CongestionIndicatorsPanel';
import { ModelComparisonPanel } from './ModelComparisonPanel';
import { TimeProvider, useTimeContext } from '../../contexts/TimeContext';
import { useFilters } from '../../hooks/useFilters';
import { usePortData } from '../../hooks/usePortData';

// Datos simulados para los indicadores de congestión
const mockCongestionIndicators = [
  {
    id: 'gate_queue',
    name: 'Cola en Puertas',
    value: 12.5,
    description: 'Tiempo promedio de espera en puertas (minutos)',
    timestamp: new Date(),
    dataSource: 'historical' as const,
    trend: 'up' as const,
    threshold: 15,
    unit: 'min'
  },
  {
    id: 'yard_density',
    name: 'Densidad de Patio',
    value: 82.3,
    description: 'Porcentaje de ocupación promedio en patios',
    timestamp: new Date(),
    dataSource: 'historical' as const,
    trend: 'up' as const,
    threshold: 85,
    unit: '%'
  },
  {
    id: 'truck_wait',
    name: 'Espera de Camiones',
    value: 28.7,
    description: 'Tiempo promedio de ciclo de camiones en terminal',
    timestamp: new Date(),
    dataSource: 'historical' as const,
    trend: 'down' as const,
    threshold: 35,
    unit: 'min'
  },
  {
    id: 'crane_util',
    name: 'Utilización de Grúas',
    value: 68.2,
    description: 'Porcentaje de utilización de grúas STS',
    timestamp: new Date(),
    dataSource: 'historical' as const,
    trend: 'stable' as const,
    threshold: 75,
    unit: '%'
  }
];

// Datos simulados para comparación de modelos
const mockComparisonData = [
  {
    historical: 82.3,
    modelMagdalena: 75.1,
    modelCamila: 78.6,
    indicator: 'Ocupación de Patio',
    timestamp: new Date(),
    unit: '%'
  },
  {
    historical: 28.7,
    modelMagdalena: 24.3,
    modelCamila: 21.8,
    indicator: 'Tiempo de Ciclo',
    timestamp: new Date(),
    unit: 'min'
  },
  {
    historical: 68.2,
    modelMagdalena: 73.5,
    modelCamila: 71.9,
    indicator: 'Utilización de Grúas',
    timestamp: new Date(),
    unit: '%'
  },
  {
    historical: 12.5,
    modelMagdalena: 8.7,
    modelCamila: 9.2,
    indicator: 'Tiempo de Cola',
    timestamp: new Date(),
    unit: 'min'
  }
];

// Componente interno que utiliza el contexto de tiempo
const TimeAwareDashboardContent: React.FC = () => {
  // Estado local
  const [isMenuCollapsed, setIsMenuCollapsed] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('operativo');
  const [showModelComparison, setShowModelComparison] = React.useState(false);
  
  // Hooks para datos y filtros
  const { filters, toggleFilter } = useFilters();
  const { 
    ocupacionData,
    productividadData,
    tiempoCamionData,
    ocupacionPatioData,
    alertasData,
    navesData,
    currentOcupacion,
    currentProductividad,
    currentTiempoCamion,
    getColorForOcupacion
  } = usePortData();

  // Contexto de tiempo
  const {
    timeState,
    setTimeUnit,
    setDataSource,
    moveForward,
    moveBackward,
    goToDate,
    getDisplayFormat,
    isLoadingData
  } = useTimeContext();

  // Función para alternar el menú
  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  // Mostrar u ocultar la comparación de modelos
  const toggleModelComparison = () => {
    setShowModelComparison(!showModelComparison);
  };

  // Resetear al tiempo actual
  const resetToNow = () => {
    goToDate(new Date());
  };

  return (
    <MainLayout
      isMenuCollapsed={isMenuCollapsed}
      toggleMenu={toggleMenu}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      filters={filters}
      toggleFilter={toggleFilter}
      currentOcupacion={currentOcupacion}
      currentProductividad={currentProductividad}
      currentTiempoCamion={currentTiempoCamion}
    >
      {/* Panel de navegación temporal */}
      <div className="mb-4">
        <TimeNavigationPanel
          timeUnit={timeState.unit}
          dataSource={timeState.dataSource}
          displayFormat={getDisplayFormat()}
          onUnitChange={setTimeUnit}
          onDataSourceChange={setDataSource}
          onMoveForward={moveForward}
          onMoveBackward={moveBackward}
          onResetToNow={resetToNow}
          isLoading={isLoadingData}
        />
      </div>

      {/* Contenido principal del dashboard */}
      <div className="space-y-4">
        {/* Primera fila - Mapa y paneles laterales */}
        <div className="grid grid-cols-12 gap-4">
          {/* Map Panel - 8 columns wide */}
          <MapPanel 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filters={filters}
            getColorForOcupacion={getColorForOcupacion}
            timeState={timeState}
            isLoading={isLoadingData}
          />
          
          {/* Right sidebar - 4 columns wide */}
          <div className="col-span-4 space-y-4">
            {/* KPIs */}
            <KPIPanel 
              currentOcupacion={currentOcupacion}
              currentProductividad={currentProductividad}
              currentTiempoCamion={currentTiempoCamion}
              ocupacionPatioData={ocupacionPatioData}
              getColorForOcupacion={getColorForOcupacion}
              timeState={timeState}
              isLoading={isLoadingData}
            />
            
            {/* Indicadores de Congestión */}
            <CongestionIndicatorsPanel 
              indicators={mockCongestionIndicators}
              dataSource={timeState.dataSource}
              isLoading={isLoadingData}
              onCompareWithHistorical={toggleModelComparison}
            />
            
            {/* Comparación de Modelos (condicional) */}
            {showModelComparison && (
              <ModelComparisonPanel 
                comparisonData={mockComparisonData}
                selectedModel={timeState.dataSource === 'historical' ? 'modelMagdalena' : timeState.dataSource}
                onSelectModel={setDataSource}
                isLoading={isLoadingData}
              />
            )}
            
            {/* Alertas */}
            <AlertsPanel alertasData={alertasData} />
            
            {/* Próximas Naves */}
            <ShipSchedulePanel navesData={navesData} />
          </div>
        </div>
        
        {/* Segunda fila - Charts Section */}
        <ChartsPanel 
          ocupacionData={ocupacionData}
          productividadData={productividadData}
          tiempoCamionData={tiempoCamionData}
          getColorForOcupacion={getColorForOcupacion}
          timeState={timeState}
          isLoading={isLoadingData}
        />
      </div>
    </MainLayout>
  );
};

/**
 * Dashboard con funcionalidad de navegación temporal
 * Envuelve el contenido en un proveedor de contexto de tiempo
 */
export const TimeAwareDashboard: React.FC = () => {
  return (
    <TimeProvider>
      <TimeAwareDashboardContent />
    </TimeProvider>
  );
};