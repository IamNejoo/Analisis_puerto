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
  showCaminos: boolean; // CORREGIDO: era showCamiones
  showOccupancy: boolean;
  showProductivity: boolean;
  showTruckTime: boolean;
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
export type TimeUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'shift';
export type DataSource = 'historical' | 'modelMagdalena' | 'modelCamila';

export interface TimeState {
  unit: TimeUnit;
  currentDate: Date;
  dataSource: DataSource;
  magdalenaConfig?: MagdalenaConfig;
  camilaConfig?: CamilaConfig;
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

// Tipos adicionales para integración de Magdalena
export interface MagdalenaConfig {
  participacion: 68 | 69 | 70;
  conDispersion: boolean;
  semana: number;
}

export interface MagdalenaKPIs {
  distanciaTotal: number;
  mejoraVsReal: number;
  segregacionesGestionadas: number;
  reubicacionesEliminadas: number;
  eficienciaDispersion: number;
  ocupacionOptimizada: number;
}

export interface MagdalenaWeekData {
  semana: number;
  participacion: 68 | 69 | 70;
  conDispersion: boolean;
  distanciaReal: number;
  distanciaModelo: number;
  mejoraPorcentaje: number;
  segregaciones: number;
  ocupacionReal: number;
  ocupacionModelo: number;
  reubicacionesEliminadas: number;
}

// Extender TimeState existente
export interface ExtendedTimeState extends TimeState {
  magdalenaConfig?: MagdalenaConfig;
  camilaConfig?: CamilaConfig;
}

// Props para nuevos componentes
export interface ModelSelectorProps {
  participacion: 68 | 69 | 70;
  conDispersion: boolean;
  semana: number;
  onParticipacionChange: (participacion: 68 | 69 | 70) => void;
  onDispersionChange: (conDispersion: boolean) => void;
  onSemanaChange: (semana: number) => void;
  isLoading?: boolean;
}

export interface ComparisonData {
  semana: number;
  real: number;
  modelo: number;
  mejora: number;
  segregaciones: number;
}

// Tipos para Magdalena - VERSIÓN CORREGIDA
export interface MagdalenaMetrics {
  // Datos base de comparación
  totalMovimientos: number;
  reubicaciones: number;
  eficienciaReal: number;

  // Optimización Magdalena  
  totalMovimientosOptimizados: number; // RENOMBRADO para evitar conflicto
  reubicacionesEliminadas: number;
  eficienciaGanada: number;

  // Segregaciones
  segregacionesActivas: number;
  bloquesAsignados: number;
  distribucionSegregaciones: Array<{
    segregacion: string;
    bloques: number;
    ocupacion: number;
  }>;

  // Carga de trabajo
  cargaTrabajoTotal: number;
  variacionCarga: number;
  balanceWorkload: number;

  // Ocupación
  ocupacionPromedio: number;
  utilizacionEspacio: number;

  // Comparación movimientos - SEPARADOS EN OBJETOS DISTINTOS
  movimientosReales: {
    DLVR: number;
    DSCH: number;
    LOAD: number;
    RECV: number;
    OTHR: number;
    YARD: number;
  };

  movimientosOptimizadosDetalle: { // RENOMBRADO para evitar conflicto
    Recepcion: number;
    Carga: number;
    Descarga: number;
    Entrega: number;
  };

  // Datos temporales
  periodos: number;
  bloquesUnicos: string[];

  // Datos para gráficos
  ocupacionPorPeriodo: Array<{
    periodo: number;
    ocupacion: number;
    capacidad: number;
  }>;

  workloadPorBloque: Array<{
    bloque: string;
    cargaTrabajo: number;
    periodo: number;
  }>;

  segregacionesPorBloque: Array<{
    segregacion: string;
    bloque: string;
    periodo: number;
    volumen: number;
  }>;
}

export interface RealDataMetrics {
  totalMovimientos: number;
  reubicaciones: number;
  porcentajeReubicaciones: number;
  movimientosPorTipo: {
    DLVR: number;
    DSCH: number;
    LOAD: number;
    RECV: number;
    OTHR: number;
  };
  bloquesUnicos: string[];
  turnos: number[];
  carriers: number;
}

export interface ComparisonMetrics {
  eliminacionReubicaciones: number;
  mejoraPorcentual: number;
  optimizacionSegregaciones: number;
  balanceCargaMejorado: boolean;
  eficienciaTotal: number;
}

// Tipos para el modelo de Camila
export interface CamilaConfig {
  modelType: 'minmax' | 'maxmin';
  withSegregations: boolean;
  week: number;
  day: string;
  shift: number;
}

export interface CamilaResults {
  // Matrices principales del modelo
  grueAssignment: number[][];      // y_gbt
  receptionFlow: number[][];       // fr_sbt
  deliveryFlow: number[][];        // fe_sbt
  loadingFlow: number[][];         // fc_sbt
  unloadingFlow: number[][];       // fd_sbt

  // Métricas calculadas
  totalFlows: number[][];          // suma de todos los flujos
  capacity: number[][];            // capacidad por bloque/tiempo
  availability: number[][];        // capacidad - flujos

  // KPIs
  workloadBalance: number;         // balance de carga
  congestionIndex: number;         // índice de congestión
  blockParticipation: number[];    // % participación por bloque
  timeParticipation: number[];     // % participación por hora
  stdDevBlocks: number;            // desviación estándar entre bloques
  stdDevTime: number;              // desviación estándar entre horas
  recommendedQuotas: number[][];   // cuotas sugeridas por hora

  // Metadatos
  objectiveValue: number;
  modelType: 'minmax' | 'maxmin';
  week: number;
  day: string;
  shift: number;
}

export interface CamilaRealComparison {
  realMovements: number[][];
  optimizedMovements: number[][];
  improvements: {
    workloadBalance: number;
    congestionReduction: number;
    resourceUtilization: number;
  };
}

export interface TimeContextType {
  timeState: TimeState | null;
  isLoadingData: boolean;
  setTimeUnit: (unit: TimeUnit) => void;
  setDataSource: (source: DataSource) => void;
  setMagdalenaConfig?: (config: MagdalenaConfig) => void;
  setCamilaConfig?: (config: CamilaConfig) => void;
  goToPreviousPeriod: () => void;
  goToNextPeriod: () => void;
  playPause: () => void;
  resetToNow: () => void;
  getDisplayFormat?: () => string;
  goToWeek?: (week: number) => void;
  loadHistoricalDataForPeriod?: (startDate: Date, endDate: Date, patio?: string) => Promise<void>;
}