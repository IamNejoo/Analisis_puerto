import { useState } from 'react';
import type { Filters } from '../types';

// Hook para gestionar filtros del mapa
export const useFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    showGates: true,
    showContainers: true,
    showAduanas: true,
    showTebas: true,
    showIMO: true,
    showOHiggins: true,
    showEspingon: true,
    showGruas: true,
    showCaminos: true
  });

  const toggleFilter = (filter: string) => {
    setFilters({
      ...filters,
      [filter]: !filters[filter as keyof typeof filters]
    });
  };

  return { filters, toggleFilter };
};