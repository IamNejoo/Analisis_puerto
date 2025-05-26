import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { MapPanel } from './MapPanel';
import { KPIPanel } from './KPIPanel';
import { AlertsPanel } from './AlertsPanel';
import { ShipSchedulePanel } from './ShipSchedulePanel';
import { ChartsPanel } from './ChartsPanel';
import { useFilters } from '../../hooks/useFilters';
import { usePortData } from '../../hooks/usePortData';

export const Dashboard: React.FC = () => {
  // Estado local
  const [isMenuCollapsed, setIsMenuCollapsed] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('operativo');
  
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

  // Función para alternar el menú
  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
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
            />
            
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
        />
      </div>
    </MainLayout>
  );
};