import React from 'react';
import { usePortKPIs } from '../../../hooks/usePortKPIs';

interface MovementRingsProps {
    patioId: string;
    cx: number;
    cy: number;
    baseRadius: number;
}

export const MovementRings: React.FC<MovementRingsProps> = ({
    patioId,
    cx,
    cy,
    baseRadius
}) => {
    const { currentKPIs, historicalData } = usePortKPIs({ patioFilter: patioId });

    if (!historicalData || historicalData.length === 0) return null;

    // Calcular totales de movimientos productivos y no productivos
    const totals = historicalData.reduce((acc, data) => {
        const productivos = data.gateEntradaContenedores + data.gateSalidaContenedores +
            data.muelleEntradaContenedores + data.muelleSalidaContenedores;
        const noProductivos = data.remanejosContenedores +
            data.patioEntradaContenedores + data.patioSalidaContenedores +
            data.terminalEntradaContenedores + data.terminalSalidaContenedores;

        return {
            productivos: acc.productivos + productivos,
            noProductivos: acc.noProductivos + noProductivos,
            total: acc.total + productivos + noProductivos
        };
    }, { productivos: 0, noProductivos: 0, total: 0 });

    const maxMovimientos = Math.max(totals.productivos, totals.noProductivos);
    const scale = 20 / maxMovimientos; // Escalar para que el anillo más grande sea de 20px

    // Calcular grosores proporcionales
    const productivoWidth = Math.max(2, totals.productivos * scale);
    const noProductivoWidth = Math.max(2, totals.noProductivos * scale);

    // Radio de los anillos
    const innerRadius = baseRadius + 5;
    const outerRadius = innerRadius + 10;

    // Calcular porcentajes para el texto
    const productivoPercent = totals.total > 0 ?
        ((totals.productivos / totals.total) * 100).toFixed(0) : 0;

    return (
        <g className="movement-rings">
            {/* Anillo interior - Movimientos Productivos */}
            <circle
                cx={cx}
                cy={cy}
                r={innerRadius}
                fill="none"
                stroke="#10b981"
                strokeWidth={productivoWidth}
                strokeOpacity={0.7}
                className="animate-pulse"
            />

            {/* Anillo exterior - Movimientos No Productivos */}
            <circle
                cx={cx}
                cy={cy}
                r={outerRadius}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={noProductivoWidth}
                strokeOpacity={0.7}
                strokeDasharray="5 3"
                className="animate-pulse"
            />

            {/* Indicador de porcentaje productivo */}
            <text
                x={cx}
                y={cy + baseRadius + 30}
                textAnchor="middle"
                className="fill-white text-xs font-semibold"
                style={{ paintOrder: 'stroke', stroke: '#1e293b', strokeWidth: 3 }}
            >
                {productivoPercent}%
            </text>

            {/* Tooltip */}
            <title>
                {`${patioId.toUpperCase()}\n` +
                    `Movimientos Productivos: ${totals.productivos.toLocaleString()} (${productivoPercent}%)\n` +
                    `Movimientos No Productivos: ${totals.noProductivos.toLocaleString()} (${100 - Number(productivoPercent)}%)\n` +
                    `Total: ${totals.total.toLocaleString()}`}
            </title>
        </g>
    );
};