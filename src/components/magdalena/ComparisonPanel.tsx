import React, { useState } from 'react';
import { Tabs } from '../shared/Tabs';
import SegregationHeatmap from './SegregationHeatmap';
import WorkloadChart from './WorkloadChart';
import RealComparisonPanel from './RealComparisonPanel';
import {
    BarChart3,
    Activity,
    GitCompare,
    Layers
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
            id: 'segregations',
            label: 'Heatmap Segregaciones',
            icon: <Layers size={16} />
        },
        {
            id: 'workload',
            label: 'Análisis Workload',
            icon: <Activity size={16} />
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'comparison':
                return <RealComparisonPanel />;
            case 'segregations':
                return <SegregationHeatmap />;
            case 'workload':
                return <WorkloadChart />;
            default:
                return <RealComparisonPanel />;
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