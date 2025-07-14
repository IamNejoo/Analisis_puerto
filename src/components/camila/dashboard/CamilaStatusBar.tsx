// components/camila/dashboard/CamilaStatusBar.tsx

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface CamilaStatusBarProps {
    hasSolution: boolean;
    estadoResultado: string;
    totalMovimientos: number;
}

export const CamilaStatusBar: React.FC<CamilaStatusBarProps> = ({
    hasSolution,
    estadoResultado,
    totalMovimientos
}) => {
    const getStatusConfig = () => {
        if (!hasSolution) {
            return {
                icon: <XCircle size={20} />,
                text: 'Sin solución factible',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800',
                iconColor: 'text-red-500'
            };
        }

        if (totalMovimientos === 0) {
            return {
                icon: <AlertCircle size={20} />,
                text: 'Sin movimientos asignados',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200',
                textColor: 'text-amber-800',
                iconColor: 'text-amber-500'
            };
        }

        return {
            icon: <CheckCircle size={20} />,
            text: `Solución óptima encontrada - ${totalMovimientos} movimientos`,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-800',
            iconColor: 'text-green-500'
        };
    };

    const status = getStatusConfig();

    return (
        <div className={`${status.bgColor} ${status.borderColor} border rounded-lg p-4`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={status.iconColor}>
                        {status.icon}
                    </div>
                    <div>
                        <p className={`font-medium ${status.textColor}`}>
                            {status.text}
                        </p>
                        <p className={`text-sm ${status.textColor} opacity-75`}>
                            Estado: {estadoResultado}
                        </p>
                    </div>
                </div>

                {!hasSolution && (
                    <button className="flex items-center space-x-2 text-sm bg-white px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Info size={16} />
                        <span>Ver detalles</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CamilaStatusBar;