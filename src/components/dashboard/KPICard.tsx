// src/components/dashboard/KPICard.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    status: 'good' | 'warning' | 'critical' | 'normal';
    delta?: number | null;
    description: string;
    isInverseDelta?: boolean;
    tooltip?: string;
    note?: string;
    subtitle?: string;
    showInfoIcon?: boolean;
    // Nuevas props para información adicional
    kpiName?: string;
    currentValue?: number;
    additionalData?: {
        current?: number;
        total?: number;
        min?: number;
        max?: number;
        count?: number;
        hours?: number;
        entries?: number;
        exits?: number;
        movements?: number;
        rehandles?: number;
        containers?: number;
        trucks?: number;
        critical?: number;
        p90?: number;
    };
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon,
    status,
    delta,
    description,
    isInverseDelta = false,
    tooltip,
    note,
    subtitle,
    showInfoIcon = false,
    kpiName,
    currentValue,
    additionalData
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'good':
                return 'bg-green-950/30 text-green-300 border-green-700';
            case 'warning':
                return 'bg-yellow-950/30 text-yellow-300 border-yellow-700';
            case 'critical':
                return 'bg-red-950/30 text-red-300 border-red-700';
            default:
                return 'bg-slate-800 text-slate-300 border-slate-700';
        }
    };

    const getDeltaInfo = () => {
        if (delta === null || delta === undefined) return null;

        const deltaValue = delta * 100;
        const isPositive = delta > 0;
        const isGood = isInverseDelta ? !isPositive : isPositive;

        return {
            value: `${isPositive ? '+' : ''}${deltaValue.toFixed(1)}%`,
            color: isGood ? 'text-green-400' : 'text-red-400',
            icon: isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />
        };
    };

    // Función para obtener descripción contextual de cada KPI
    const getKPIContext = (kpiName: string, value?: number) => {
        const val = value || currentValue || 0;

        switch (kpiName) {
            case 'utilizacionPorVolumen':
                if (val < 50) return "Terminal con mucha capacidad libre";
                if (val < 70) return "Operación normal con margen";
                if (val < 85) return "Acercándose al límite operativo";
                return "Terminal cerca de saturación";

            case 'flujoPromedioGates':
                if (val < 30) return "Flujo muy bajo, posible inactividad";
                if (val < 50) return "Flujo moderado";
                if (val < 70) return "Flujo activo";
                return "Alta actividad en gates";

            case 'balanceFlujo':
                if (val < 0.9) return "Más salidas que entradas";
                if (val <= 1.1) return "Flujo equilibrado";
                if (val <= 1.3) return "Acumulación moderada";
                return "Acumulación crítica";

            case 'productividadOperacional':
                if (val < 50) return "Baja eficiencia operativa";
                if (val < 80) return "Productividad aceptable";
                if (val < 100) return "Buena productividad";
                return "Excelente rendimiento";

            case 'indiceRemanejo':
                if (val < 3) return "Excelente organización";
                if (val < 5) return "Nivel aceptable";
                if (val < 8) return "Requiere optimización";
                return "Urgente reorganizar";

            case 'variabilidadOperacional':
                if (val < 30) return "Operación muy estable";
                if (val < 50) return "Variabilidad normal";
                if (val < 70) return "Operación inestable";
                return "Alta volatilidad";

            case 'tiempoPermanencia':
                if (val < 3) return "Rotación rápida";
                if (val < 5) return "Tiempo normal";
                if (val < 7) return "Permanencia elevada";
                return "Contenedores estancados";

            case 'tiempoCamiones':
                if (val < 60) return "Proceso ágil";
                if (val < 90) return "Tiempo aceptable";
                if (val < 120) return "Demoras moderadas";
                return "Colas significativas";

            default:
                return "";
        }
    };

    // Función para obtener información adicional específica del KPI
    const getAdditionalInfo = () => {
        if (!kpiName || !additionalData) return null;

        switch (kpiName) {
            case 'utilizacionPorVolumen':
                if (additionalData.current && additionalData.total) {
                    return `${additionalData.current.toFixed(0)} de ${additionalData.total} TEUs`;
                }
                break;
            case 'flujoPromedioGates':
                if (additionalData.hours) {
                    return `en ${additionalData.hours} hrs activas`;
                }
                break;
            case 'balanceFlujo':
                if (additionalData.entries && additionalData.exits) {
                    return `E:${additionalData.entries} / S:${additionalData.exits}`;
                }
                break;
            case 'productividadOperacional':
                if (additionalData.movements) {
                    return `${additionalData.movements} mov total`;
                }
                break;
            case 'indiceRemanejo':
                if (additionalData.rehandles) {
                    return `${additionalData.rehandles} movimientos`;
                }
                break;
            case 'variabilidadOperacional':
                if (additionalData.min && additionalData.max) {
                    return `${additionalData.min}-${additionalData.max} TEUs`;
                }
                break;
            case 'tiempoPermanencia':
                if (additionalData.containers) {
                    return `${additionalData.containers} contenedores`;
                }
                break;
            case 'tiempoCamiones':
                if (additionalData.trucks) {
                    return `${additionalData.trucks} camiones`;
                }
                break;
        }
        return null;
    };

    const deltaInfo = getDeltaInfo();
    const contextDescription = kpiName ? getKPIContext(kpiName) : null;
    const additionalInfo = getAdditionalInfo();

    return (
        <div
            className={`rounded-lg border p-4 h-full flex flex-col ${getStatusColor()} relative group transition-transform hover:scale-[1.02]`}
            title={tooltip}
        >
            {/* Tooltip mejorado */}
            {tooltip && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-slate-900 text-white text-xs rounded
                               opacity-0 group-hover:opacity-100 transition-opacity duration-200
                               pointer-events-none whitespace-normal w-64 z-10 shadow-lg border border-slate-700">
                    {tooltip}
                    <div className="absolute top-full left-6 -mt-1 border-4 border-transparent
                                   border-t-slate-900"></div>
                </div>
            )}

            {/* Header con título e icono */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                    <span className="text-sm font-semibold pr-2">{title}</span>
                    {showInfoIcon && (
                        <Info size={14} className="text-slate-400 hover:text-slate-300 cursor-help" />
                    )}
                </div>
                <div className="p-2 rounded-full bg-slate-700/60 flex-shrink-0">
                    {icon}
                </div>
            </div>

            {/* Valor principal */}
            <div className="text-2xl font-bold mb-2">{value}</div>

            {/* Información adicional del KPI */}
            {additionalInfo && (
                <div className="text-xs text-slate-400 mb-2">
                    {additionalInfo}
                </div>
            )}

            {/* Contexto del KPI */}
            {contextDescription && (
                <div className="text-xs text-slate-500 mb-2 italic">
                    {contextDescription}
                </div>
            )}

            {/* Subtítulo si existe */}
            {subtitle && (
                <div className="text-xs text-slate-400 mb-2">
                    {subtitle}
                </div>
            )}

            {/* Alertas críticas específicas */}
            {kpiName === 'tiempoPermanencia' && additionalData?.critical && additionalData.critical > 100 && (
                <div className="text-xs text-red-400 font-medium mb-2">
                    ⚠️ {additionalData.critical} críticos
                </div>
            )}
            {kpiName === 'tiempoCamiones' && additionalData?.p90 && additionalData.p90 > 120 && (
                <div className="text-xs text-red-400 font-medium mb-2">
                    ⚠️ P90: {additionalData.p90}min
                </div>
            )}

            {/* Nota de advertencia si existe */}
            {note && (
                <div className="flex items-start mb-2 p-2 bg-yellow-950/30 rounded text-xs text-yellow-300 border border-yellow-800">
                    <AlertTriangle size={14} className="mr-1 flex-shrink-0 mt-0.5" />
                    <span>{note}</span>
                </div>
            )}

            {/* Footer con descripción y delta */}
            <div className="mt-auto">
                <div className="text-xs text-opacity-80 mb-1">{description}</div>

                {deltaInfo && (
                    <div className={`flex items-center ${deltaInfo.color} text-xs`}>
                        {deltaInfo.icon}
                        <span className="ml-1">{deltaInfo.value}</span>
                    </div>
                )}
            </div>
        </div>
    );
};