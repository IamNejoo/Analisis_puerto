import { useMemo } from 'react';
import { ocupacionData } from '../data/occupancyData';
import { productividadData } from '../data/productivityData';
import { tiempoCamionData } from '../data/truckTimeData';
import { ocupacionPatioData } from '../data/yardOccupancyData';
import { ocupacionBloqueData } from '../data/blockOccupancyData';
import { alertasData } from '../data/alertsData';
import { navesData } from '../data/shipsData';
import { patioData } from '../data/patioData';

// Hook para centralizar todos los datos del puerto
export const usePortData = () => {
  // Datos actuales (último punto de datos)
  const currentOcupacion = useMemo(() => 
    ocupacionData[ocupacionData.length - 1].value, []);
  
  const currentProductividad = useMemo(() => 
    productividadData[productividadData.length - 1], []);
  
  const currentTiempoCamion = useMemo(() => 
    tiempoCamionData[tiempoCamionData.length - 1].tiempo, []);

  // Función para determinar el color según el nivel de ocupación
  const getColorForOcupacion = (value: number): string => {
    if (value < 70) return '#7CB342'; // Verde
    if (value < 85) return '#FFA000'; // Amarillo
    return '#D32F2F'; // Rojo
  };

  // Obtener bloques por tipo
  const getBlocksByType = (tipo: string) => {
    return ocupacionBloqueData.filter(block => block.tipo === tipo);
  };

  // Calcular ocupación promedio por tipo
  const getAverageOccupancyByType = (tipo: string) => {
    const blocks = getBlocksByType(tipo);
    if (blocks.length === 0) return 0;
    
    const sum = blocks.reduce((acc, block) => acc + block.ocupacion, 0);
    return Math.round(sum / blocks.length);
  };

  // Obtener datos de patio por ID
  const getPatioById = (patioId: string) => {
    return patioData.find(patio => patio.id === patioId);
  };

  // Obtener datos de bloque por patio e ID
  const getBloqueById = (patioId: string, bloqueId: string) => {
    const patio = getPatioById(patioId);
    return patio?.bloques.find(bloque => bloque.id === bloqueId);
  };

  // Obtener estadísticas generales del terminal
  const getTerminalStats = useMemo(() => {
    const totalPatios = patioData.length;
    const totalBloques = patioData.reduce((sum, patio) => sum + patio.bloques.length, 0);
    const totalCapacidad = patioData.reduce((sum, patio) => 
      sum + patio.bloques.reduce((bloqueSum, bloque) => bloqueSum + bloque.capacidadTotal, 0), 0);
    const totalOcupado = patioData.reduce((sum, patio) => 
      sum + patio.bloques.reduce((bloqueSum, bloque) => 
        bloqueSum + Math.round(bloque.capacidadTotal * bloque.ocupacion / 100), 0), 0);
    
    return {
      totalPatios,
      totalBloques,
      totalCapacidad,
      totalOcupado,
      ocupacionPromedio: Math.round((totalOcupado / totalCapacidad) * 100)
    };
  }, []);

  // Obtener patios con ocupación crítica
  const getCriticalPatios = useMemo(() => {
    return patioData.filter(patio => patio.ocupacionTotal > 85);
  }, []);

  // Obtener bloques con ocupación crítica
  const getCriticalBloques = useMemo(() => {
    const criticalBloques: any[] = [];
    patioData.forEach(patio => {
      patio.bloques.forEach(bloque => {
        if (bloque.ocupacion > 85) {
          criticalBloques.push({
            ...bloque,
            patioName: patio.name,
            patioId: patio.id
          });
        }
      });
    });
    return criticalBloques;
  }, []);

  // Función para buscar contenedores
  const searchContainers = (searchTerm: string) => {
    const results: any[] = [];
    patioData.forEach(patio => {
      patio.bloques.forEach(bloque => {
        bloque.bahias.forEach(bahia => {
          if (bahia.containerId && 
              bahia.containerId.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({
              containerId: bahia.containerId,
              bahiaId: bahia.id,
              bloqueId: bloque.id,
              patioId: patio.id,
              patioName: patio.name,
              containerType: bahia.containerType,
              status: bahia.status
            });
          }
        });
      });
    });
    return results;
  };

  return {
    // Datos originales
    ocupacionData,
    productividadData,
    tiempoCamionData,
    ocupacionPatioData,
    ocupacionBloqueData,
    alertasData,
    navesData,
    patioData,
    
    // Valores actuales
    currentOcupacion,
    currentProductividad,
    currentTiempoCamion,
    
    // Utilidades
    getColorForOcupacion,
    getBlocksByType,
    getAverageOccupancyByType,
    getPatioById,
    getBloqueById,
    
    // Estadísticas avanzadas
    getTerminalStats,
    getCriticalPatios,
    getCriticalBloques,
    searchContainers
  };
};