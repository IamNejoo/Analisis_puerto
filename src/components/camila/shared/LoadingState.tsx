// components/camila/shared/LoadingState.tsx

import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
    fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Cargando...',
    fullScreen = false
}) => {
    const content = (
        <div className="flex flex-col items-center justify-center p-8">
            <Loader className="animate-spin text-teal-600 mb-4" size={32} />
            <p className="text-gray-600">{message}</p>
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

export default LoadingState;