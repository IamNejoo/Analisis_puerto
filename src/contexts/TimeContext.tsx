// src/contexts/TimeContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  TimeUnit,
  DataSource,
  MagdalenaConfig,
  CamilaConfig,
  ExtendedTimeState,
  HourRange
} from '../types';

interface ExtendedTimeContextType {
  timeState: ExtendedTimeState;
  isLoadingData: boolean;
  setTimeUnit: (unit: TimeUnit) => void;
  setUnit: (unit: TimeUnit) => void;
  setDataSource: (source: DataSource) => void;
  setMagdalenaConfig: (config: MagdalenaConfig) => void;
  setCamilaConfig: (config: CamilaConfig) => void;
  setHourRange: (range: HourRange) => void;
  setCurrentDate: (date: string) => void;
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
  // Mapeo de semanas a fechas específicas del 2022
  const weekToDateMap: { [key: number]: string } = {
    1: '2022-01-03', 2: '2022-01-10', 3: '2022-01-17', 4: '2022-01-24', 5: '2022-01-31',
    6: '2022-02-07', 7: '2022-02-14', 8: '2022-02-21', 9: '2022-02-28', 10: '2022-03-07',
    11: '2022-03-14', 12: '2022-03-21', 13: '2022-03-28', 14: '2022-04-04', 15: '2022-04-11',
    16: '2022-04-18', 17: '2022-04-25', 18: '2022-05-02', 19: '2022-05-09', 20: '2022-05-16',
    21: '2022-05-23', 22: '2022-05-30', 23: '2022-06-06', 24: '2022-06-13', 25: '2022-06-20',
    26: '2022-06-27', 27: '2022-07-04', 28: '2022-07-11', 29: '2022-07-18', 30: '2022-07-25',
    31: '2022-08-01', 32: '2022-08-08', 33: '2022-08-15', 34: '2022-08-22', 35: '2022-08-29',
    36: '2022-09-05', 37: '2022-09-12', 38: '2022-09-19', 39: '2022-09-26', 40: '2022-10-03',
    41: '2022-10-10', 42: '2022-10-17', 43: '2022-10-24', 44: '2022-10-31', 45: '2022-11-07',
    46: '2022-11-14', 47: '2022-11-21', 48: '2022-11-28', 49: '2022-12-05', 50: '2022-12-12',
    51: '2022-12-19', 52: '2022-12-26'
  };

  // Función helper para obtener el rango de fechas de una semana
  const getWeekDateRange = (weekNumber: number) => {
    const startDateStr = weekToDateMap[weekNumber];
    if (!startDateStr) {
      console.log('🎯 DEBUG getWeekDateRange - No se encontró mapeo para semana:', weekNumber);
      return null;
    }

    // CAMBIO IMPORTANTE: Crear fechas en hora local
    const [year, month, day] = startDateStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, day, 0, 0, 0);
    const endDate = new Date(year, month - 1, day + 6, 23, 59, 59);

    console.log('🎯 DEBUG getWeekDateRange:', {
      weekNumber,
      startDateStr,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startDateLocal: startDate.toString(),
      endDateLocal: endDate.toString()
    });

    return { startDate, endDate, startDateStr };
  };

  const [timeState, setTimeState] = useState<ExtendedTimeState>({
    unit: 'week',
    currentDate: new Date('2022-01-03T08:00:00'),
    dataSource: 'historical',
    magdalenaConfig: {
      participacion: 68,
      conDispersion: true,
      semana: 1
    },
    camilaConfig: {
      modelType: 'minmax',
      withSegregations: true,
      week: 3,
      day: 'Friday',
      shift: 1
    },
    hourRange: { start: 8, end: 16 }
  });

  const [isLoadingData, setIsLoadingData] = useState(false);

  const getWeekNumberFromDate = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];
    console.log('🔍 DEBUG getWeekNumberFromDate - dateStr:', dateStr);

    for (const [week, weekDate] of Object.entries(weekToDateMap)) {
      if (weekDate === dateStr) {
        console.log('🔍 DEBUG getWeekNumberFromDate - Coincidencia exacta:', week);
        return parseInt(week);
      }
    }

    // Si no es exactamente la fecha del mapeo, buscar en qué rango cae
    for (const [week, weekDate] of Object.entries(weekToDateMap)) {
      const weekStart = new Date(weekDate + 'T00:00:00');
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      if (date >= weekStart && date <= weekEnd) {
        console.log('🔍 DEBUG getWeekNumberFromDate - Encontrado en rango:', week);
        return parseInt(week);
      }
    }

    console.log('🔍 DEBUG getWeekNumberFromDate - No encontrado, devolviendo 1');
    return 1;
  };

  const setTimeUnit = useCallback((unit: TimeUnit) => {
    setTimeState(prev => ({ ...prev, unit }));
    console.log('⏰ Unidad de tiempo cambiada a:', unit);
  }, []);

  const setUnit = setTimeUnit;

  const setCurrentDate = useCallback((date: string) => {
    const newDate = new Date(date);
    if (!isNaN(newDate.getTime())) {
      const weekNumber = getWeekNumberFromDate(newDate);
      setTimeState(prev => ({
        ...prev,
        currentDate: newDate,
        magdalenaConfig: prev.magdalenaConfig ?
          { ...prev.magdalenaConfig, semana: weekNumber } :
          { participacion: 68, conDispersion: true, semana: weekNumber }
      }));
      console.log('📅 Fecha actualizada a:', newDate.toLocaleString('es-CL'), 'Semana:', weekNumber);
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
          participacion: 68,
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
        case 'week':
          const currentWeek = prev.magdalenaConfig?.semana || 1;
          const previousWeek = Math.max(1, currentWeek - 1);
          const dateStr = weekToDateMap[previousWeek];
          if (dateStr) {
            const targetDate = new Date(`${dateStr}T08:00:00`);
            console.log('⏪ Navegando a semana anterior:', previousWeek, dateStr);
            return {
              ...prev,
              currentDate: targetDate,
              magdalenaConfig: prev.magdalenaConfig ?
                { ...prev.magdalenaConfig, semana: previousWeek } :
                { participacion: 68, conDispersion: true, semana: previousWeek }
            };
          }
          break;
        case 'day':
          newDate.setDate(newDate.getDate() - 1);
          break;
        case 'shift':
          newDate.setHours(newDate.getHours() - 8);
          break;
        case 'hour':
          newDate.setHours(newDate.getHours() - 1);
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
        case 'week':
          const currentWeek = prev.magdalenaConfig?.semana || 1;
          const nextWeek = Math.min(52, currentWeek + 1);
          const dateStr = weekToDateMap[nextWeek];
          if (dateStr) {
            const targetDate = new Date(`${dateStr}T08:00:00`);
            console.log('⏩ Navegando a semana siguiente:', nextWeek, dateStr);
            return {
              ...prev,
              currentDate: targetDate,
              magdalenaConfig: prev.magdalenaConfig ?
                { ...prev.magdalenaConfig, semana: nextWeek } :
                { participacion: 68, conDispersion: true, semana: nextWeek }
            };
          }
          break;
        case 'day':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'shift':
          newDate.setHours(newDate.getHours() + 8);
          break;
        case 'hour':
          newDate.setHours(newDate.getHours() + 1);
          break;
      }

      console.log(`⏩ Navegando al ${prev.unit} siguiente:`, newDate.toLocaleString('es-CL'));
      return { ...prev, currentDate: newDate };
    });
  }, []);

  const goToWeek = useCallback((week: number) => {
    if (week < 1 || week > 52) return;

    const dateStr = weekToDateMap[week];
    if (!dateStr) return;

    const newDate = new Date(`${dateStr}T08:00:00`);

    setTimeState(prev => ({
      ...prev,
      currentDate: newDate,
      magdalenaConfig: prev.magdalenaConfig ?
        { ...prev.magdalenaConfig, semana: week } :
        { participacion: 68, conDispersion: true, semana: week }
    }));

    console.log(`📅 Navegando a semana ${week}: ${dateStr}`);
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

    console.log('🔍 DEBUG getDisplayFormat:', {
      unit,
      currentDate: currentDate.toISOString(),
      semana: magdalenaConfig?.semana,
      dataSource
    });

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
      case 'week':
        console.log('🔍 DEBUG case week - antes de calcular');
        const weekNumber = magdalenaConfig?.semana || getWeekNumberFromDate(currentDate);
        console.log('🔍 DEBUG weekNumber:', weekNumber);

        const weekRange = getWeekDateRange(weekNumber);
        console.log('🔍 DEBUG weekRange:', weekRange);

        if (weekRange) {
          const result = `Histórico Semanal - ${weekRange.startDate.toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'short'
          })} al ${weekRange.endDate.toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}`;
          console.log('🔍 DEBUG result con mapeo:', result);
          return result;
        }

        // Fallback
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = startOfWeek.getDay();
        console.log('🔍 DEBUG dayOfWeek:', dayOfWeek);
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        const result = `Histórico Semanal - ${startOfWeek.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} al ${endOfWeek.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        console.log('🔍 DEBUG result fallback:', result);
        return result;

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
      setUnit,
      setCurrentDate,
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

export const TimeProvider = ExtendedTimeProvider;