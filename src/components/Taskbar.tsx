
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { APPS } from '../apps/index';
import { Icon } from './Icon';

export const Taskbar: React.FC<{ onToggleStartMenu: () => void }> = ({ onToggleStartMenu }) => {
  const { windows } = useAppContext();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000 * 30); // Update every 30s
    return () => clearInterval(timer);
  }, []);

  const openWindowApps = useMemo(() => {
      const appIds = new Set(windows.map(w => w.appId));
      return APPS.filter(app => appIds.has(app.id));
  }, [windows]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/30 backdrop-blur-xl flex justify-between items-center z-50 px-4">
      <div/>
      <div className="flex items-center gap-2">
        <button onClick={onToggleStartMenu} className="h-10 w-10 flex items-center justify-center hover:bg-white/20 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 48 48" className="w-6 h-6"><path d="M6 38h14V24H6v14zm0-16h14V8H6v14zm16 16h14V24H22v14zm0-16h14V8H22v14z"/></svg>
        </button>
        {openWindowApps.map(app => (
            <Icon key={app.id} app={app} type="taskbar" />
        ))}
      </div>
      <div className="text-white text-xs text-center">
        <div>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div>{time.toLocaleDateString()}</div>
      </div>
    </div>
  );
};
