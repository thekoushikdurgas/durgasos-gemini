
import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import { BootScreen } from './components/BootScreen';
import { OSInterface } from './components/OSInterface';

const App: React.FC = () => {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // Simulate boot time
    const timer = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (booting) {
    return <BootScreen />;
  }

  return (
    <AppProvider>
      <OSInterface />
    </AppProvider>
  );
};

export default App;
