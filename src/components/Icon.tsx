
import React from 'react';
import { AppDefinition } from '../types';
import { useAppContext } from '../hooks/useAppContext';

export const Icon: React.FC<{ app: AppDefinition; type: 'desktop' | 'start-menu' | 'taskbar' }> = ({ app, type }) => {
  const { openApp, windows, focusApp } = useAppContext();
  
  const commonProps = {
    onDoubleClick: type === 'desktop' ? () => openApp(app.id) : undefined,
    onClick: type !== 'desktop' ? () => {
        const win = windows.find(w => w.appId === app.id);
        if(win) focusApp(win.id);
        else openApp(app.id);
    } : undefined,
  };

  if (type === 'desktop') {
    return (
      <div {...commonProps} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-black/20 cursor-pointer text-white text-center w-24">
        <div className="w-10 h-10">{app.icon}</div>
        <p className="text-xs break-words shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{app.name}</p>
      </div>
    );
  }

  if (type === 'start-menu') {
     return (
        <div {...commonProps} className="flex flex-col items-center gap-2 p-3 rounded-md hover:bg-white/10 cursor-pointer text-[var(--text-primary)] w-24 text-center">
            <div className="w-12 h-12 p-2 bg-slate-700/50 rounded-lg flex items-center justify-center">{app.icon}</div>
            <p className="text-xs">{app.name}</p>
        </div>
     );
  }

  // Taskbar icon
  const win = windows.find(w => w.appId === app.id);
  const isActive = win && !win.isMinimized;
  
  return (
    <button {...commonProps} className={`relative h-12 w-12 flex items-center justify-center hover:bg-white/20 rounded transition-colors duration-200 ${isActive ? 'bg-white/10' : ''}`}>
      <div className="w-8 h-8">{app.icon}</div>
      {isActive && <div className="absolute bottom-0 w-6 h-1 bg-[var(--accent-color)] rounded-t-full"></div>}
    </button>
  );
};