// src/components/shared/FilterToggle.tsx - COMPONENTE SIMPLE
import React from 'react';

interface FilterToggleProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
}

export const FilterToggle: React.FC<FilterToggleProps> = ({
  label,
  isActive,
  onToggle
}) => {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={isActive}
          onChange={onToggle}
          className="sr-only"
        />
        <div
          className={`w-8 h-4 rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-300'
            }`}
        >
          <div
            className={`w-3 h-3 bg-white rounded-full transform transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0.5'
              } translate-y-0.5`}
          />
        </div>
      </div>
    </label>
  );
};