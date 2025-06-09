// src/App.tsx - AGREGAR EL PROVIDER
import React from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { PortProvider } from './contexts/PortContext';
import { ExtendedTimeProvider } from './contexts/TimeContext';
import { ViewNavigationProvider } from './contexts/ViewNavigationContext'; // 🆕

const PORT_DATA_PATH = '/data/Prueba.csv';

const BLOCK_CAPACITIES = {
  'C1': 49, 'C2': 49, 'C3': 49, 'C4': 49, 'C5': 49,
  'C6': 49, 'C7': 49, 'C8': 49, 'C9': 49,
  'H1': 36, 'H2': 36, 'H3': 36, 'H4': 36, 'H5': 40,
  'T1': 24, 'T2': 24, 'T3': 24, 'T4': 24,
  'I1': 16, 'I2': 16, 'E1': 20, 'E2': 20
};

const App: React.FC = () => {
  return (
    <PortProvider>
      <ExtendedTimeProvider>
        <ViewNavigationProvider> {/* 🆕 AGREGAR AQUÍ */}
          <div>
            <Dashboard
              portDataPath={PORT_DATA_PATH}
              blockCapacities={BLOCK_CAPACITIES}
            />
          </div>
        </ViewNavigationProvider>
      </ExtendedTimeProvider>
    </PortProvider>
  );
};

export default App;