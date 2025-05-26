import { useState, useCallback } from 'react';

// Tipos para la navegación temporal
export type TimeUnit = 'hour' | 'shift' | 'week';
export type DataSource = 'historical' | 'modelMagdalena' | 'modelCamila';

export interface TimeState {
  unit: TimeUnit;
  currentDate: Date;
  dataSource: DataSource;
}

/**
 * Hook para gestionar la navegación temporal entre diferentes unidades de tiempo
 * y fuentes de datos (históricos vs modelos)
 */
export const useTimeNavigation = () => {
  // Estado para la navegación temporal
  const [timeState, setTimeState] = useState<TimeState>({
    unit: 'shift', // Unidad por defecto: turno
    currentDate: new Date(), // Fecha actual por defecto
    dataSource: 'historical' // Fuente de datos por defecto: históricos
  });

  // Función para cambiar la unidad de tiempo
  const setTimeUnit = useCallback((unit: TimeUnit) => {
    setTimeState(prev => ({
      ...prev,
      unit
    }));
  }, []);

  // Función para cambiar la fuente de datos
  const setDataSource = useCallback((dataSource: DataSource) => {
    setTimeState(prev => ({
      ...prev,
      dataSource
    }));
  }, []);

  // Avanzar en el tiempo según la unidad seleccionada
  const moveForward = useCallback(() => {
    setTimeState(prev => {
      const newDate = new Date(prev.currentDate);
      
      switch (prev.unit) {
        case 'hour': {
          newDate.setHours(newDate.getHours() + 1);
          break;
        }
        case 'shift': {
          // Asumiendo turnos de 8 horas
          newDate.setHours(newDate.getHours() + 8);
          break;
        }
        case 'week': {
          newDate.setDate(newDate.getDate() + 7);
          break;
        }
      }
      
      return {
        ...prev,
        currentDate: newDate
      };
    });
  }, []);

  // Retroceder en el tiempo según la unidad seleccionada
  const moveBackward = useCallback(() => {
    setTimeState(prev => {
      const newDate = new Date(prev.currentDate);
      
      switch (prev.unit) {
        case 'hour': {
          newDate.setHours(newDate.getHours() - 1);
          break;
        }
        case 'shift': {
          // Asumiendo turnos de 8 horas
          newDate.setHours(newDate.getHours() - 8);
          break;
        }
        case 'week': {
          newDate.setDate(newDate.getDate() - 7);
          break;
        }
      }
      
      return {
        ...prev,
        currentDate: newDate
      };
    });
  }, []);

  // Ir directamente a una fecha específica
  const goToDate = useCallback((date: Date) => {
    setTimeState(prev => ({
      ...prev,
      currentDate: date
    }));
  }, []);

  // Obtener formato de visualización según la unidad de tiempo
  const getDisplayFormat = useCallback(() => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    switch (timeState.unit) {
      case 'hour': {
        options.hour = '2-digit';
        options.minute = '2-digit';
        return timeState.currentDate.toLocaleString(undefined, options);
      }
      case 'shift': {
        // Determinar si es turno mañana, tarde o noche
        const hour = timeState.currentDate.getHours();
        let shift = '';
        if (hour >= 6 && hour < 14) {
          shift = 'Mañana (06:00-14:00)';
        } else if (hour >= 14 && hour < 22) {
          shift = 'Tarde (14:00-22:00)';
        } else {
          shift = 'Noche (22:00-06:00)';
        }
        return `${timeState.currentDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - ${shift}`;
      }
      case 'week': {
        // Calcular inicio y fin de semana
        const startOfWeek = new Date(timeState.currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Inicio en domingo
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6); // Fin en sábado
        
        return `${startOfWeek.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
      }
      default: {
        return timeState.currentDate.toLocaleDateString();
      }
    }
  }, [timeState]);

  // Retornar las funciones y estados
  return {
    timeState,
    setTimeUnit,
    setDataSource,
    moveForward,
    moveBackward,
    goToDate,
    getDisplayFormat
  };
};