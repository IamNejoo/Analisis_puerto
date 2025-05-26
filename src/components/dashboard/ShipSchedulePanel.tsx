import React from 'react';
import type { ShipData } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';

interface ShipSchedulePanelProps {
  navesData: ShipData[];
}

export const ShipSchedulePanel: React.FC<ShipSchedulePanelProps> = ({ navesData }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-bold text-lg text-gray-800 mb-3">Próximas Naves</h3>
      <div className="max-h-60 overflow-y-auto space-y-2">
        {navesData.map((nave) => (
          <div key={nave.id} className="border rounded-md p-2 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-sm">{nave.nombre}</h4>
                <p className="text-xs text-gray-500">{nave.servicio} | {nave.sitio}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={nave.estado} type="estado" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <div className="flex space-x-4">
                <div>
                  <span>ETA: {nave.eta}</span>
                </div>
                <div>
                  <span>ETD: {nave.etd}</span>
                </div>
              </div>
              <div>
                <span className="font-medium">{nave.movs} mov.</span>
              </div>
            </div>
            {nave.estado === 'En operación' && (
              <div className="mt-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progreso</span>
                  <span>{nave.completado}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-green-600" 
                    style={{ width: `${nave.completado}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 text-center">
        <button className="text-blue-600 text-sm hover:underline font-medium transition-colors hover:text-blue-800">
          Ver todas las naves
        </button>
      </div>
    </div>
  );
};