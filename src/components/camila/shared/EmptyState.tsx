// components/camila/shared/EmptyState.tsx

import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    message?: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    message = 'No hay datos disponibles',
    icon,
    action
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex flex-col items-center justify-center text-center">
                <div className="text-gray-400 mb-4">
                    {icon || <Inbox size={48} />}
                </div>
                <p className="text-gray-600 mb-6">
                    {message}
                </p>
                {action && (
                    <button
                        onClick={action.onClick}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmptyState;