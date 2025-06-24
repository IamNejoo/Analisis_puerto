// src/components/dashboard/Dashboard.tsx - VERSIÓN CON COLORES DEL PUERTO
import React, { useState, useCallback, useMemo } from 'react';
import { MapPanel } from './MapPanel';
import { CorePortKPIPanel } from './CorePortKPIPanel';

import MagdalenaKPIPanel from '../magdalena/MagdalenaKPIPanel';
import MagdalenaComparisonPanel from '../magdalena/ComparisonPanel';
import CamilaIntegratedPanel from '../camila/CamilaIntegratedPanel';
import { usePortData } from '../../hooks/usePortData';
import { useFilters } from '../../hooks/useFilters';
import { useTimeContext } from '../../contexts/TimeContext';
import { useViewNavigation } from '../../contexts/ViewNavigationContext';
import { patioData } from '../../data/patioData';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
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
    <div className="flex flex-col h-screen bg-slate-900"> {/* CAMBIADO: de bg-gray-50 a bg-slate-900 */}
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
          <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full flex-shrink-0"> {/* CAMBIADO: bg-white a bg-slate-800, border-gray-200 a border-slate-700 */}
            {/* Header del sidebar */}
            <div className="flex-shrink-0 p-4 border-b border-slate-700"> {/* CAMBIADO: border-gray-200 a border-slate-700 */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-100">Panel de Control</h3> {/* CAMBIADO: text-gray-800 a text-slate-100 */}
                <button
                  onClick={toggleMenu}
                  className="p-1 rounded hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft size={20} className="text-slate-400" /> {/* CAMBIADO: text-gray-600 a text-slate-400 */}
                </button>
              </div>
              <p className="text-sm text-slate-400"> {/* CAMBIADO: text-gray-500 a text-slate-400 */}
                {showDataSelector ? 'Patio Costanera - Opciones Avanzadas' : 'Configuración General'}
              </p>
            </div>

            {/* Contenido del sidebar con scroll */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Estado actual */}
                <div className="bg-slate-700/50 rounded-lg p-3"> {/* CAMBIADO: bg-gray-50 a bg-slate-700/50 */}
                  <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center"> {/* CAMBIADO: text-gray-700 a text-slate-300 */}
                    <MapPin size={16} className="mr-1" />
                    Vista Actual
                  </h4>
                  <div className="text-xs text-slate-400 space-y-1"> {/* CAMBIADO: text-gray-600 a text-slate-400 */}
                    <div>Nivel: <span className="font-mono font-medium">{viewState.level}</span></div>
                    {viewState.selectedPatio && (
                      <div>Patio: <span className="font-mono font-medium">{viewState.selectedPatio}</span></div>
                    )}
                    {viewState.selectedBloque && (
                      <div>Bloque: <span className="font-mono font-medium">{viewState.selectedBloque}</span></div>
                    )}
                  </div>
                  {showDataSelector && (
                    <div className="mt-2 text-xs text-green-400 bg-green-900/30 rounded p-2"> {/* CAMBIADO: text-green-600 bg-green-50 a text-green-400 bg-green-900/30 */}
                      ✅ Opciones de modelos disponibles
                    </div>
                  )}
                </div>

                {/* Métricas actuales */}
                <div className="bg-slate-700/50 rounded-lg p-3"> {/* CAMBIADO: bg-gray-50 a bg-slate-700/50 */}
                  <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center"> {/* CAMBIADO: text-gray-700 a text-slate-300 */}
                    <Activity size={16} className="mr-1" />
                    Métricas Actuales
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ocupación:</span> {/* CAMBIADO: text-gray-600 a text-slate-400 */}
                      <span className="font-medium text-slate-200">{(currentOcupacion * 100).toFixed(1)}%</span> {/* CAMBIADO: añadido text-slate-200 */}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">BMPH:</span>
                      <span className="font-medium text-slate-200">{currentProductividad.bmph}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tiempo:</span>
                      <span className="font-medium text-slate-200">{currentTiempoCamion.toFixed(1)}h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selector de datos - Fijo en la parte inferior */}
            {showDataSelector && (
              <div className="flex-shrink-0 border-t border-slate-700 p-4">
                <DataSourceSelector />
              </div>
            )}
          </div>
        ) : (
          // Sidebar colapsado
          <div className="w-16 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 h-full flex-shrink-0"> {/* CAMBIADO: bg-white a bg-slate-800, border-gray-200 a border-slate-700 */}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              <ChevronRight size={20} className="text-slate-400" /> {/* CAMBIADO: text-gray-600 a text-slate-400 */}
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
            <div className="h-full overflow-y-auto bg-slate-900"> {/* AÑADIDO: bg-slate-900 */}
              {/* INDICADOR DE MODELO ACTIVO (fijo arriba) */}
              {(isMagdalenaActive || isCamilaActive) && (
                <div className="sticky top-0 z-20 p-4 bg-slate-900 border-b border-slate-700"> {/* CAMBIADO: bg-gray-50 border-gray-200 a bg-slate-900 border-slate-700 */}
                  {isMagdalenaActive && (
                    <div className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 border-2 border-green-700 rounded-xl px-6 py-4 shadow-lg"> {/* CAMBIADO: purple a cyan */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <div>
                            <span className="text-lg font-bold text-green-400"> {/* CAMBIADO: text-green-800 a text-green-400 */}
                              🔮 Modelo Magdalena Activo
                            </span>
                            <div className="text-sm text-green-300 mt-1"> {/* CAMBIADO: text-green-700 a text-green-300 */}
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
                            : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700'
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
                    <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border-2 border-teal-700 rounded-xl px-6 py-4 shadow-lg"> {/* CAMBIADO: purple a teal */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-teal-500 rounded-full mr-4 animate-pulse"></div>
                          <div>
                            <span className="text-lg font-bold text-teal-400"> {/* CAMBIADO: purple a teal */}
                              ⚡ Modelo Camila Activo
                            </span>
                            <div className="text-sm text-teal-300 mt-1"> {/* CAMBIADO: purple a teal */}
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
                            : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700'
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
                    <div className="bg-slate-800 rounded-xl border-2 border-slate-700 shadow-lg h-[calc(100vh-250px)]"> {/* CAMBIADO: bg-white border-gray-200 a bg-slate-800 border-slate-700 */}
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
                      <div className="bg-slate-800 rounded-xl border-2 border-slate-700 shadow-lg"> {/* CAMBIADO: bg-white border-gray-200 a bg-slate-800 border-slate-700 */}
                        <div className="p-4 border-b bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-slate-700"> {/* CAMBIADO: colores oscuros */}
                          <h3 className="font-bold text-blue-200 text-lg flex items-center"> {/* CAMBIADO: text-blue-900 a text-blue-200 */}
                            <BarChart3 size={20} className="mr-3" />
                            KPIs de Congestión del Terminal
                          </h3>
                          <p className="text-blue-300 text-sm"> {/* CAMBIADO: text-blue-700 a text-blue-300 */}
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

                      {/* KPIs DE MODELOS SI ESTÁN ACTIVOS */}
                      {isMagdalenaActive && (
                        <div className="bg-slate-800 rounded-xl border-2 border-cyan-700 shadow-lg"> {/* CAMBIADO: purple a cyan */}
                          <div className="p-4 border-b bg-gradient-to-r from-cyan-900/50 to-cyan-800/50"> {/* CAMBIADO: purple a cyan */}
                            <h3 className="font-bold text-cyan-300 text-lg"> {/* CAMBIADO: purple a cyan */}
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
                    <div className="bg-slate-800 rounded-xl border-2 border-slate-700 shadow-lg"> {/* CAMBIADO: bg-white border-gray-200 a bg-slate-800 border-slate-700 */}
                      <div className="p-6 border-b bg-gradient-to-r from-cyan-900/30 to-blue-900/30"> {/* CAMBIADO: purple a cyan */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-2xl text-slate-100 flex items-center"> {/* CAMBIADO: text-gray-900 a text-slate-100 */}
                              🔍 Análisis Detallado - Magdalena vs Real
                            </h3>
                            <p className="text-slate-300 mt-2 font-medium"> {/* CAMBIADO: text-gray-700 a text-slate-300 */}
                              Comparaciones, segregaciones, workload y métricas avanzadas
                            </p>
                          </div>
                          <button
                            onClick={() => setShowMagdalenaComparison(false)}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <ChevronUp size={24} className="text-slate-400" /> {/* CAMBIADO: text-gray-600 a text-slate-400 */}
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
                    <div className="bg-slate-800 rounded-xl border-2 border-slate-700 shadow-lg"> {/* CAMBIADO: bg-white border-gray-200 a bg-slate-800 border-slate-700 */}
                      <div className="p-6 border-b bg-gradient-to-r from-teal-900/30 to-pink-900/30"> {/* CAMBIADO: purple a teal */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-2xl text-slate-100 flex items-center"> {/* CAMBIADO: text-gray-900 a text-slate-100 */}
                              🔍 Análisis Detallado - Modelo Camila
                            </h3>
                            <p className="text-slate-300 mt-2 font-medium"> {/* CAMBIADO: text-gray-700 a text-slate-300 */}
                              Optimización de carga de trabajo, asignación de grúas y análisis temporal
                            </p>
                          </div>
                          <button
                            onClick={() => setShowCamilaDetail(false)}
                            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <ChevronUp size={24} className="text-slate-400" /> {/* CAMBIADO: text-gray-600 a text-slate-400 */}
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

          {/* VISTA BLOQUE: Layout simplificado para evitar cortes */}
          {viewState.level === 'bloque' && (
            <div className="h-full flex flex-col overflow-hidden bg-slate-900"> {/* AÑADIDO: bg-slate-900 */}
              {/* Indicadores de modelos si están activos - FIJO ARRIBA */}
              {(isMagdalenaActive || isCamilaActive) && (
                <div className="flex-shrink-0 p-4 bg-slate-900 border-b border-slate-700"> {/* CAMBIADO: bg-gray-50 border-gray-200 a bg-slate-900 border-slate-700 */}
                  {isMagdalenaActive && (
                    <div className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 border-2 border-green-700 rounded-xl px-6 py-4 shadow-lg"> {/* CAMBIADO: purple a cyan */}
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                        <div>
                          <span className="text-lg font-bold text-green-400"> {/* CAMBIADO: text-green-800 a text-green-400 */}
                            🔮 Modelo Magdalena Activo
                          </span>
                          <div className="text-sm text-green-300 mt-1"> {/* CAMBIADO: text-green-700 a text-green-300 */}
                            {viewState.selectedPatio} • Bloque {viewState.selectedBloque} • Semana {timeState.magdalenaConfig?.semana}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isCamilaActive && (
                    <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border-2 border-teal-700 rounded-xl px-6 py-4 shadow-lg"> {/* CAMBIADO: purple a teal */}
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-teal-500 rounded-full mr-4 animate-pulse"></div>
                        <div>
                          <span className="text-lg font-bold text-teal-400"> {/* CAMBIADO: purple a teal */}
                            ⚡ Modelo Camila Activo
                          </span>
                          <div className="text-sm text-teal-300 mt-1"> {/* CAMBIADO: purple a teal */}
                            {viewState.selectedPatio} • Bloque {viewState.selectedBloque}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CONTENEDOR PRINCIPAL - Usar toda la altura restante */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full p-4">
                  <div className="h-full bg-slate-800 rounded-xl border-2 border-slate-700 shadow-lg overflow-hidden"> {/* CAMBIADO: bg-white border-gray-200 a bg-slate-800 border-slate-700 */}
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
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};