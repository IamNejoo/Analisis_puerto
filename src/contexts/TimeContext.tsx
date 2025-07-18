// src/contexts/TimeContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getISOWeekNumber,
  getISOYear,
  getISOWeekDateRange,
  getCurrentISOWeek,
  formatISOWeek
} from '../utils/isoWeekUtils';
import type {
  TimeUnit,
  DataSource,
  CamilaConfig,
  ExtendedTimeState,
  HourRange
} from '../types';

// Actualizar el tipo ExtendedTimeState removiendo MagdalenaConfig
interface UpdatedTimeState extends Omit<ExtendedTimeState, 'magdalenaConfig'> {
  // No incluye magdalenaConfig
}

interface ExtendedTimeContextType {
  timeState: UpdatedTimeState;
  isLoadingData: boolean;
  setTimeUnit: (unit: TimeUnit) => void;
  setUnit: (unit: TimeUnit) => void;
  setDataSource: (source: DataSource) => void;
  setCamilaConfig: (config: CamilaConfig) => void;
  setHourRange: (range: HourRange) => void;
  setCurrentDate: (date: string) => void;
  goToPreviousPeriod: () => void;
  goToNextPeriod: () => void;
  goToWeek: (week: number, year?: number) => void;
  playPause: () => void;
  resetToNow: () => void;
  getDisplayFormat: () => string;
  loadHistoricalDataForPeriod: (startDate: Date, endDate: Date, patio?: string) => Promise<void>;
}

const ExtendedTimeContext = createContext<ExtendedTimeContextType | null>(null);

interface ExtendedTimeProviderProps {
  children: React.ReactNode;
  initialYear?: number;
  initialWeek?: number;
}

export const ExtendedTimeProvider: React.FC<ExtendedTimeProviderProps> = ({
  children,
  initialYear = 2022,
  initialWeek = 1
}) => {
  // Estado inicial sin magdalenaConfig
  const initialDateRange = getISOWeekDateRange(initialWeek, initialYear);

  const [timeState, setTimeState] = useState<UpdatedTimeState>({
    unit: 'week',
    currentDate: initialDateRange.startDate,
    dataSource: 'historical',
    camilaConfig: {
      modelType: 'maxmin',
      withSegregations: true,
      week: 2,
      day: 'Lunes',
      shift: 1
    },
    hourRange: { start: 8, end: 16 }
  });

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentISOYear, setCurrentISOYear] = useState(initialYear);

  const setTimeUnit = useCallback((unit: TimeUnit) => {
    setTimeState(prev => ({ ...prev, unit }));
    console.log('⏰ Unidad de tiempo cambiada a:', unit);
  }, []);

  const setUnit = setTimeUnit;

  const setCurrentDate = useCallback((date: string) => {
    const newDate = new Date(date);
    if (!isNaN(newDate.getTime())) {
      const weekNumber = getISOWeekNumber(newDate);
      const isoYear = getISOYear(newDate);

      setCurrentISOYear(isoYear);
      setTimeState(prev => ({
        ...prev,
        currentDate: newDate,
        camilaConfig: prev.camilaConfig ?
          { ...prev.camilaConfig, week: weekNumber } :
          { modelType: 'minmax', withSegregations: true, week: weekNumber, day: 'Monday', shift: 1 }
      }));
      console.log('📅 Fecha actualizada a:', newDate.toLocaleString('es-CL'), 'Semana ISO:', formatISOWeek(newDate));
    }
  }, []);

  const setDataSource = useCallback((dataSource: DataSource) => {
    setIsLoadingData(true);
    setTimeState(prev => ({ ...prev, dataSource }));

    if (dataSource === 'modelCamila') {
      setTimeState(prev => ({
        ...prev,
        dataSource,
        camilaConfig: prev.camilaConfig || {
          modelType: 'minmax',
          withSegregations: true,
          week: getISOWeekNumber(prev.currentDate),
          day: 'Monday',
          shift: 1
        }
      }));
    }

    setTimeout(() => setIsLoadingData(false), 500);
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
          const currentWeek = getISOWeekNumber(prev.currentDate);
          const currentYear = getISOYear(prev.currentDate);
          let previousWeek = currentWeek - 1;
          let previousYear = currentYear;

          if (previousWeek < 1) {
            previousYear = currentYear - 1;
            const weeksInPreviousYear = getISOWeeksInYear(previousYear);
            previousWeek = weeksInPreviousYear;
          }

          const dateRange = getISOWeekDateRange(previousWeek, previousYear);
          setCurrentISOYear(previousYear);

          console.log('⏪ Navegando a semana ISO anterior:', formatISOWeek(dateRange.startDate));
          return {
            ...prev,
            currentDate: dateRange.startDate,
            camilaConfig: prev.camilaConfig ?
              { ...prev.camilaConfig, week: previousWeek } :
              { modelType: 'minmax', withSegregations: true, week: previousWeek, day: 'Monday', shift: 1 }
          };

        case 'day':
          newDate.setDate(newDate.getDate() - 1);
          break;
        case 'shift':
          newDate.setHours(newDate.getHours() - 8);
          break;
        case 'hour':
          newDate.setHours(newDate.getHours() + 1);
          if (newDate.getHours() >= 22) {
            newDate.setDate(newDate.getDate() + 1);
            newDate.setHours(8, 0, 0, 0);
          } else if (newDate.getHours() < 8) {
            newDate.setHours(8, 0, 0, 0);
          }
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
          const currentWeek = getISOWeekNumber(prev.currentDate);
          const currentYear = getISOYear(prev.currentDate);
          let nextWeek = currentWeek + 1;
          let nextYear = currentYear;

          const weeksInCurrentYear = getISOWeeksInYear(currentYear);
          if (nextWeek > weeksInCurrentYear) {
            nextWeek = 1;
            nextYear = currentYear + 1;
          }

          const dateRange = getISOWeekDateRange(nextWeek, nextYear);
          setCurrentISOYear(nextYear);

          console.log('⏩ Navegando a semana ISO siguiente:', formatISOWeek(dateRange.startDate));
          return {
            ...prev,
            currentDate: dateRange.startDate,
            camilaConfig: prev.camilaConfig ?
              { ...prev.camilaConfig, week: nextWeek } :
              { modelType: 'minmax', withSegregations: true, week: nextWeek, day: 'Monday', shift: 1 }
          };

        case 'day':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'shift':
          newDate.setHours(newDate.getHours() + 8);
          break;
        case 'hour':
          newDate.setHours(newDate.getHours() + 1);
          if (newDate.getHours() >= 22) {
            newDate.setDate(newDate.getDate() + 1);
            newDate.setHours(8, 0, 0, 0);
          } else if (newDate.getHours() < 8) {
            newDate.setHours(8, 0, 0, 0);
          }
          break;
      }

      console.log(`⏩ Navegando al ${prev.unit} siguiente:`, newDate.toLocaleString('es-CL'));
      return { ...prev, currentDate: newDate };
    });
  }, []);

  const goToWeek = useCallback((week: number, year?: number) => {
    const targetYear = year || currentISOYear;
    const weeksInYear = getISOWeeksInYear(targetYear);

    if (week < 1 || week > weeksInYear) {
      console.warn(`Semana ${week} fuera de rango para el año ${targetYear} (1-${weeksInYear})`);
      return;
    }

    const dateRange = getISOWeekDateRange(week, targetYear);
    setCurrentISOYear(targetYear);

    setTimeState(prev => ({
      ...prev,
      currentDate: dateRange.startDate,
      camilaConfig: prev.camilaConfig ?
        { ...prev.camilaConfig, week: week } :
        { modelType: 'minmax', withSegregations: true, week: week, day: 'Monday', shift: 1 }
    }));

    console.log(`📅 Navegando a semana ISO ${week} del año ${targetYear}: ${formatISOWeek(dateRange.startDate)}`);
  }, [currentISOYear]);

  const playPause = useCallback(() => {
    console.log('Play/Pause functionality - TODO: Implementar animación temporal');
  }, []);

  const resetToNow = useCallback(() => {
    const resetDateRange = getISOWeekDateRange(initialWeek, initialYear);
    setCurrentISOYear(initialYear);

    setTimeState(prev => ({
      ...prev,
      currentDate: resetDateRange.startDate,
      camilaConfig: prev.camilaConfig ?
        { ...prev.camilaConfig, week: initialWeek } :
        { modelType: 'minmax', withSegregations: true, week: initialWeek, day: 'Monday', shift: 1 }
    }));
    console.log('🔄 Reseteando al inicio:', resetDateRange.startDate.toLocaleString('es-CL'), 'Semana ISO:', formatISOWeek(resetDateRange.startDate));
  }, [initialWeek, initialYear]);

  const getDisplayFormat = useCallback(() => {
    const { unit, currentDate, dataSource, camilaConfig, hourRange } = timeState;

    if (dataSource === 'modelCamila') {
      const semana = camilaConfig?.week || getISOWeekNumber(currentDate);
      const year = getISOYear(currentDate);
      const dia = camilaConfig?.day || 'Monday';
      const turno = camilaConfig?.shift || 1;
      const modelo = camilaConfig?.modelType === 'minmax' ? 'MinMax' : 'MaxMin';
      const horasStr = `${hourRange.start}:00-${hourRange.end}:00`;
      return `Modelo Camila - Semana ISO ${semana}/${year} - ${dia} - Turno ${turno} - ${modelo} - ${horasStr}`;
    }

    // Para datos históricos
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    switch (unit) {
      case 'week':
        const weekNumber = getISOWeekNumber(currentDate);
        const year = getISOYear(currentDate);
        const weekRange = getISOWeekDateRange(weekNumber, year);

        return `Histórico Semanal - Semana ISO ${weekNumber}/${year} - ${weekRange.startDate.toLocaleDateString('es-CL', {
          day: 'numeric',
          month: 'short'
        })} al ${weekRange.endDate.toLocaleDateString('es-CL', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}`;

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

// Función auxiliar para verificar cuántas semanas tiene un año ISO
function getISOWeeksInYear(year: number): number {
  const jan1 = new Date(year, 0, 1);
  const jan1DayOfWeek = jan1.getDay();

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

  if (jan1DayOfWeek === 4 || (jan1DayOfWeek === 3 && isLeapYear)) {
    return 53;
  }

  return 52;
}