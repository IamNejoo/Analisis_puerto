import type { PatioData } from '../types';

// Función helper para generar bahías
const generateBahias = (bloqueId: string, totalBahias: number, ocupacionRate: number) => {
  return Array.from({ length: totalBahias }, (_, i) => {
    const isOccupied = Math.random() < (ocupacionRate / 100);
    const containerTypes = ['import', 'export', 'empty', 'reefer'] as const;
    const sizes = ['20', '40', '45'] as const;
    const statuses = ['available', 'reserved', 'in_transit', 'customs_hold'] as const;
    
    return {
      id: `${bloqueId}-${String(i + 1).padStart(2, '0')}`,
      bloqueId,
      position: i + 1,
      occupied: isOccupied,
      containerType: isOccupied ? containerTypes[Math.floor(Math.random() * containerTypes.length)] : undefined,
      containerId: isOccupied ? `${['TCLU', 'MSCU', 'GESU', 'HAPAG'][Math.floor(Math.random() * 4)]}${Math.floor(Math.random() * 9999999).toString().padStart(7, '0')}` : undefined,
      lastMovement: isOccupied ? new Date(Date.now() - Math.random() * 86400000 * 7) : undefined,
      size: isOccupied ? sizes[Math.floor(Math.random() * sizes.length)] : undefined,
      weight: isOccupied ? Math.floor(Math.random() * 30000) + 5000 : undefined,
      destination: isOccupied ? ['Santiago', 'Valparaíso', 'Concepción', 'La Serena'][Math.floor(Math.random() * 4)] : undefined,
      status: isOccupied ? statuses[Math.floor(Math.random() * statuses.length)] : undefined
    };
  });
};

export const patioData: PatioData[] = [
  {
    id: 'costanera',
    name: 'Patio Costanera',
    type: 'contenedores',
    ocupacionTotal: 78,
    bounds: { x: 447, y: 518, width: 400, height: 120 },
    description: 'Principal área de almacenamiento de contenedores del terminal',
    manager: 'Carlos Mendoza',
    emergencyContact: '+56 9 8765 4321',
    operatingHours: { start: '06:00', end: '22:00' },
    restrictions: ['No mercancías peligrosas', 'Máximo 4 alturas'],
    bloques: [
      {
        id: 'C1',
        patioId: 'costanera',
        name: 'Bloque C1',
        ocupacion: 82,
        capacidadTotal: 49,
        tipo: 'Contenedores',
        bounds: { x: 0, y: 0, width: 100, height: 50 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'rtg',
        bahias: generateBahias('C1', 49, 82)
      },
      {
        id: 'C2',
        patioId: 'costanera',
        name: 'Bloque C2',
        ocupacion: 75,
        capacidadTotal: 49,
        tipo: 'Contenedores',
        bounds: { x: 0, y: 60, width: 100, height: 50 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'rtg',
        bahias: generateBahias('C2', 49, 75)
      },
      {
        id: 'C3',
        patioId: 'costanera',
        name: 'Bloque C3',
        ocupacion: 90,
        capacidadTotal: 49,
        tipo: 'Contenedores',
        bounds: { x: 110, y: 0, width: 100, height: 50 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'rtg',
        bahias: generateBahias('C3', 49, 90)
      },
      {
        id: 'C4',
        patioId: 'costanera',
        name: 'Bloque C4',
        ocupacion: 65,
        capacidadTotal: 49,
        tipo: 'Contenedores',
        bounds: { x: 110, y: 60, width: 100, height: 50 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'rtg',
        bahias: generateBahias('C4', 49, 65)
      },
      {
        id: 'C5',
        patioId: 'costanera',
        name: 'Bloque C5',
        ocupacion: 70,
        capacidadTotal: 49,
        tipo: 'Contenedores',
        bounds: { x: 220, y: 0, width: 100, height: 50 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'rmg',
        bahias: generateBahias('C5', 49, 70)
      },
      {
        id: 'C6',
        patioId: 'costanera',
        name: 'Bloque C6',
        ocupacion: 95,
        capacidadTotal: 49,
        tipo: 'Contenedores',
        bounds: { x: 220, y: 60, width: 100, height: 50 },
        lastUpdate: new Date(),
        operationalStatus: 'restricted',
        equipmentType: 'rtg',
        bahias: generateBahias('C6', 49, 95)
      },
      {
        id: 'C7',
        patioId: 'costanera',
        name: 'Bloque C7',
        ocupacion: 80,
        capacidadTotal: 49,
        tipo: 'Contenedores',
        bounds: { x: 330, y: 0, width: 100, height: 50 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'rtg',
        bahias: generateBahias('C7', 49, 80)
      },
      {
        id: 'C8',
        patioId: 'costanera',
        name: 'Bloque C8',
        ocupacion: 60,
        capacidadTotal: 49,
        tipo: 'Contenedores',
        bounds: { x: 330, y: 60, width: 100, height: 50 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'rtg',
        bahias: generateBahias('C8', 49, 60)
      },
      {
        id: 'C9',
        patioId: 'costanera',
        name: 'Bloque C9',
        ocupacion: 85,
        capacidadTotal: 49,
        tipo: 'Contenedores',
        bounds: { x: 440, y: 0, width: 100, height: 110 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'rmg',
        bahias: generateBahias('C9', 49, 85)
      }
    ]
  },
  {
    id: 'ohiggins',
    name: 'Patio O\'Higgins',
    type: 'ohiggins',
    ocupacionTotal: 72,
    bounds: { x: 302, y: 437, width: 200, height: 150 },
    description: 'Área especializada para contenedores refrigerados y carga especial',
    manager: 'Ana Rodríguez',
    emergencyContact: '+56 9 1234 5678',
    operatingHours: { start: '00:00', end: '23:59' },
    restrictions: ['Solo contenedores refrigerados', 'Acceso restringido'],
    bloques: [
      {
        id: 'H1',
        patioId: 'ohiggins',
        name: 'Bloque H1',
        ocupacion: 72,
        capacidadTotal: 36,
        tipo: 'OHiggins',
        bounds: { x: 0, y: 0, width: 90, height: 70 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('H1', 36, 72)
      },
      {
        id: 'H2',
        patioId: 'ohiggins',
        name: 'Bloque H2',
        ocupacion: 65,
        capacidadTotal: 36,
        tipo: 'OHiggins',
        bounds: { x: 0, y: 80, width: 90, height: 70 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('H2', 36, 65)
      },
      {
        id: 'H3',
        patioId: 'ohiggins',
        name: 'Bloque H3',
        ocupacion: 85,
        capacidadTotal: 36,
        tipo: 'OHiggins',
        bounds: { x: 100, y: 0, width: 90, height: 70 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('H3', 36, 85)
      },
      {
        id: 'H4',
        patioId: 'ohiggins',
        name: 'Bloque H4',
        ocupacion: 60,
        capacidadTotal: 36,
        tipo: 'OHiggins',
        bounds: { x: 100, y: 80, width: 90, height: 70 },
        lastUpdate: new Date(),
        operationalStatus: 'maintenance',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('H4', 36, 60)
      },
      {
        id: 'H5',
        patioId: 'ohiggins',
        name: 'Bloque H5',
        ocupacion: 78,
        capacidadTotal: 40,
        tipo: 'OHiggins',
        bounds: { x: 50, y: 160, width: 100, height: 40 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('H5', 40, 78)
      }
    ]
  },
  {
    id: 'tebas',
    name: 'Patio Tebas',
    type: 'tebas',
    ocupacionTotal: 70,
    bounds: { x: 278, y: 336, width: 60, height: 80 },
    description: 'Área de almacenamiento temporal y tránsito',
    manager: 'Pedro Sánchez',
    emergencyContact: '+56 9 9876 5432',
    operatingHours: { start: '07:00', end: '19:00' },
    restrictions: ['Solo contenedores de tránsito', 'Estadía máxima 48h'],
    bloques: [
      {
        id: 'T1',
        patioId: 'tebas',
        name: 'Bloque T1',
        ocupacion: 55,
        capacidadTotal: 24,
        tipo: 'Tebas',
        bounds: { x: 0, y: 0, width: 60, height: 20 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('T1', 24, 55)
      },
      {
        id: 'T2',
        patioId: 'tebas',
        name: 'Bloque T2',
        ocupacion: 75,
        capacidadTotal: 24,
        tipo: 'Tebas',
        bounds: { x: 0, y: 25, width: 60, height: 20 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('T2', 24, 75)
      },
      {
        id: 'T3',
        patioId: 'tebas',
        name: 'Bloque T3',
        ocupacion: 82,
        capacidadTotal: 24,
        tipo: 'Tebas',
        bounds: { x: 0, y: 50, width: 60, height: 20 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('T3', 24, 82)
      },
      {
        id: 'T4',
        patioId: 'tebas',
        name: 'Bloque T4',
        ocupacion: 68,
        capacidadTotal: 24,
        tipo: 'Tebas',
        bounds: { x: 0, y: 75, width: 60, height: 20 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('T4', 24, 68)
      }
    ]
  },
  {
    id: 'imo',
    name: 'Zona IMO',
    type: 'imo',
    ocupacionTotal: 87,
    bounds: { x: 178, y: 421, width: 60, height: 32 },
    description: 'Área especializada para mercancías peligrosas clasificadas IMO',
    manager: 'Roberto Silva',
    emergencyContact: '+56 9 5555 0000',
    operatingHours: { start: '08:00', end: '18:00' },
    restrictions: ['Solo mercancías peligrosas', 'Personal certificado', 'Equipos especiales'],
    bloques: [
      {
        id: 'I1',
        patioId: 'imo',
        name: 'Bloque I1',
        ocupacion: 90,
        capacidadTotal: 16,
        tipo: 'IMO',
        bounds: { x: 0, y: 0, width: 28, height: 32 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('I1', 16, 90)
      },
      {
        id: 'I2',
        patioId: 'imo',
        name: 'Bloque I2',
        ocupacion: 85,
        capacidadTotal: 16,
        tipo: 'IMO',
        bounds: { x: 32, y: 0, width: 28, height: 32 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('I2', 16, 85)
      }
    ]
  },
  {
    id: 'espingon',
    name: 'Patio Espingón',
    type: 'espingon',
    ocupacionTotal: 77,
    bounds: { x: 946, y: 467, width: 80, height: 60 },
    description: 'Área de operaciones especiales y carga rodante',
    manager: 'María González',
    emergencyContact: '+56 9 7777 8888',
    operatingHours: { start: '06:00', end: '20:00' },
    restrictions: ['Carga rodante únicamente', 'Inspección previa obligatoria'],
    bloques: [
      {
        id: 'E1',
        patioId: 'espingon',
        name: 'Bloque E1',
        ocupacion: 75,
        capacidadTotal: 20,
        tipo: 'Espingon',
        bounds: { x: 0, y: 0, width: 35, height: 60 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('E1', 20, 75)
      },
      {
        id: 'E2',
        patioId: 'espingon',
        name: 'Bloque E2',
        ocupacion: 80,
        capacidadTotal: 20,
        tipo: 'Espingon',
        bounds: { x: 45, y: 0, width: 35, height: 60 },
        lastUpdate: new Date(),
        operationalStatus: 'active',
        equipmentType: 'reach_stacker',
        bahias: generateBahias('E2', 20, 80)
      }
    ]
  }
];

// Función para obtener estadísticas de un patio
export const getPatioStats = (patioId: string) => {
  const patio = patioData.find(p => p.id === patioId);
  if (!patio) return null;

  const totalCapacity = patio.bloques.reduce((sum, bloque) => sum + bloque.capacidadTotal, 0);
  const totalOccupied = patio.bloques.reduce((sum, bloque) => sum + Math.round(bloque.capacidadTotal * bloque.ocupacion / 100), 0);
  const blocksActive = patio.bloques.filter(b => b.operationalStatus === 'active').length;
  const blocksInMaintenance = patio.bloques.filter(b => b.operationalStatus === 'maintenance').length;

  return {
    totalCapacity,
    currentOccupancy: totalOccupied,
    occupancyRate: Math.round((totalOccupied / totalCapacity) * 100),
    blocksActive,
    blocksInMaintenance,
    avgTurnoverTime: Math.floor(Math.random() * 48) + 24, // Simulado
    recentMovements: Math.floor(Math.random() * 100) + 50 // Simulado
  };
};