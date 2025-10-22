
import React, { useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { WindowInstance } from '../types';
import { APPS } from '../apps/index';

export const Window: React.FC<{ win: WindowInstance }> = ({ win }) => {
  const { closeApp, minimizeApp, focusApp, updateWindow, activeWindowId } = useAppContext();
  const isActive = win.id === activeWindowId;
  const headerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef<{ active: boolean; type: string | null }>({ active: false, type: null });
  const draggingRef = useRef<boolean>(false);
  const initialPosRef = useRef<any>({ x: 0, y: 0, mouseX: 0, mouseY: 0 });

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    focusApp(win.id);
    if (!headerRef.current || !windowRef.current || (e.target instanceof HTMLElement && e.target.closest('button'))) return;
    
    draggingRef.current = true;
    const { left, top } = windowRef.current.getBoundingClientRect();
    initialPosRef.current = { x: left, y: top, mouseX: e.clientX, mouseY: e.clientY };
  }, [win.id, focusApp]);

  const handleResizeStart = useCallback((e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    focusApp(win.id);
    if (!windowRef.current) return;
    
    resizingRef.current = { active: true, type };
    const { left, top, width, height } = windowRef.current.getBoundingClientRect();
    initialPosRef.current = { x: left, y: top, mouseX: e.clientX, mouseY: e.clientY, width, height };
  }, [win.id, focusApp]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingRef.current) {
        const dx = e.clientX - initialPosRef.current.mouseX;
        const dy = e.clientY - initialPosRef.current.mouseY;
        updateWindow(win.id, { x: initialPosRef.current.x + dx, y: initialPosRef.current.y + dy });
      } else if (resizingRef.current.active && windowRef.current) {
         const { type } = resizingRef.current;
         const { x, y, width, height, mouseX, mouseY } = initialPosRef.current;
         let newX = x, newY = y, newWidth = width, newHeight = height;

         if (type?.includes('right')) newWidth = width + e.clientX - mouseX;
         if (type?.includes('bottom')) newHeight = height + e.clientY - mouseY;
         if (type?.includes('left')) {
            newWidth = width - (e.clientX - mouseX);
            newX = x + (e.clientX - mouseX);
         }
         if (type?.includes('top')) {
            newHeight = height - (e.clientY - mouseY);
            newY = y + (e.clientY - mouseY);
         }
         updateWindow(win.id, { x: newX, y: newY, width: Math.max(300, newWidth), height: Math.max(200, newHeight) });
      }
    };
    const handleMouseUp = () => {
      draggingRef.current = false;
      resizingRef.current = { active: false, type: null };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [win.id, updateWindow]);

  const app = APPS.find(a => a.id === win.appId);
  if (!app) return null;

  const resizeHandles = [
    { type: 'top', className: 'h-1 top-0 left-0 right-0 cursor-n-resize' },
    { type: 'bottom', className: 'h-1 bottom-0 left-0 right-0 cursor-s-resize' },
    { type: 'left', className: 'w-1 top-0 bottom-0 left-0 cursor-w-resize' },
    { type: 'right', className: 'w-1 top-0 bottom-0 right-0 cursor-e-resize' },
    { type: 'top-left', className: 'w-2 h-2 top-0 left-0 cursor-nw-resize' },
    { type: 'top-right', className: 'w-2 h-2 top-0 right-0 cursor-ne-resize' },
    { type: 'bottom-left', className: 'w-2 h-2 bottom-0 left-0 cursor-sw-resize' },
    { type: 'bottom-right', className: 'w-2 h-2 bottom-0 right-0 cursor-se-resize' },
  ];

  if (win.isMinimized) return null;

  return (
    <div
      ref={windowRef}
      className={`absolute bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-lg shadow-2xl flex flex-col transition-opacity duration-100 ${isActive ? 'shadow-[var(--accent-color)]/50' : ''}`}
      style={{
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex,
        display: win.isMinimized ? 'none' : 'flex'
      }}
      onMouseDown={() => focusApp(win.id)}
    >
      {resizeHandles.map(handle => (
        <div key={handle.type} className={`absolute ${handle.className} z-10`} onMouseDown={(e) => handleResizeStart(e, handle.type)} />
      ))}
      <div
        ref={headerRef}
        className="flex items-center justify-between h-8 bg-[var(--bg-tertiary)] rounded-t-lg px-2 text-[var(--text-primary)] select-none cursor-move flex-shrink-0"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-4 h-4">{app.icon}</div>
          <span className="text-xs">{app.name}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => minimizeApp(win.id)} className="w-8 h-6 rounded hover:bg-white/10 flex items-center justify-center">_</button>
          <button className="w-8 h-6 rounded hover:bg-white/10 flex items-center justify-center">□</button>
          <button onClick={() => closeApp(win.id)} className="w-8 h-6 rounded hover:bg-red-500 flex items-center justify-center">✕</button>
        </div>
      </div>
      <div className="flex-grow p-1 overflow-auto bg-[var(--bg-secondary)] rounded-b-lg">
        {React.createElement(app.component, win.data)}
      </div>
    </div>
  );
};
