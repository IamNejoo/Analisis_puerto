// src/components/layout/MainLayout.tsx - CORREGIDO PARA PERMITIR SCROLL
import React from 'react';
import { Header } from './_Header';
import { Sidebar } from './_Sidebar';
import type { Filters } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  isMenuCollapsed: boolean;
  toggleMenu: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: Filters;
  toggleFilter: (filter: string) => void;
  currentOcupacion: number;
  currentProductividad: { bmph: number; gmph: number };
  currentTiempoCamion: number;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  isMenuCollapsed,
  toggleMenu,
  activeTab,
  setActiveTab,
  filters,
  toggleFilter,
  currentOcupacion,
  currentProductividad,
  currentTiempoCamion
}) => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header fijo */}
      <Header />

      {/* Contenido principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isMenuCollapsed={isMenuCollapsed}
          toggleMenu={toggleMenu}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filters={filters}
          toggleFilter={toggleFilter}
          currentOcupacion={currentOcupacion}
          currentProductividad={currentProductividad}
          currentTiempoCamion={currentTiempoCamion}
        />

        {/* Panel principal - PERMITIR OVERFLOW */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};