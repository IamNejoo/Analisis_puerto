import React from 'react';

export interface TabsProps {
    tabs: Array<{
        id: string;
        label: string;
        icon?: React.ReactNode;
    }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    className = ''
}) => {
    return (
        <div className={`border-b border-slate-700 ${className}`}>
            <nav className="flex space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${activeTab === tab.id
                                ? 'border-cyan-500 text-cyan-400'
                                : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
                            }`}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};