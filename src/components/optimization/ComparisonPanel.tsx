// src/components/optimization/ComparisonPanel.tsx
import React, { useState } from 'react';
import { Tabs } from '../shared/Tabs';
import SegregationHeatmap from './SegregationHeatmap';
import WorkloadChart from './WorkloadChart';
import RealComparisonPanel from './RealComparisonPanel';
import TemporalAnalysis from './TemporalAnalysis'; // Nuevo componente
import {
    BarChart3,
    Activity,
    GitCompare,
    Layers,
    Calendar
} from 'lucide-react';

export const ComparisonPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState('comparison');

    const tabs = [
        {
            id: 'comparison',
            label: 'Comparación Real vs Optimizado',
            icon: <GitCompare size={16} className="text-cyan-400" />
        },
        {
            id: 'segregations',
            label: 'Heatmap Segregaciones',
            icon: <Layers size={16} className="text-cyan-400" />
        },
        {
            id: 'workload',
            label: 'Análisis Workload',
            icon: <Activity size={16} className="text-cyan-400" />
        },
        {
            id: 'temporal',
            label: 'Análisis Temporal',
            icon: <Calendar size={16} className="text-cyan-400" />
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
            case 'temporal':
                return <TemporalAnalysis />;
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