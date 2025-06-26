// types/camila.ts (nuevo archivo o agregar a types/index.ts)

export interface CamilaFilters {
    // Filtros de tiempo
    hourRange: {
        start: number;
        end: number;
    };

    // Filtros de recursos
    selectedGruas: number[];
    selectedBlocks: string[];

    // Filtros de segregaciones
    selectedSegregations: string[];
    showTopSegregations: boolean;
    topSegregationsCount: number;

    // Filtros de congestión
    congestionLevels: ('low' | 'medium' | 'high')[];

    // Filtros de vista
    viewMode: 'summary' | 'detailed' | 'comparison';
    compareModels: boolean;

    // Filtros de análisis
    showPeakHours: boolean;
    showPatterns: boolean;
}

export interface SegregationInfo {
    id: string;
    name: string;
    volume: number;
    percentage: number;
    blocks: string[];
    color: string;
}