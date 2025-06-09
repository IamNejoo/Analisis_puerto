// src/components/dashboard/Dashboard.tsx - VERSIÓN CORREGIDA CON MODELOS NO SOLAPADOS
import React, { useState, useCallback, useMemo } from 'react';
import { MapPanel } from './MapPanel';
import { CorePortKPIPanel } from './CorePortKPIPanel';
import { PortPerformancePanel } from './PortPerformancePanel';
import MagdalenaKPIPanel from '../magdalena/MagdalenaKPIPanel';
import MagdalenaComparisonPanel from '../magdalena/ComparisonPanel';
import CamilaIntegratedPanel from '../camila/CamilaIntegratedPanel';
import { usePortData } from '../../hooks/usePortData';
import { useFilters } from '../../hooks/useFilters';
import { useTimeContext } from '../../contexts/TimeContext';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import { useCamilaData } from '../../hooks/useCamilaData';
import { patioData } from '../../data/patioData';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  User,
  Settings,
  Filter,
  BarChart2,
  MapPin
} from 'lucide-react';
import { DataSourceSelector } from '../shared/DataSourceSelector';
import type { Filters } from '../../types';

interface DashboardProps {
  portDataPath?: string;
  blockCapacities?: Record<string, number>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  portDataPath = '/data/Prueba.csv',
  blockCapacities
}) => {
  const [activeTab, setActiveTab] = useState('operativo');
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [showMagdalenaComparison, setShowMagdalenaComparison] = useState(false);
  const [showCamilaDetail, setShowCamilaDetail] = useState(false);

  const {
    getColorForOcupacion,
    currentOcupacion,
    currentProductividad,
    currentTiempoCamion
  } = usePortData();

  const { filters, toggleFilter } = useFilters();
  const { timeState, isLoadingData } = useTimeContext();
  const { viewState } = useViewNavigation();

  // Variables estáticas para evitar re-cálculos
  const isInCostanera = useMemo(() => {
    return (
      viewState.level === 'patio' &&
      viewState.selectedPatio?.toLowerCase() === 'costanera'
    ) || (
        viewState.level === 'bloque' &&
        viewState.selectedPatio?.toLowerCase() === 'costanera'
      );
  }, [viewState.level, viewState.selectedPatio]);

  const isMagdalenaActive = useMemo(() => {
    return timeState?.dataSource === 'modelMagdalena' && isInCostanera;
  }, [timeState?.dataSource, isInCostanera]);

  const isCamilaActive = useMemo(() => {
    return timeState?.dataSource === 'modelCamila' && isInCostanera;
  }, [timeState?.dataSource, isInCostanera]);

  const currentPatio = useMemo(() => {
    return patioData.find(p => p.id === viewState.selectedPatio);
  }, [viewState.selectedPatio]);

  const toggleMenu = useCallback(() => {
    setIsMenuCollapsed(prev => !prev);
  }, []);

  const showDataSelector = (
    viewState.level === 'patio' &&
    viewState.selectedPatio?.toLowerCase() === 'costanera'
  ) || (
      viewState.level === 'bloque' &&
      viewState.selectedPatio?.toLowerCase() === 'costanera'
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-blue-900 text-white py-2 px-4 shadow-md flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Terminal Operation System - DP World</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock size={20} />
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={20} />
              <span>{new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>
            <div className="border-l pl-6 flex items-center space-x-2">
              <User size={20} />
              <span>Operador</span>
              <span className="bg-blue-700 text-xs px-2 py-0.5 rounded-full">Terminal</span>
            </div>
            <Settings size={20} className="cursor-pointer hover:text-blue-200 transition-colors" />
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        {!isMenuCollapsed ? (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
            {/* Header del sidebar */}
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

            {/* Contenido del sidebar con scroll */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Estado actual */}
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
                      ✅ Opciones de modelos disponibles
                    </div>
                  )}
                </div>

                {/* Tipo de vista */}
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

                {/* Filtros */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Filter size={16} className="mr-1" />
                    Filtros Visuales
                  </h4>
                  <div className="space-y-1.5">
                    {Object.entries(filters).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-gray-700">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^show /, '').trim()}
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => toggleFilter(key)}
                            className="sr-only"
                          />
                          <div className={`w-8 h-4 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'
                            }`}>
                            <div className={`w-3 h-3 bg-white rounded-full transform transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'
                              } translate-y-0.5`} />
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Métricas actuales */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Activity size={16} className="mr-1" />
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
        ) : (
          // Sidebar colapsado
          <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 h-full flex-shrink-0">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        )}

        {/* ÁREA PRINCIPAL DE CONTENIDO */}
        <main className="flex-1 overflow-hidden">
          {/* VISTA TERMINAL: Solo Mapa en pantalla completa */}
          {viewState.level === 'terminal' && (
            <div className="h-full">
              <MapPanel
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filters={filters}
                getColorForOcupacion={getColorForOcupacion}
                timeState={timeState}
                isLoading={isLoadingData}
                blockCapacities={blockCapacities}
              />
            </div>
          )}

          {/* VISTA PATIO: LAYOUT CON SCROLL PARA ANÁLISIS DETALLADO */}
          {viewState.level === 'patio' && (
            <div className="h-full overflow-y-auto">
              {/* INDICADOR DE MODELO ACTIVO (fijo arriba) */}
              {(isMagdalenaActive || isCamilaActive) && (
                <div className="sticky top-0 z-20 p-4 bg-gray-50 border-b border-gray-200">
                  {isMagdalenaActive && (
                    <div className="bg-gradient-to-r from-green-50 to-purple-50 border-2 border-green-200 rounded-xl px-6 py-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <div>
                            <span className="text-lg font-bold text-green-800">
                              🔮 Modelo Magdalena Activo
                            </span>
                            <div className="text-sm text-green-700 mt-1">
                              {viewState.selectedPatio} • Semana {timeState.magdalenaConfig?.semana} •
                              Participación {timeState.magdalenaConfig?.participacion}% •
                              {timeState.magdalenaConfig?.conDispersion ? 'Con Dispersión' : 'Centralizada'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowMagdalenaComparison(!showMagdalenaComparison)}
                          className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg ${showMagdalenaComparison
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                            }`}
                        >
                          {showMagdalenaComparison ? (
                            <>
                              <ChevronUp size={16} className="mr-2 inline" />
                              Ocultar Análisis Detallado
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} className="mr-2 inline" />
                              Ver Análisis Detallado
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {isCamilaActive && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl px-6 py-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-4 animate-pulse"></div>
                          <div>
                            <span className="text-lg font-bold text-purple-800">
                              ⚡ Modelo Camila Activo
                            </span>
                            <div className="text-sm text-purple-700 mt-1">
                              {viewState.selectedPatio} • Semana {timeState.camilaConfig?.week} •
                              Modelo {timeState.camilaConfig?.modelType === 'minmax' ? 'MinMax' : 'MaxMin'} •
                              {timeState.camilaConfig?.withSegregations ? 'Con Segregaciones' : 'Sin Segregaciones'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowCamilaDetail(!showCamilaDetail)}
                          className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg ${showCamilaDetail
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                            }`}
                        >
                          {showCamilaDetail ? (
                            <>
                              <ChevronUp size={16} className="mr-2 inline" />
                              Ocultar Análisis Detallado
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} className="mr-2 inline" />
                              Ver Análisis Detallado
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CONTENEDOR PRINCIPAL CON MAPA Y KPIs */}
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* COLUMNA IZQUIERDA: MAPA (2/3 del espacio) */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg h-[calc(100vh-250px)]">
                      <MapPanel
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        filters={filters}
                        getColorForOcupacion={getColorForOcupacion}
                        timeState={timeState}
                        isLoading={isLoadingData}
                        blockCapacities={blockCapacities}
                      />
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: KPIs (1/3 del espacio) */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                      {/* KPIs FUNDAMENTALES */}
                      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg">
                        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
                          <h3 className="font-bold text-blue-900 text-lg flex items-center">
                            <BarChart3 size={20} className="mr-3" />
                            KPIs de Congestión del Terminal
                          </h3>
                          <p className="text-blue-700 text-sm">
                            KPIs del patio {viewState.selectedPatio}
                          </p>
                        </div>
                        <div className="p-4">
                          <CorePortKPIPanel
                            dataFilePath="/data/resultados_congestion_SAI_2022.csv"
                            blockCapacities={blockCapacities}
                          />
                        </div>
                      </div>

                      {/* INFORMACIÓN DEL PATIO */}
                      {currentPatio && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                            📊 Estadísticas Operacionales
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-700">{currentPatio.bloques.length}</div>
                              <div className="text-xs text-green-600">Bloques Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-700">{currentPatio.ocupacionTotal}%</div>
                              <div className="text-xs text-green-600">Ocupación</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-green-600">
                                {currentPatio.bloques.filter(b => b.operationalStatus === 'active').length}
                              </div>
                              <div className="text-xs text-green-600">Activos</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-orange-600">
                                {currentPatio.bloques.filter(b => b.operationalStatus === 'maintenance').length}
                              </div>
                              <div className="text-xs text-orange-600">Mantenimiento</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* KPIs DE MODELOS SI ESTÁN ACTIVOS */}
                      {isMagdalenaActive && (
                        <div className="bg-white rounded-xl border-2 border-purple-200 shadow-lg">
                          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-purple-100">
                            <h3 className="font-bold text-purple-900 text-lg">
                              🔮 KPIs Modelo Magdalena
                            </h3>
                          </div>
                          <div className="p-4">
                            <MagdalenaKPIPanel />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ANÁLISIS DETALLADO - Aparece debajo cuando se activa */}
                {showMagdalenaComparison && isMagdalenaActive && (
                  <div className="mt-4">
                    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg">
                      <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-2xl text-gray-900 flex items-center">
                              🔍 Análisis Detallado - Magdalena vs Real
                            </h3>
                            <p className="text-gray-700 mt-2 font-medium">
                              Comparaciones, segregaciones, workload y métricas avanzadas
                            </p>
                          </div>
                          <button
                            onClick={() => setShowMagdalenaComparison(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <ChevronUp size={24} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <MagdalenaComparisonPanel />
                      </div>
                    </div>
                  </div>
                )}

                {showCamilaDetail && isCamilaActive && (
                  <div className="mt-4">
                    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg">
                      <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-2xl text-gray-900 flex items-center">
                              🔍 Análisis Detallado - Modelo Camila
                            </h3>
                            <p className="text-gray-700 mt-2 font-medium">
                              Optimización de carga de trabajo, asignación de grúas y análisis temporal
                            </p>
                          </div>
                          <button
                            onClick={() => setShowCamilaDetail(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <ChevronUp size={24} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <CamilaIntegratedPanel />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISTA BLOQUE: Layout original permanece igual */}
          {viewState.level === 'bloque' && (
            <div className="h-full overflow-y-auto overflow-x-hidden">
              <div className="min-h-full flex flex-col gap-4 p-4">
                {/* Indicadores de modelos si están activos */}
                {isMagdalenaActive && (
                  <div className="bg-gradient-to-r from-green-50 to-purple-50 border-2 border-green-200 rounded-xl px-6 py-4 shadow-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                        <div>
                          <span className="text-lg font-bold text-green-800">
                            🔮 Modelo Magdalena Activo
                          </span>
                          <div className="text-sm text-green-700 mt-1">
                            {viewState.selectedPatio} • Bloque {viewState.selectedBloque} • Semana {timeState.magdalenaConfig?.semana}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mapa del bloque */}
                <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg" style={{ height: '600px' }}>
                  <MapPanel
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    filters={filters}
                    getColorForOcupacion={getColorForOcupacion}
                    timeState={timeState}
                    isLoading={isLoadingData}
                    blockCapacities={blockCapacities}
                  />
                </div>

                {/* KPIs del bloque */}
                <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
                    <h3 className="font-bold text-blue-900 text-lg flex items-center">
                      <BarChart3 size={20} className="mr-3" />
                      KPIs Fundamentales de la Terminal
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Vista detallada del bloque {viewState.selectedBloque}
                    </p>
                  </div>
                  <div className="p-4">
                    <CorePortKPIPanel
                      dataFilePath="/data/resultados_congestion_SAI_2022.csv"
                      blockCapacities={blockCapacities}
                    />
                  </div>
                </div>

                <div className="h-8"></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};