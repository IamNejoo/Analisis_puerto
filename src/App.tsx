import React from 'react';
import { TimeAwareDashboard } from './components/dashboard/TimeAwareDashboard';
import { TimeProvider } from './contexts/TimeContext';
import { PortProvider } from './contexts/PortContext';

const App: React.FC = () => {
  return (
    <PortProvider>
      <TimeProvider>
        <TimeAwareDashboard />
      </TimeProvider>
    </PortProvider>
  );
};

export default App;