import React, { createContext, useContext } from 'react';
import { usePortData } from '../hooks/usePortData';
import { useFilters } from '../hooks/useFilters';
import type { 
  OccupancyData, 
  ProductivityData, 
  TruckTimeData, 
  YardOccupancyData,
  BlockOccupancyData,
  AlertData,
  ShipData,
  Filters
} from '../types';

interface PortContextType {
  // Datos
  ocupacionData: OccupancyData[];
  productividadData: ProductivityData[];
  tiempoCamionData: TruckTimeData[];
  ocupacionPatioData: YardOccupancyData[];
  ocupacionBloqueData: BlockOccupancyData[];
  alertasData: AlertData[];
  navesData: ShipData[];
  
  // Valores actuales
  currentOcupacion: number;
  currentProductividad: { bmph: number; gmph: number };
  currentTiempoCamion: number;
  
  // Utilidades
  getColorForOcupacion: (value: number) => string;
  getBlocksByType: (tipo: string) => BlockOccupancyData[];
  getAverageOccupancyByType: (tipo: string) => number;
  
  // Filtros
  filters: Filters;
  toggleFilter: (filter: string) => void;
}

const PortContext = createContext<PortContextType | undefined>(undefined);

export const PortProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const portData = usePortData();
  const { filters, toggleFilter } = useFilters();

  const value: PortContextType = {
    ...portData,
    filters,
    toggleFilter
  };

  return (
    <PortContext.Provider value={value}>
      {children}
    </PortContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const usePort = (): PortContextType => {
  const context = useContext(PortContext);
  if (context === undefined) {
    throw new Error('usePort debe ser usado dentro de un PortProvider');
  }
  return context;
};