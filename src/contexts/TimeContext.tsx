import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { TimeState, DataSource, TimeUnit } from '../types';
import { useTimeNavigation } from '../hooks/useTimeNavigation';

// Interfaz para el contexto de tiempo
interface TimeContextType {
  timeState: TimeState;
  setTimeUnit: (unit: TimeUnit) => void;
  setDataSource: (source: DataSource) => void;
  moveForward: () => void;
  moveBackward: () => void;
  goToDate: (date: Date) => void;
  getDisplayFormat: () => string;
  isLoadingData: boolean;
}

// Crear el contexto
const TimeContext = createContext<TimeContextType | undefined>(undefined);

// Props para el proveedor
interface TimeProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de contexto para la navegación temporal
 * Encapsula la lógica de navegación temporal y proporciona acceso a los componentes hijos
 */
export const TimeProvider: React.FC<TimeProviderProps> = ({ children }) => {
  // Usar el hook de navegación temporal
  const {
    timeState,
    setTimeUnit,
    setDataSource,
    moveForward,
    moveBackward,
    goToDate,
    getDisplayFormat
  } = useTimeNavigation();

  // Estado de carga simulado (en un caso real, este estado vendría de la carga de datos)
  const [isLoadingData, setIsLoadingData] = React.useState(false);

  // Sobrescribir los métodos de navegación para incluir la lógica de carga
  const handleMoveForward = () => {
    setIsLoadingData(true);
    moveForward();
    // Simular carga de datos
    setTimeout(() => {
      setIsLoadingData(false);
    }, 500);
  };

  const handleMoveBackward = () => {
    setIsLoadingData(true);
    moveBackward();
    // Simular carga de datos
    setTimeout(() => {
      setIsLoadingData(false);
    }, 500);
  };

  const handleSetTimeUnit = (unit: TimeUnit) => {
    setIsLoadingData(true);
    setTimeUnit(unit);
    // Simular carga de datos
    setTimeout(() => {
      setIsLoadingData(false);
    }, 500);
  };

  const handleSetDataSource = (source: DataSource) => {
    setIsLoadingData(true);
    setDataSource(source);
    // Simular carga de datos
    setTimeout(() => {
      setIsLoadingData(false);
    }, 500);
  };

  const handleGoToDate = (date: Date) => {
    setIsLoadingData(true);
    goToDate(date);
    // Simular carga de datos
    setTimeout(() => {
      setIsLoadingData(false);
    }, 500);
  };

  // Valor del contexto
  const value = {
    timeState,
    setTimeUnit: handleSetTimeUnit,
    setDataSource: handleSetDataSource,
    moveForward: handleMoveForward,
    moveBackward: handleMoveBackward,
    goToDate: handleGoToDate,
    getDisplayFormat,
    isLoadingData
  };

  return (
    <TimeContext.Provider value={value}>
      {children}
    </TimeContext.Provider>
  );
};

/**
 * Hook para usar el contexto de tiempo
 */
export const useTimeContext = (): TimeContextType => {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useTimeContext must be used within a TimeProvider');
  }
  return context;
};