// src/components/map/views/patio/PatioErrorStates.tsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface PatioErrorStatesProps {
    type: 'loading' | 'error' | 'no-patio' | 'camila-no-data' | 'magdalena-no-data';
    error?: string | null;
    config?: any;
    dataSource?: string;
    onRetry?: () => void;
}

export const PatioErrorStates: React.FC<PatioErrorStatesProps> = ({
    type,
    error,
    config,
    dataSource,
    onRetry
}) => {
    if (type === 'loading') {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                    <p className="mt-4 text-slate-400">
                        {dataSource === 'modelCamila' ? 'Cargando datos del modelo Camila...' :
                            dataSource === 'modelMagdalena' ? 'Cargando datos del modelo Magdalena...' :
                                'Cargando datos históricos...'}
                    </p>
                </div>
            </div>
        );
    }

    if (type === 'error') {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center max-w-md p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
                    <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">Error al cargar datos</h3>
                    <p className="text-slate-400 mb-4">{error}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center mx-auto"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Reintentar
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (type === 'camila-no-data') {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center max-w-md p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
                    <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">Datos no disponibles</h3>
                    <p className="text-slate-400 mb-4">
                        No se encontraron datos para la configuración de Camila seleccionada:
                    </p>
                    {config && (
                        <div className="bg-slate-700 rounded p-3 mb-4 text-sm">
                            <p className="text-slate-300"><strong>Año:</strong> {config.anio}</p>
                            <p className="text-slate-300"><strong>Semana:</strong> {config.semana}</p>
                            <p className="text-slate-300"><strong>Turno:</strong> {config.turno}</p>
                            <p className="text-slate-300"><strong>Participación:</strong> {config.participacion}%</p>
                            <p className="text-slate-300"><strong>Dispersión:</strong> {config.dispersion}</p>
                        </div>
                    )}
                    <p className="text-sm text-slate-500">
                        Por favor, verifica que existan datos cargados para esta configuración.
                    </p>
                </div>
            </div>
        );
    }

    if (type === 'magdalena-no-data') {
        const dispersionText = config?.conDispersion ? 'Con Dispersión' : 'Sin Dispersión';
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center max-w-md p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
                    <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">Datos no disponibles</h3>
                    <p className="text-slate-400 mb-4">
                        {error || 'No se encontraron datos para la configuración seleccionada:'}
                    </p>
                    {config && (
                        <div className="bg-slate-700 rounded p-3 mb-4 text-sm">
                            <p className="text-slate-300"><strong>Año:</strong> {config.anio}</p>
                            <p className="text-slate-300"><strong>Semana:</strong> {config.semana}</p>
                            <p className="text-slate-300"><strong>Participación:</strong> {config.participacion}%</p>
                            <p className="text-slate-300"><strong>Dispersión:</strong> {dispersionText}</p>
                        </div>
                    )}
                    <p className="text-sm text-slate-500">
                        Por favor, verifica que existan datos cargados para esta configuración en el backend.
                    </p>
                </div>
            </div>
        );
    }

    if (type === 'no-patio') {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center text-slate-400">
                    <AlertTriangle size={48} className="mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-200">Patio no encontrado</h3>
                    <p>El patio solicitado no existe o no está disponible</p>
                </div>
            </div>
        );
    }

    return null;
};