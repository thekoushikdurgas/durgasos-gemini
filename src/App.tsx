/**
 * @file The root component of the DurgasOS application.
 * It manages the initial boot sequence and provides the global AppContext to the entire OS interface.
 */
import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import { BootScreen } from './components/BootScreen';
import { OSInterface } from './components/OSInterface';

/**
 * The main application component.
 * It handles the boot state, showing a boot screen initially,
 * and then rendering the main OS interface wrapped in the AppProvider.
 * @returns {React.ReactElement} The rendered component.
 */
const App: React.FC = () => {
  const [booting, setBooting] = useState(true);

  // Effect to simulate a boot-up sequence.
  useEffect(() => {
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
