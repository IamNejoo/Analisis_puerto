// src/components/map/views/PatioView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useTimeContext } from '../../../contexts/TimeContext';
import { useMagdalenaContext } from '../../../contexts/MagdalenaContext';
import { useOptimizationData } from '../../../hooks/useOptimizationData';
import { useRealPatioData } from '../../../hooks/useRealPatioData';
import { useCamilaDashboard } from '../../../hooks/useCamilaData';
import { PatioHeader } from './patio/PatioHeader';
import { PatioKPIs } from './patio/PatioKPIs';
import { PatioGrid } from './patio/PatioGrid';
import { PatioDetails } from './patio/PatioDetails';
import { CamilaTimelineControls } from './patio/CamilaTimelineControls';
import { MagdalenaTemporalSelector } from './patio/MagdalenaTemporalSelector';

import { PatioErrorStates } from './patio/PatioErrorStates';
import { processPatioData } from './patio/patioDataProcessor';
import type { CamilaConfig } from '../../../types/camila';

interface PatioViewProps {
  patioId: string;
  onBloqueClick: (patioId: string, bloqueId: string) => void;
  getColorForOcupacion: (value: number) => string;
}

export const PatioView: React.FC<PatioViewProps> = ({
  patioId,
  onBloqueClick,
  getColorForOcupacion
}) => {
  const [selectedBloque, setSelectedBloque] = useState<string | null>(null);
  const [currentTurno, setCurrentTurno] = useState(1);
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);



  const { timeState } = useTimeContext();
  const { config: magdalenaConfig } = useMagdalenaContext();

  // Hook para datos reales
  const {
    patioData: realPatioDataArray,
    isLoading: isLoadingReal,
    error: realDataError,
    refreshData
  } = useRealPatioData();

  // MODIFICADO: Pasar filtros temporales al hook
  const {
    metrics: magdalenaMetrics,
    isLoading: magdalenaLoading,
    error: magdalenaError
  } = useOptimizationData(
    magdalenaConfig,
    undefined, // bloqueId se maneja por separado
    undefined, // periodo se maneja por separado
  );

  const camilaConfig = useMemo<CamilaConfig | null>(() => {
    if (!timeState?.camilaConfig) return null;
    return {
      anio: 2022,
      semana: timeState.camilaConfig.week,
      turno: timeState.camilaConfig.shift,
      participacion: 68,
      dispersion: timeState.camilaConfig.withSegregations ? 'K' : 'N'
    };
  }, [timeState?.camilaConfig]);

  const { data: camilaData, loading: camilaLoading, error: camilaError } = useCamilaDashboard(camilaConfig);

  const isMagdalenaActive = timeState?.dataSource === 'modelMagdalena' && patioId === 'costanera';
  const isCamilaActive = timeState?.dataSource === 'modelCamila' && patioId === 'costanera';



  // Effect para animación
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (isMagdalenaActive && magdalenaMetrics) {
        setCurrentTurno(prev => {
          const totalTurnos = magdalenaMetrics.evolucionTemporal?.length || 21;
          if (prev >= totalTurnos) {
            setIsPlaying(false);
            return 1;
          }
          return prev + 1;
        });
      } else if (isCamilaActive && camilaData) {
        setCurrentPeriod(prev => {
          if (prev >= 8) {
            setIsPlaying(false);
            return 1;
          }
          return prev + 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isMagdalenaActive, isCamilaActive, magdalenaMetrics, camilaData]);

  // Procesar datos del patio
  const patio = useMemo(() => {
    const realPatioData = realPatioDataArray ? { patios: realPatioDataArray } : null;

    return processPatioData({
      isCamilaActive,
      isMagdalenaActive,
      camilaData,
      magdalenaMetrics,
      realPatioData,
      timeState,
      patioId,
      currentTurno,
      currentPeriod
    });
  }, [isCamilaActive, isMagdalenaActive, camilaData, magdalenaMetrics, realPatioDataArray, timeState, patioId, currentTurno, currentPeriod]);

  // Estados de error y carga
  if (isCamilaActive && !camilaData && !camilaLoading) {
    return <PatioErrorStates type="camila-no-data" config={camilaConfig} />;
  }
  const [vistaActual, setVistaActual] = useState<'semana' | 'turno'>('semana');

  if (isMagdalenaActive && (magdalenaError || (!magdalenaMetrics && !magdalenaLoading))) {
    return <PatioErrorStates type="magdalena-no-data" config={magdalenaConfig} error={magdalenaError} />;
  }

  const isLoading = (timeState?.dataSource === 'historical' && isLoadingReal) ||
    (isMagdalenaActive && magdalenaLoading) ||
    (isCamilaActive && camilaLoading);

  if (isLoading) {
    return <PatioErrorStates type="loading" dataSource={timeState?.dataSource} />;
  }

  const error =
    (timeState?.dataSource === 'historical' ? realDataError : null) ||
    (isCamilaActive ? camilaError : null);

  if (error) {
    return <PatioErrorStates type="error" error={error} onRetry={refreshData} />;
  }

  if (!patio) {
    return <PatioErrorStates type="no-patio" />;
  }

  // Renderizado principal
  return (
    <div className="w-full h-full bg-slate-900 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto">
          {/* Timeline Controls - CON VALIDACIÓN */}
          {isCamilaActive && camilaData && camilaData.resultado && (
            <CamilaTimelineControls
              currentPeriod={currentPeriod}
              totalPeriods={8}
              onPeriodChange={setCurrentPeriod}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              turno={camilaData.resultado.turno || 1}
              turnoDelDia={camilaData.resultado.turno_del_dia || 1}
            />
          )}
          {isMagdalenaActive && magdalenaMetrics && (
            <MagdalenaTemporalSelector
              currentTurno={currentTurno}
              totalTurnos={magdalenaMetrics.evolucionTemporal?.length || 21}
              onTurnoChange={(turno) => {
                if (turno === 'semana') {
                  setCurrentTurno(0); // 0 indica vista agregada
                } else {
                  setCurrentTurno(turno);
                }
              }}
              vistaActual={vistaActual}
              onVistaChange={setVistaActual}
            />
          )}

          {/* Header */}
          <PatioHeader
            patio={patio}
            isCamilaActive={isCamilaActive}
            isMagdalenaActive={isMagdalenaActive}
            timeState={timeState}
            currentPeriod={currentPeriod}
            currentTurno={currentTurno}
            camilaData={camilaData}
            onRefresh={refreshData}
          />

          {/* KPIs */}
          <PatioKPIs
            isCamilaActive={isCamilaActive}
            isMagdalenaActive={isMagdalenaActive}
            camilaData={camilaData}
            magdalenaMetrics={magdalenaMetrics}
          />

          {/* Grid de bloques */}
          <PatioGrid
            patio={patio}
            selectedBloque={selectedBloque}
            isCamilaActive={isCamilaActive}
            isMagdalenaActive={isMagdalenaActive}
            currentPeriod={currentPeriod}
            currentTurno={currentTurno}
            camilaData={camilaData}
            magdalenaMetrics={magdalenaMetrics}
            timeState={timeState}
            getColorForOcupacion={getColorForOcupacion}
            onBloqueSelect={(bloqueId) => {
              setSelectedBloque(bloqueId);
              setTimeout(() => onBloqueClick(patioId, bloqueId), 200);
            }}
          />

          {/* Detalles del bloque seleccionado */}
          {selectedBloque && (
            <PatioDetails
              selectedBloque={selectedBloque}
              isCamilaActive={isCamilaActive}
              isMagdalenaActive={isMagdalenaActive}
              currentPeriod={currentPeriod}
              camilaData={camilaData}
              magdalenaMetrics={magdalenaMetrics}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatioView;