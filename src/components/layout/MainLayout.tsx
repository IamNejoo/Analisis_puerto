import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { RefreshCw, Maximize2, Search } from 'lucide-react';
import type { Filters } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  isMenuCollapsed: boolean;
  toggleMenu: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: Filters;
  toggleFilter: (filter: string) => void;
  currentOcupacion: number;
  currentProductividad: { bmph: number; gmph: number };
  currentTiempoCamion: number;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  isMenuCollapsed,
  toggleMenu,
  activeTab,
  setActiveTab,
  filters,
  toggleFilter,
  currentOcupacion,
  currentProductividad,
  currentTiempoCamion
}) => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isMenuCollapsed={isMenuCollapsed}
          toggleMenu={toggleMenu}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filters={filters}
          toggleFilter={toggleFilter}
          currentOcupacion={currentOcupacion}
          currentProductividad={currentProductividad}
          currentTiempoCamion={currentTiempoCamion}
        />

        {/* Main Panel */}
        <main className="flex-1 overflow-auto p-4">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Vista Operacional - Terminal San Antonio</h2>
              <p className="text-gray-500">Monitoreo en tiempo real de operaciones portuarias</p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-white p-2 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors" aria-label="Actualizar">
                <RefreshCw size={20} className="text-gray-600" />
              </button>
              <button className="bg-white p-2 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors" aria-label="Pantalla completa">
                <Maximize2 size={20} className="text-gray-600" />
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Dashboard Content */}
          {children}
        </main>
      </div>
    </div>
  );
};