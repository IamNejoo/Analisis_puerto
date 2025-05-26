import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FilterToggleProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
}

export const FilterToggle: React.FC<FilterToggleProps> = ({ label, isActive, onToggle }) => {
  return (
    <div className="flex items-center text-sm">
      <button
        className={`flex items-center py-1 px-2 rounded ${isActive ? 'text-blue-300' : 'text-gray-400'} transition-colors hover:bg-gray-700`}
        onClick={onToggle}
      >
        {isActive ? <Eye size={16} className="mr-2" /> : <EyeOff size={16} className="mr-2" />}
        {label}
      </button>
    </div>
  );
};