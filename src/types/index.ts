// Definiciones de tipos existentes
export interface OccupancyData {
  name: string;
  value: number;
}

export interface ProductivityData {
  name: string;
  bmph: number;
  gmph: number;
}

export interface TruckTimeData {
  name: string;
  tiempo: number;
}

export interface YardOccupancyData {
  name: string;
  value: number;
}

export interface BlockOccupancyData {
  id: string;
  ocupacion: number;
  tipo: string;
}

export interface AlertData {
  id: number;
  titulo: string;
  tipo: string;
  tiempo: string;
  mensaje: string;
  area: string;
}

export interface ShipData {
  id: number;
  nombre: string;
  servicio: string;
  eta: string;
  etd: string;
  sitio: string;
  movs: number;
  estado: 'En tránsito' | 'Programado' | 'En operación';
  completado: number;
}

export interface Filters {
  showGates: boolean;
  showContainers: boolean;
  showAduanas: boolean;
  showTebas: boolean;
  showIMO: boolean;
  showOHiggins: boolean;
  showEspingon: boolean;
  showGruas: boolean;
  showCaminos: boolean;
  [key: string]: boolean;
}

export interface GaugeChartProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

// Props para entidades del mapa
export interface EntityProps {
  filters: Filters;
  getColorForOcupacion?: (value: number) => string;
  onPatioClick?: (patioId: string) => void;
}

// NUEVOS TIPOS PARA MULTI-NIVEL
export type ViewLevel = 'terminal' | 'patio' | 'bloque';

export interface ViewState {
  level: ViewLevel;
  selectedPatio?: string;
  selectedBloque?: string;
  selectedBahia?: string;
}

export interface BahiaData {
  id: string;
  bloqueId: string;
  position: number;
  occupied: boolean;
  containerType?: 'import' | 'export' | 'empty' | 'reefer';
  containerId?: string;
  lastMovement?: Date;
  size?: '20' | '40' | '45';
  weight?: number;
  destination?: string;
  status?: 'available' | 'reserved' | 'in_transit' | 'customs_hold';
}

export interface BloqueData {
  id: string;
  patioId: string;
  name: string;
  ocupacion: number;
  capacidadTotal: number;
  bahias: BahiaData[];
  tipo: string;
  bounds: { x: number; y: number; width: number; height: number };
  lastUpdate?: Date;
  operationalStatus: 'active' | 'maintenance' | 'restricted';
  equipmentType?: 'rtg' | 'rmg' | 'reach_stacker';
}

export interface PatioData {
  id: string;
  name: string;
  type: 'contenedores' | 'ohiggins' | 'tebas' | 'imo' | 'espingon';
  bloques: BloqueData[];
  ocupacionTotal: number;
  bounds: { x: number; y: number; width: number; height: number };
  description?: string;
  manager?: string;
  emergencyContact?: string;
  operatingHours: { start: string; end: string };
  restrictions?: string[];
}

export interface PatioStats {
  totalCapacity: number;
  currentOccupancy: number;
  occupancyRate: number;
  blocksActive: number;
  blocksInMaintenance: number;
  avgTurnoverTime: number;
  recentMovements: number;
}

// ... tipos existentes ...

// NUEVOS TIPOS PARA CORREGIR LOS `any`
export interface PatioStatsExtended {
  totalCapacity: number;
  currentOccupancy: number;
  occupancyRate: number;
  blocksActive: number;
  blocksInMaintenance: number;
  avgTurnoverTime: number;
  recentMovements: number;
}

export interface CriticalBloqueWithPatio extends BloqueData {
  patioName: string;
  patioId: string;
}

export interface ContainerSearchResult {
  containerId: string;
  bahiaId: string;
  bloqueId: string;
  patioId: string;
  patioName: string;
  containerType?: 'import' | 'export' | 'empty' | 'reefer';
  status?: 'available' | 'reserved' | 'in_transit' | 'customs_hold';
}

export interface BloqueStats {
  total: number;
  occupied: number;
  free: number;
  import: number;
  export: number;
  empty: number;
  reefer: number;
}

export interface TerminalStats {
  totalPatios: number;
  totalBloques: number;
  totalCapacidad: number;
  totalOcupado: number;
  ocupacionPromedio: number;
}

export interface PatioInfoPanelProps {
  patio: PatioData;
  stats: PatioStatsExtended;
  selectedBloque: string | null;
}

export interface BloqueInfoPanelProps {
  bloque: BloqueData;
  selectedBahia: BahiaData | null | undefined;
  stats: BloqueStats;
}


// Nuevos tipos para la navegación temporal
export type TimeUnit = 'hour' | 'shift' | 'week';
export type DataSource = 'historical' | 'modelMagdalena' | 'modelCamila';

export interface TimeState {
  unit: TimeUnit;
  currentDate: Date;
  dataSource: DataSource;
}

// Tipos para indicadores de congestión
export interface CongestionIndicator {
  id: string;
  name: string;
  value: number;
  description: string;
  timestamp: Date;
  dataSource: DataSource;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  unit: string;
}

// Tipos para comparar modelos vs datos históricos
export interface ModelComparisonData {
  historical: number;
  modelMagdalena?: number;
  modelCamila?: number;
  delta?: number;
  deltaPercentage?: number;
  indicator: string;
  timestamp: Date;
  unit: string;
}

// Tipos para segregación de bahías
export interface SegregationData {
  id: string;
  patioId: string;
  bloqueId: string;
  bahiaId: string;
  segregationType: string;
  colorCode: string;
  assignedBy: DataSource;
  timestamp: Date;
}

// Tipos para funciones objetivo
export interface ObjectiveFunction {
  id: string;
  name: string;
  value: number;
  dataSource: DataSource;
  timestamp: Date;
  description: string;
  target: number;
  unit: string;
}

// Tipos para paneles de información por tiempo
export interface TimeContextInfo {
  timeUnit: TimeUnit;
  dataSource: DataSource;
  currentDate: Date;
  displayString: string;
  availableModels: DataSource[];
  congestionLevel: 'low' | 'medium' | 'high';
  dataAvailable: boolean;
}

// Integración con tipos existentes
export interface TimeFilteredData<T> {
  data: T[];
  timestamp: Date;
  unit: TimeUnit;
  dataSource: DataSource;
  previousPeriodData?: T[];
  nextPeriodData?: T[];
  isLoading: boolean;
}
// En src/types/index.ts
export interface ChartsPanelProps {
  ocupacionData: OccupancyData[];
  productividadData: ProductivityData[];
  tiempoCamionData: TruckTimeData[];
  getColorForOcupacion: (value: number) => string;
  timeState?: TimeState; // Agregar esta propiedad
  isLoading?: boolean;  // Agregar esta propiedad
}

export interface TimeState {
  unit: TimeUnit;
  currentDate: Date;
  dataSource: DataSource;
}

// Tipos para indicadores de congestión
export interface CongestionIndicator {
  id: string;
  name: string;
  value: number;
  description: string;
  timestamp: Date;
  dataSource: DataSource;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  unit: string;
}

// Tipos para comparar modelos vs datos históricos
export interface ModelComparisonData {
  historical: number;
  modelMagdalena?: number;
  modelCamila?: number;
  delta?: number;
  deltaPercentage?: number;
  indicator: string;
  timestamp: Date;
  unit: string;
}

// Tipos para segregación de bahías
export interface SegregationData {
  id: string;
  patioId: string;
  bloqueId: string;
  bahiaId: string;
  segregationType: string;
  colorCode: string;
  assignedBy: DataSource;
  timestamp: Date;
}

// Tipos para funciones objetivo
export interface ObjectiveFunction {
  id: string;
  name: string;
  value: number;
  dataSource: DataSource;
  timestamp: Date;
  description: string;
  target: number;
  unit: string;
}

// Tipos para paneles de información por tiempo
export interface TimeContextInfo {
  timeUnit: TimeUnit;
  dataSource: DataSource;
  currentDate: Date;
  displayString: string;
  availableModels: DataSource[];
  congestionLevel: 'low' | 'medium' | 'high';
  dataAvailable: boolean;
}

// Integración con tipos existentes
export interface TimeFilteredData<T> {
  data: T[];
  timestamp: Date;
  unit: TimeUnit;
  dataSource: DataSource;
  previousPeriodData?: T[];
  nextPeriodData?: T[];
  isLoading: boolean;
}