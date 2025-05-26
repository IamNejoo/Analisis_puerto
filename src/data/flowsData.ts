// src/data/flowsData.ts
import type { FlowData, FlowType } from '../types/flows';

// Generar datos simulados de movimientos
export const generateFlowData = (days: number = 7): FlowData[] => {
  const flows: FlowData[] = [];
  const now = new Date();
  
  // Patrones de movimiento por hora (picos operativos)
  const hourlyPattern = [
    0.1, 0.05, 0.02, 0.02, 0.03, 0.1,  // 00-05: Muy bajo
    0.4, 0.8, 1.0, 1.0, 0.9, 0.8,     // 06-11: Aumento matutino
    0.6, 0.7, 0.9, 1.0, 0.9, 0.8,     // 12-17: Pico vespertino
    0.6, 0.4, 0.3, 0.2, 0.15, 0.1     // 18-23: Declive nocturno
  ];

  const flowTypes: FlowType[] = ['RECV', 'DSCH', 'DLVR', 'LOAD', 'YARD'];
  const blocks = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'H1', 'H2', 'H3', 'H4', 'H5', 'T1', 'T2', 'T3', 'T4', 'E1', 'E2'];
  
  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const movementsThisHour = Math.floor(hourlyPattern[hour] * 50 * (0.8 + Math.random() * 0.4));
      
      for (let i = 0; i < movementsThisHour; i++) {
        const flowType = flowTypes[Math.floor(Math.random() * flowTypes.length)];
        const timestamp = new Date(now.getTime() - (days - day) * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000);
        
        let origin: string, destination: string;
        
        switch (flowType) {
          case 'RECV': // Camión a patio
            origin = 'GATE_IN';
            destination = blocks[Math.floor(Math.random() * blocks.length)];
            break;
          case 'DLVR': // Patio a camión
            origin = blocks[Math.floor(Math.random() * blocks.length)];
            destination = 'GATE_OUT';
            break;
          case 'DSCH': // Buque a patio
            origin = 'MUELLE';
            destination = blocks[Math.floor(Math.random() * blocks.length)];
            break;
          case 'LOAD': // Patio a buque
            origin = blocks[Math.floor(Math.random() * blocks.length)];
            destination = 'MUELLE';
            break;
          case 'YARD': // Movimiento interno
            origin = blocks[Math.floor(Math.random() * blocks.length)];
            destination = blocks[Math.floor(Math.random() * blocks.length)];
            while (destination === origin) {
              destination = blocks[Math.floor(Math.random() * blocks.length)];
            }
            break;
        }

        flows.push({
          id: `flow_${flows.length + 1}`,
          timestamp,
          type: flowType,
          origin,
          destination,
          containerId: `TCLU${Math.floor(Math.random() * 9999999)}`,
          containerType: Math.random() > 0.7 ? 'import' : Math.random() > 0.5 ? 'export' : Math.random() > 0.5 ? 'empty' : 'reefer',
          weight: 5 + Math.random() * 25, // 5-30 toneladas
          duration: 5 + Math.random() * 15, // 5-20 minutos
          equipmentUsed: Math.random() > 0.5 ? 'RTG' : 'STS'
        });
      }
    }
  }
  
  return flows.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

export const flowsData = generateFlowData(7);