// src/components/layout/Sidebar.tsx - VERSIÓN OPTIMIZADA
import React from 'react';
import { ChevronLeft, ChevronRight, Activity, BarChart2, Calendar, MapPin } from 'lucide-react';
import type { Filters } from '../../types';
import { FilterToggle } from '../shared/FilterToggle';
import { DataSourceSelector } from '../shared/DataSourceSelector';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import { useTimeContext } from '../../contexts/TimeContext';

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
  const { viewState } = useViewNavigation();
  const { timeState } = useTimeContext();

  const showDataSelector = (
    viewState.level === 'patio' &&
    viewState.selectedPatio?.toLowerCase() === 'costanera'
  ) || (
      viewState.level === 'bloque' &&
      viewState.selectedPatio?.toLowerCase() === 'costanera'
    );

  if (isMenuCollapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 h-full flex-shrink-0">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      {/* Header fijo */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-800">Panel de Control</h3>
          <button
            onClick={toggleMenu}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          {showDataSelector ? 'Patio Costanera - Opciones Avanzadas' : 'Configuración General'}
        </p>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">

          {/* Estado actual compacto */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin size={16} className="mr-1" />
              Vista Actual
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Nivel: <span className="font-mono font-medium">{viewState.level}</span></div>
              {viewState.selectedPatio && (
                <div>Patio: <span className="font-mono font-medium">{viewState.selectedPatio}</span></div>
              )}
              {viewState.selectedBloque && (
                <div>Bloque: <span className="font-mono font-medium">{viewState.selectedBloque}</span></div>
              )}
            </div>

            {showDataSelector && (
              <div className="mt-2 text-xs text-green-600 bg-green-50 rounded p-2">
                ✅ Opciones de Magdalena disponibles
              </div>
            )}
          </div>

          {/* Tipo de vista compacto */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <BarChart2 size={16} className="mr-1" />
              Tipo de Vista
            </h4>
            <div className="grid grid-cols-3 gap-1">
              {['operativo', 'analitico', 'planificacion'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs py-1.5 px-2 rounded transition-colors ${activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros compactos */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Activity size={16} className="mr-1" />
              Filtros
            </h4>
            <div className="space-y-1.5">
              <FilterToggle
                label="Ocupación"
                isActive={filters.showOccupancy}
                onToggle={() => toggleFilter('showOccupancy')}
              />
              <FilterToggle
                label="Productividad"
                isActive={filters.showProductivity}
                onToggle={() => toggleFilter('showProductivity')}
              />
              <FilterToggle
                label="Tiempo Camión"
                isActive={filters.showTruckTime}
                onToggle={() => toggleFilter('showTruckTime')}
              />
            </div>
          </div>

          {/* Métricas actuales compactas */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar size={16} className="mr-1" />
              Métricas Actuales
            </h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ocupación:</span>
                <span className="font-medium">{(currentOcupacion * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BMPH:</span>
                <span className="font-medium">{currentProductividad.bmph}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tiempo:</span>
                <span className="font-medium">{currentTiempoCamion.toFixed(1)}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de datos - Fijo en la parte inferior */}
      {showDataSelector && (
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <DataSourceSelector />
        </div>
      )}
    </div>
  );
};