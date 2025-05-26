import React from 'react';
import { ChevronLeft, ChevronRight, Activity, BarChart2, Calendar } from 'lucide-react';
import type { Filters } from '../../types';
import { FilterToggle } from '../shared/FilterToggle';

interface SidebarProps {
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

export const Sidebar: React.FC<SidebarProps> = ({
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
  const filterLabels: Record<string, string> = {
    showGates: 'Gates',
    showContainers: 'Containers',
    showAduanas: 'Aduanas',
    showTebas: 'Tebas',
    showIMO: 'IMO',
    showOHiggins: 'OHiggins',
    showEspingon: 'Espingon',
    showGruas: 'Gruas',
    showCaminos: 'Caminos'
  };

  return (
    <aside className={`bg-gray-800 text-white transition-all ${isMenuCollapsed ? 'w-16' : 'w-64'} flex flex-col shadow-xl`}>
      {/* Toggle Button */}
      <button 
        onClick={toggleMenu} 
        className="p-3 flex justify-end hover:bg-gray-700 transition-colors"
        aria-label={isMenuCollapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {isMenuCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </button>
      
      {/* Sidebar Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center">
          <img src="/api/placeholder/40/40" alt="DP World Logo" className={`rounded-full ${isMenuCollapsed ? '' : 'mr-3'}`} />
          {!isMenuCollapsed && (
            <div>
              <h2 className="font-bold text-lg">DP World</h2>
              <p className="text-xs text-gray-400">San Antonio Terminal</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          <li 
            className={`py-2 px-4 ${activeTab === 'operativo' ? 'bg-blue-700' : 'hover:bg-gray-700'} rounded-lg mx-2 mb-1 transition-colors cursor-pointer`} 
            onClick={() => setActiveTab('operativo')}
          >
            <div className="flex items-center">
              <Activity size={20} className="flex-shrink-0" />
              {!isMenuCollapsed && <span className="ml-3">Operativo</span>}
            </div>
          </li>
          <li 
            className={`py-2 px-4 ${activeTab === 'analitico' ? 'bg-blue-700' : 'hover:bg-gray-700'} rounded-lg mx-2 mb-1 transition-colors cursor-pointer`} 
            onClick={() => setActiveTab('analitico')}
          >
            <div className="flex items-center">
              <BarChart2 size={20} className="flex-shrink-0" />
              {!isMenuCollapsed && <span className="ml-3">Analítico</span>}
            </div>
          </li>
          <li 
            className={`py-2 px-4 ${activeTab === 'planificacion' ? 'bg-blue-700' : 'hover:bg-gray-700'} rounded-lg mx-2 mb-1 transition-colors cursor-pointer`} 
            onClick={() => setActiveTab('planificacion')}
          >
            <div className="flex items-center">
              <Calendar size={20} className="flex-shrink-0" />
              {!isMenuCollapsed && <span className="ml-3">Planificación</span>}
            </div>
          </li>
        </ul>
        
        {!isMenuCollapsed && (
          <div className="mt-6 px-4">
            <h3 className="text-xs uppercase text-gray-400 font-bold mb-2">Filtros del Mapa</h3>
            <div className="space-y-1">
              {Object.keys(filters).map((filter) => (
                <FilterToggle 
                  key={filter}
                  label={filterLabels[filter] || filter} 
                  isActive={filters[filter]} 
                  onToggle={() => toggleFilter(filter)}
                />
              ))}
            </div>
          </div>
        )}
      </nav>
      
      {/* KPIs Section */}
      {!isMenuCollapsed && (
        <div className="border-t border-gray-700 p-4">
          <h3 className="text-xs uppercase text-gray-400 font-bold mb-3">KPIs Críticos</h3>
          
          <div className="space-y-4">
            {/* Ocupación de Sitio */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">Ocupación de sitio</h4>
                <div className="flex items-center">
                  <span className="text-xl font-bold">{currentOcupacion}%</span>
                  <span className="ml-2 text-xs text-green-400 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    4%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Productividad de muelle */}
            <div>
              <h4 className="text-sm font-semibold">Productividad de muelle</h4>
              <div className="flex items-center">
                <span className="text-xl font-bold">{currentProductividad.bmph}</span>
                <span className="text-sm text-gray-400 ml-1">BMPH</span>
                <span className="ml-2 text-xs text-green-400 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  5%
                </span>
              </div>
            </div>
            
            {/* Tiempo de ciclo de camión */}
            <div>
              <h4 className="text-sm font-semibold">Tiempo de ciclo camión</h4>
              <div className="flex items-center">
                <span className="text-xl font-bold">{currentTiempoCamion}</span>
                <span className="text-sm text-gray-400 ml-1">min</span>
                <span className="ml-2 text-xs text-green-400 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  2.4
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};