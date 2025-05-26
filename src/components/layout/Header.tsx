import React from 'react';
import { Clock, Calendar, User, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-blue-900 text-white py-2 px-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <img src="/api/placeholder/48/48" alt="DP World Logo" className="mr-4" />
          <h1 className="text-xl font-bold">Terminal Operation System</h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Clock size={20} />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={20} />
            <span>{new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </div>
          <div className="border-l pl-6 flex items-center space-x-2">
            <User size={20} />
            <span>Juan Martínez</span>
            <span className="bg-blue-700 text-xs px-2 py-0.5 rounded-full">Operador</span>
          </div>
          <Settings size={20} className="cursor-pointer hover:text-blue-200 transition-colors" />
        </div>
      </div>
    </header>
  );
};