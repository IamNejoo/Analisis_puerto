// src/hooks/useFilters.ts - HOOK CORREGIDO
import { useState, useCallback } from 'react';
import type { Filters } from '../types';

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
    showCaminos: true, // 🔧 CORREGIDO: era showCamiones
    showOccupancy: true,
    showProductivity: true,
    showTruckTime: true
  });

  const toggleFilter = useCallback((filterKey: keyof Filters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  }, []);

  const setFilter = useCallback((filterKey: keyof Filters, value: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      showGates: true,
      showContainers: true,
      showAduanas: true,
      showTebas: true,
      showIMO: true,
      showOHiggins: true,
      showEspingon: true,
      showGruas: true,
      showCaminos: true, // 🔧 CORREGIDO: era showCamiones
      showOccupancy: true,
      showProductivity: true,
      showTruckTime: true
    });
  }, []);

  return {
    filters,
    toggleFilter,
    setFilter,
    resetFilters
  };
};