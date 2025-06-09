// src/contexts/TimeContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { TimeUnit, DataSource, MagdalenaConfig, CamilaConfig } from '../types';

interface HourRange {
  start: number;
  end: number;
}

interface ExtendedTimeState {
  unit: TimeUnit;
  currentDate: Date;
  dataSource: DataSource;
  magdalenaConfig?: MagdalenaConfig;
  camilaConfig?: CamilaConfig;
  hourRange: HourRange;
}

interface ExtendedTimeContextType {
  timeState: ExtendedTimeState;
  isLoadingData: boolean;
  setTimeUnit: (unit: TimeUnit) => void;
  setUnit: (unit: TimeUnit) => void; // Alias para compatibilidad
  setDataSource: (source: DataSource) => void;
  setMagdalenaConfig: (config: MagdalenaConfig) => void;
  setCamilaConfig: (config: CamilaConfig) => void;
  setHourRange: (range: HourRange) => void;
  setCurrentDate: (date: string) => void; // NUEVA FUNCIÓN
  goToPreviousPeriod: () => void;
  goToNextPeriod: () => void;
  goToWeek: (week: number) => void;
  playPause: () => void;
  resetToNow: () => void;
  getDisplayFormat: () => string;
  loadHistoricalDataForPeriod: (startDate: Date, endDate: Date, patio?: string) => Promise<void>;
}

const ExtendedTimeContext = createContext<ExtendedTimeContextType | null>(null);

interface ExtendedTimeProviderProps {
  children: React.ReactNode;
}

export const ExtendedTimeProvider: React.FC<ExtendedTimeProviderProps> = ({ children }) => {
  const [timeState, setTimeState] = useState<ExtendedTimeState>({
    unit: 'week',
    currentDate: new Date(),
    dataSource: 'historical',
    magdalenaConfig: {
      participacion: 69,
      conDispersion: true,
      semana: 3
    },
    camilaConfig: {
      modelType: 'minmax',
      withSegregations: true,
      week: 3,
      day: 'Friday',
      shift: 1
    },
    hourRange: { start: 8, end: 16 } // Por defecto turno 1
  });

  const [isLoadingData, setIsLoadingData] = useState(false);

  const setTimeUnit = useCallback((unit: TimeUnit) => {
    setTimeState(prev => ({ ...prev, unit }));
    console.log('⏰ Unidad de tiempo cambiada a:', unit);
  }, []);

  // Alias para compatibilidad con TimeControl
  const setUnit = setTimeUnit;

  const setCurrentDate = useCallback((date: string) => {
    const newDate = new Date(date);
    if (!isNaN(newDate.getTime())) {
      setTimeState(prev => ({ ...prev, currentDate: newDate }));
      console.log('📅 Fecha actualizada a:', newDate.toLocaleString('es-CL'));
    }
  }, []);

  const setDataSource = useCallback((dataSource: DataSource) => {
    setIsLoadingData(true);
    setTimeState(prev => ({ ...prev, dataSource }));

    if (dataSource === 'modelMagdalena') {
      setTimeState(prev => ({
        ...prev,
        dataSource,
        magdalenaConfig: prev.magdalenaConfig || {
          participacion: 69,
          conDispersion: true,
          semana: 3
        }
      }));
    } else if (dataSource === 'modelCamila') {
      setTimeState(prev => ({
        ...prev,
        dataSource,
        camilaConfig: prev.camilaConfig || {
          modelType: 'minmax',
          withSegregations: true,
          week: 3,
          day: 'Friday',
          shift: 1
        }
      }));
    }

    setTimeout(() => setIsLoadingData(false), 500);
  }, []);

  const setMagdalenaConfig = useCallback((config: MagdalenaConfig) => {
    setTimeState(prev => ({
      ...prev,
      magdalenaConfig: config
    }));
  }, []);

  const setCamilaConfig = useCallback((config: CamilaConfig) => {
    setTimeState(prev => ({
      ...prev,
      camilaConfig: config
    }));
  }, []);

  const setHourRange = useCallback((range: HourRange) => {
    setTimeState(prev => ({ ...prev, hourRange: range }));
    console.log('📅 Rango de horas actualizado:', `${range.start}:00 - ${range.end}:00`);
  }, []);

  const goToPreviousPeriod = useCallback(() => {
    setTimeState(prev => {
      const newDate = new Date(prev.currentDate);

      switch (prev.unit) {
        case 'year':
          newDate.setFullYear(newDate.getFullYear() - 1);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'day':
          newDate.setDate(newDate.getDate() - 1);
          break;
        case 'hour':
          newDate.setHours(newDate.getHours() - 1);
          break;
        case 'shift':
          newDate.setHours(newDate.getHours() - 8);
          break;
      }

      console.log(`⏪ Navegando al ${prev.unit} anterior:`, newDate.toLocaleString('es-CL'));
      return { ...prev, currentDate: newDate };
    });
  }, []);

  const goToNextPeriod = useCallback(() => {
    setTimeState(prev => {
      const newDate = new Date(prev.currentDate);

      switch (prev.unit) {
        case 'year':
          newDate.setFullYear(newDate.getFullYear() + 1);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'day':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'hour':
          newDate.setHours(newDate.getHours() + 1);
          break;
        case 'shift':
          newDate.setHours(newDate.getHours() + 8);
          break;
      }

      console.log(`⏩ Navegando al ${prev.unit} siguiente:`, newDate.toLocaleString('es-CL'));
      return { ...prev, currentDate: newDate };
    });
  }, []);

  const goToWeek = useCallback((week: number) => {
    if (week < 1 || week > 52) return;

    const newDate = new Date(2023, 0, 1); // Año 2023 para datos históricos
    newDate.setDate(newDate.getDate() + (week - 1) * 7);

    setTimeState(prev => ({
      ...prev,
      currentDate: newDate,
      magdalenaConfig: prev.magdalenaConfig ?
        { ...prev.magdalenaConfig, semana: week } :
        { participacion: 69, conDispersion: true, semana: week }
    }));
  }, []);

  const playPause = useCallback(() => {
    console.log('Play/Pause functionality - TODO: Implementar animación temporal');
  }, []);

  const resetToNow = useCallback(() => {
    const now = new Date();
    setTimeState(prev => ({
      ...prev,
      currentDate: now
    }));
    console.log('🔄 Reseteando al momento actual:', now.toLocaleString('es-CL'));
  }, []);

  const getDisplayFormat = useCallback(() => {
    const { unit, currentDate, dataSource, magdalenaConfig, camilaConfig, hourRange } = timeState;

    if (dataSource === 'modelMagdalena') {
      const semana = magdalenaConfig?.semana || 3;
      const participacion = magdalenaConfig?.participacion || 69;
      const dispersion = magdalenaConfig?.conDispersion ? 'Con Dispersión' : 'Centralizada';
      return `Modelo Magdalena - Semana ${semana}/52 - ${participacion}% - ${dispersion}`;
    }

    if (dataSource === 'modelCamila') {
      const semana = camilaConfig?.week || 3;
      const dia = camilaConfig?.day || 'Friday';
      const turno = camilaConfig?.shift || 1;
      const modelo = camilaConfig?.modelType === 'minmax' ? 'MinMax' : 'MaxMin';
      const horasStr = `${hourRange.start}:00-${hourRange.end}:00`;
      return `Modelo Camila - Semana ${semana} - ${dia} - Turno ${turno} - ${modelo} - ${horasStr}`;
    }

    // Para datos históricos
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    switch (unit) {
      case 'year':
        return `Histórico Anual - ${currentDate.getFullYear()}`;

      case 'month':
        return `Histórico Mensual - ${currentDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`;

      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `Histórico Semanal - ${startOfWeek.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} al ${endOfWeek.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}`;

      case 'day':
        return `Histórico Diario - ${currentDate.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;

      case 'hour':
        options.hour = '2-digit';
        options.minute = '2-digit';
        return `Histórico por Hora - ${currentDate.toLocaleString('es-CL', options)} - ${hourRange.start}:00-${hourRange.end}:00`;

      case 'shift':
        const hour = currentDate.getHours();
        let shift = '';
        if (hour >= 6 && hour < 14) {
          shift = 'Turno Mañana (06:00-14:00)';
        } else if (hour >= 14 && hour < 22) {
          shift = 'Turno Tarde (14:00-22:00)';
        } else {
          shift = 'Turno Noche (22:00-06:00)';
        }
        return `Histórico por Turno - ${currentDate.toLocaleDateString('es-CL', options)} - ${shift}`;

      default:
        return `Datos Históricos - ${currentDate.toLocaleDateString('es-CL')}`;
    }
  }, [timeState]);

  const loadHistoricalDataForPeriod = useCallback(async (
    startDate: Date,
    endDate: Date,
    patio?: string
  ) => {
    setIsLoadingData(true);
    try {
      console.log(`📊 Cargando datos históricos:`);
      console.log(`   Desde: ${startDate.toLocaleString()}`);
      console.log(`   Hasta: ${endDate.toLocaleString()}`);
      if (patio) {
        console.log(`   Patio: ${patio}`);
      }
      console.log(`   Rango de horas: ${timeState.hourRange.start}:00 - ${timeState.hourRange.end}:00`);

      // Aquí se conectaría con el servicio de datos históricos
      // Por ahora simulamos la carga
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('✅ Datos históricos cargados exitosamente');

    } catch (error) {
      console.error('❌ Error cargando datos históricos:', error);
      throw error;
    } finally {
      setIsLoadingData(false);
    }
  }, [timeState.hourRange]);

  return (
    <ExtendedTimeContext.Provider value={{
      timeState,
      isLoadingData,
      setTimeUnit,
      setUnit, // Alias para compatibilidad
      setCurrentDate, // NUEVA FUNCIÓN
      setDataSource,
      setMagdalenaConfig,
      setCamilaConfig,
      setHourRange,
      goToPreviousPeriod,
      goToNextPeriod,
      goToWeek,
      playPause,
      resetToNow,
      getDisplayFormat,
      loadHistoricalDataForPeriod
    }}>
      {children}
    </ExtendedTimeContext.Provider>
  );
};

export const useTimeContext = () => {
  const context = useContext(ExtendedTimeContext);
  if (!context) {
    throw new Error('useTimeContext must be used within ExtendedTimeProvider');
  }
  return context;
};

// Exportar el provider como TimeProvider para compatibilidad
export const TimeProvider = ExtendedTimeProvider;