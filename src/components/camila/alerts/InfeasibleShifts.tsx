// components/camila/alerts/InfeasibleShifts.tsx

import React from 'react';
import { AlertTriangle, XCircle, Info, HelpCircle } from 'lucide-react';

interface InfeasibleShiftsProps {
    turno: number;
    semana: number;
    mensaje?: string;
}

export const InfeasibleShifts: React.FC<InfeasibleShiftsProps> = ({
    turno,
    semana,
    mensaje = "No se encontró solución factible"
}) => {
    const posiblesCausas = [
        "Demanda excede la capacidad total de grúas disponibles",
        "Restricciones de segregación muy estrictas",
        "Conflictos en la asignación de bloques",
        "Parámetros de tiempo insuficientes para completar movimientos",
        "Restricciones de distancia entre bloques muy limitantes"
    ];

    return (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <XCircle className="text-red-600" size={32} />
                </div>
                <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Turno Sin Solución Factible
                    </h3>

                    <div className="text-red-800 mb-4">
                        <p className="font-medium">{mensaje}</p>
                        <p className="text-sm mt-1">
                            Semana {semana}, Turno {turno} - El modelo de optimización no pudo asignar grúas
                        </p>
                    </div>

                    <div className="bg-white/50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-red-900 mb-2 flex items-center">
                            <AlertTriangle size={16} className="mr-2" />
                            Posibles Causas
                        </h4>
                        <ul className="space-y-1 text-sm text-red-700">
                            {posiblesCausas.map((causa, idx) => (
                                <li key={idx} className="flex items-start">
                                    <span className="text-red-400 mr-2">•</span>
                                    <span>{causa}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                            <Info size={16} className="mr-2" />
                            Acciones Recomendadas
                        </h4>
                        <ol className="space-y-2 text-sm text-amber-800">
                            <li>
                                <span className="font-medium">1.</span> Revisar los parámetros de entrada del modelo
                            </li>
                            <li>
                                <span className="font-medium">2.</span> Verificar la demanda real vs capacidad disponible
                            </li>
                            <li>
                                <span className="font-medium">3.</span> Considerar relajar algunas restricciones operacionales
                            </li>
                            <li>
                                <span className="font-medium">4.</span> Evaluar redistribuir carga a turnos adyacentes
                            </li>
                            <li>
                                <span className="font-medium">5.</span> Contactar al equipo de optimización para análisis detallado
                            </li>
                        </ol>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <button className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 transition-colors">
                            <HelpCircle size={16} />
                            <span>Ver documentación del modelo</span>
                        </button>

                        <div className="text-sm text-gray-600">
                            Código resultado: INFEASIBLE_SOLUTION
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfeasibleShifts;