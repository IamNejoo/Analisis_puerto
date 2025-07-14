// components/camila/shared/ErrorState.tsx

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    error: string;
    onRetry?: () => void;
    fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    error,
    onRetry,
    fullScreen = false
}) => {
    const content = (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error al cargar los datos
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
                {error}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                    <RefreshCw size={16} />
                    <span>Reintentar</span>
                </button>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-8">
            {content}
        </div>
    );
};

export default ErrorState;