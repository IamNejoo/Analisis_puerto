// src/types/flows.ts
export type FlowType = 'RECV' | 'DSCH' | 'DLVR' | 'LOAD' | 'YARD';
export type AnalysisLevel = 'macro' | 'meso' | 'micro';
export type NodeType = 'GATE' | 'PATIO' | 'MUELLE' | 'BLOCK';

export interface FlowData {
  id: string;
  timestamp: Date;
  type: FlowType;
  origin: string;      // ID del nodo origen
  destination: string; // ID del nodo destino
  containerId: string;
  containerType: 'import' | 'export' | 'empty' | 'reefer';
  weight?: number;
  operator?: string;
  equipmentUsed?: string; // Grúa, RTG, etc.
  duration?: number; // En minutos
}

export interface NetworkNode {
  id: string;
  name: string;
  type: NodeType;
  level: AnalysisLevel;
  position: { x: number; y: number };
  capacity?: number;
  currentOccupancy?: number;
  // Métricas calculadas
  totalInflows: number;
  totalOutflows: number;
  netFlow: number;
}

export interface FlowEdge {
  id: string;
  origin: string;
  destination: string;
  flowType: FlowType;
  count: number;
  totalWeight: number;
  avgDuration: number;
  throughput: number; // TEUs/hora
  // Visualización
  width: number; // Grosor de la línea
  color: string;
  animated: boolean;
}

export interface FlowAnalysis {
  level: AnalysisLevel;
  timeRange: { start: Date; end: Date };
  nodes: NetworkNode[];
  edges: FlowEdge[];
  metrics: FlowMetrics;
}

export interface FlowMetrics {
  totalMovements: number;
  importMovements: number;
  exportMovements: number;
  internalMovements: number;
  avgThroughputPerHour: number;
  peakHour: { hour: number; movements: number };
  bottlenecks: string[]; // IDs de nodos con congestión
  efficiency: number; // Ratio de movimientos directos vs reubicaciones
}