import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AlertData } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';

interface AlertsPanelProps {
  alertasData: AlertData[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alertasData }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-gray-800">Alertas Operativas</h3>
        <span className="bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
          {alertasData.length} activas
        </span>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {alertasData.map((alerta) => (
          <div 
            key={alerta.id} 
            className={`p-2 rounded-md border-l-4 ${
              alerta.tipo === 'Alta' ? 'border-red-500 bg-red-50' : 
              alerta.tipo === 'Media' ? 'border-yellow-500 bg-yellow-50' : 
              'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex items-start">
              <AlertTriangle 
                size={18} 
                className={`flex-shrink-0 mr-2 ${
                  alerta.tipo === 'Alta' ? 'text-red-500' : 
                  alerta.tipo === 'Media' ? 'text-yellow-500' : 
                  'text-blue-500'
                }`} 
              />
              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-semibold">{alerta.titulo}</h4>
                  <span className="ml-2 text-xs text-gray-500">{alerta.tiempo}</span>
                </div>
                <p className="text-xs text-gray-600">{alerta.mensaje}</p>
                <div className="flex items-center mt-1">
                  <StatusBadge status={alerta.area} type="area" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-center">
        <button className="text-blue-600 text-sm hover:underline font-medium transition-colors hover:text-blue-800">
          Ver todas las alertas
        </button>
      </div>
    </div>
  );
};