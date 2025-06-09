import React, { useState } from 'react';
import { Tabs } from '../shared/Tabs';
import CamilaComparisonPanel from './CamilaComparisonPanel';
import HeatmapGruasPanel from './HeatmapGruasPanel';
import CuotasRecomendadasPanel from './CuotasRecomendadasPanel';
import {
    GitCompare,
    Activity,
    Truck,
    BarChart3
} from 'lucide-react';

export const ComparisonPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState('comparison');

    const tabs = [
        {
            id: 'comparison',
            label: 'Comparación Real vs Optimizado',
            icon: <GitCompare size={16} />
        },
        {
            id: 'heatmap',
            label: 'Asignación de Grúas',
            icon: <Activity size={16} />
        },
        {
            id: 'cuotas',
            label: 'Cuotas Recomendadas',
            icon: <Truck size={16} />
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'comparison':
                return <CamilaComparisonPanel />;
            case 'heatmap':
                return <HeatmapGruasPanel />;
            case 'cuotas':
                return <CuotasRecomendadasPanel />;
            default:
                return <CamilaComparisonPanel />;
        }
    };

    return (
        <div className="space-y-4">
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="min-h-0">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default ComparisonPanel;