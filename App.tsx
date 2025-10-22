
import React, { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import { GoogleGenAI, Chat, Modality, Type, GenerateContentResponse, FunctionDeclaration, LiveServerMessage, Blob } from "@google/genai";
import { APPS, defaultWindows, WALLPAPERS, ACCENT_COLORS, initialFileSystem } from './constants';
import type { AppDefinition, WindowInstance, Message, GroundingChunk, AspectRatio, Theme, AccentColor, FileSystemNode } from './types';
import { geminiService } from './services';
import { fileToBase64, decode, decodeAudioData, encode } from './utils';


// --- CONTEXT ---
interface AppContextType {
    windows: WindowInstance[];
    openApp: (appId: string, data?: Record<string, any>) => void;
    closeApp: (id: string) => void;
    minimizeApp: (id: string) => void;
    focusApp: (id: string) => void;
    updateWindow: (id: string, updates: Partial<WindowInstance>) => void;
    activeWindowId: string | null;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    wallpaper: string;
    setWallpaper: (wallpaperUrl: string) => void;
    accentColor: AccentColor;
    setAccentColor: (color: AccentColor) => void;
    fileSystem: FileSystemNode;
    updateFileSystem: (path: string, newNode: FileSystemNode) => void;
}
export const AppContext = createContext<AppContextType | null>(null);
const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext must be used within an AppProvider");
    return context;
};

// --- HELPER & UI COMPONENTS ---

const Icon: React.FC<{ app: AppDefinition; type: 'desktop' | 'start-menu' | 'taskbar' }> = ({ app, type }) => {
  const { openApp } = useAppContext();
  const commonProps = {
    onDoubleClick: type === 'desktop' ? () => openApp(app.id) : undefined,
    onClick: type !== 'desktop' ? () => openApp(app.id) : undefined,
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
        <div {...commonProps} className="flex flex-col items-center gap-2 p-3 rounded-md hover:bg-white/10 cursor-pointer text-[var(--text-primary)] w-24">
            <div className="w-12 h-12 p-2 bg-slate-700/50 rounded-lg">{app.icon}</div>
            <p className="text-xs">{app.name}</p>
        </div>
     );
  }
  return (
    <button {...commonProps} className="h-12 w-12 flex items-center justify-center hover:bg-white/20 rounded">
      <div className="w-8 h-8">{app.icon}</div>
    </button>
  );
};

const Window: React.FC<{ win: WindowInstance }> = ({ win }) => {
  const { closeApp, minimizeApp, focusApp, updateWindow, activeWindowId } = useAppContext();
  const isActive = win.id === activeWindowId;
  const headerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef<{ active: boolean; type: string | null }>({ active: false, type: null });
  const draggingRef = useRef<boolean>(false);
  const initialPosRef = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 });

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    focusApp(win.id);
    if (!headerRef.current || !windowRef.current) return;
    if (e.target !== headerRef.current && !(headerRef.current as any).contains(e.target)) return;
    
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
    initialPosRef.current = { x: left, y: top, mouseX: e.clientX, mouseY: e.clientY, ...{width, height} };
  }, [win.id, focusApp]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingRef.current) {
        const dx = e.clientX - initialPosRef.current.mouseX;
        const dy = e.clientY - initialPosRef.current.mouseY;
        updateWindow(win.id, { x: initialPosRef.current.x + dx, y: initialPosRef.current.y + dy });
      } else if (resizingRef.current.active && windowRef.current) {
         const { type } = resizingRef.current;
         const { x, y, width, height, mouseX, mouseY } = initialPosRef.current as any;
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
      className={`absolute bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-lg shadow-2xl flex flex-col transition-all duration-100 ${isActive ? 'shadow-blue-500/50' : ''}`}
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
        <div key={handle.type} className={`absolute ${handle.className}`} onMouseDown={(e) => handleResizeStart(e, handle.type)} />
      ))}
      <div
        ref={headerRef}
        className="flex items-center justify-between h-8 bg-[var(--bg-tertiary)] rounded-t-lg px-2 text-[var(--text-primary)] select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4">{app.icon}</div>
          <span className="text-xs">{app.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => minimizeApp(win.id)} className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center">_</button>
          <button className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center">□</button>
          <button onClick={() => closeApp(win.id)} className="w-6 h-6 rounded hover:bg-red-500 flex items-center justify-center">✕</button>
        </div>
      </div>
      <div className="flex-grow p-1 overflow-auto bg-[var(--bg-secondary)] rounded-b-lg">
        <app.component {...win.data} />
      </div>
    </div>
  );
};

const Taskbar: React.FC<{ onToggleStartMenu: () => void }> = ({ onToggleStartMenu }) => {
  const { windows, focusApp } = useAppContext();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/30 backdrop-blur-xl flex justify-center items-center z-50">
      <div className="flex items-center gap-2">
        <button onClick={onToggleStartMenu} className="h-10 w-10 flex items-center justify-center hover:bg-white/20 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 48 48" className="w-6 h-6"><path d="M6 38h14V24H6v14zm0-16h14V8H6v14zm16 16h14V24H22v14zm0-16h14V8H22v14z"/></svg>
        </button>
        {windows.filter(w => !w.isMinimized).map(win => {
            const app = APPS.find(a => a.id === win.appId);
            return app ? <Icon key={win.id} app={app} type="taskbar" /> : null;
        })}
      </div>
      <div className="absolute right-4 text-white text-xs text-center">
        <div>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div>{time.toLocaleDateString()}</div>
      </div>
    </div>
  );
};

const StartMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { openApp, fileSystem } = useAppContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{apps: AppDefinition[], files: FileSystemNode[]}>({apps: [], files: []});

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults({ apps: [], files: [] });
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();

        // Search Apps
        const filteredApps = APPS.filter(app => app.name.toLowerCase().includes(lowerQuery));

        // Search Files
        const foundFiles: FileSystemNode[] = [];
        const searchFS = (node: FileSystemNode, path: string) => {
            if (node.name.toLowerCase().includes(lowerQuery)) {
                foundFiles.push({ ...node, content: path }); // Using content to store path
            }
            if (node.children) {
                node.children.forEach(child => searchFS(child, `${path}/${child.name}`));
            }
        };
        searchFS(fileSystem, 'C:');
        
        setSearchResults({ apps: filteredApps, files: foundFiles });

    }, [searchQuery, fileSystem]);

    return (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[600px] h-auto max-h-[700px] bg-black/40 backdrop-blur-2xl rounded-lg p-6 flex flex-col gap-6 text-white z-40" onClick={(e) => e.stopPropagation()}>
            <input 
                type="text" 
                placeholder="Type here to search" 
                className="w-full bg-slate-700/80 p-2 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery.trim() ? (
                <div className="overflow-y-auto">
                    {searchResults.apps.length > 0 && <h2 className="text-lg font-semibold mb-2 text-gray-300">Apps</h2>}
                    {searchResults.apps.map(app => (
                        <div key={app.id} onClick={() => { openApp(app.id); onClose(); }} className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 cursor-pointer">
                           <div className="w-8 h-8">{app.icon}</div> <span>{app.name}</span>
                        </div>
                    ))}
                    {searchResults.files.length > 0 && <h2 className="text-lg font-semibold my-2 text-gray-300">Files & Folders</h2>}
                     {searchResults.files.map(file => (
                        <div key={file.id} onClick={() => { openApp('fileExplorer', { initialPath: file.content }); onClose(); }} className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 cursor-pointer">
                           <div className="w-8 h-8">{file.type === 'FOLDER' ? '📁' : '📄'}</div> <span>{file.name}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Pinned</h2>
                        <div className="grid grid-cols-6 gap-4">
                            {APPS.slice(0, 12).map(app => <Icon key={app.id} app={app} type="start-menu" />)}
                        </div>
                    </div>
                     <div>
                        <h2 className="text-lg font-semibold mb-4">Recommended</h2>
                        <div className="bg-slate-700/50 p-4 rounded-md h-48">
                            <p className="text-sm text-slate-300">Your recent files and apps will show up here.</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};


const Desktop: React.FC<{ onBackdropClick: () => void }> = ({ onBackdropClick }) => {
  const { wallpaper } = useAppContext();
  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${wallpaper}')` }} onClick={onBackdropClick}>
      <div className="p-4 flex flex-col flex-wrap h-full content-start gap-4">
        {APPS.filter(app => app.id !== 'notepad').map(app => (
          <Icon key={app.id} app={app} type="desktop" />
        ))}
      </div>
    </div>
  );
};

const BootScreen: React.FC = () => (
    <div className="bg-black h-screen w-screen flex flex-col justify-center items-center gap-4 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 48 48" className="w-24 h-24"><path d="M6 38h14V24H6v14zm0-16h14V8H6v14zm16 16h14V24H22v14zm0-16h14V8H22v14z"/></svg>
        <p className="text-xl">Starting DurgasOS</p>
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
    </div>
);


// --- MAIN APP ---

const App: React.FC = () => {
  const [booting, setBooting] = useState(true);
  const [windows, setWindows] = useState<WindowInstance[]>(defaultWindows);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const zIndexCounter = useRef(defaultWindows.length + 1);
  const [theme, setTheme] = useState<Theme>('dark');
  const [wallpaper, setWallpaper] = useState(WALLPAPERS[0].url);
  const [accentColor, setAccentColor] = useState<AccentColor>(ACCENT_COLORS[0]);
  const [fileSystem, setFileSystem] = useState<FileSystemNode>(initialFileSystem);

  useEffect(() => {
    setTimeout(() => setBooting(false), 2500);
  }, []);

  const openApp = useCallback((appId: string, data?: Record<string, any>) => {
    setWindows(prev => {
      // Don't open a new window if one is already open and not minimized (except for file explorer with specific path)
      const existingWindow = prev.find(w => w.appId === appId && !w.isMinimized);
      if (existingWindow && !(appId === 'fileExplorer' && data?.initialPath)) {
        return prev.map(w => w.id === existingWindow.id ? { ...w, zIndex: zIndexCounter.current++ } : w);
      }
      const newWindow: WindowInstance = {
        id: `win-${Date.now()}`,
        appId,
        x: 100 + prev.length * 20,
        y: 100 + prev.length * 20,
        width: 800,
        height: 600,
        isMinimized: false,
        zIndex: zIndexCounter.current++,
        data,
      };
      return [...prev, newWindow];
    });
    setStartMenuOpen(false);
  }, []);

  const closeApp = useCallback((id: string) => {
    setWindows(prev => prev.filter(win => win.id !== id));
  }, []);

  const minimizeApp = useCallback((id: string) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, isMinimized: true } : win));
  }, []);

  const focusApp = useCallback((id: string) => {
    setWindows(prev => {
      const targetWindow = prev.find(w => w.id === id);
      if (targetWindow && targetWindow.zIndex !== zIndexCounter.current - 1) {
        return prev.map(win => win.id === id ? { ...win, zIndex: zIndexCounter.current++, isMinimized: false } : win);
      }
      return prev;
    });
  }, []);

  const updateWindow = useCallback((id: string, updates: Partial<WindowInstance>) => {
    setWindows(prev => prev.map(win => win.id === id ? { ...win, ...updates } : win));
  }, []);

  const updateFileSystem = useCallback((path: string, newNode: FileSystemNode) => {
     setFileSystem(currentFS => {
        const newFS = JSON.parse(JSON.stringify(currentFS)); // Deep clone
        const parts = path.split('/').filter(p => p);
        let currentNode = newFS;
        for (const part of parts) {
            const child = currentNode.children?.find(c => c.name === part);
            if (child && child.type === 'FOLDER') {
                currentNode = child;
            } else {
                console.error("Invalid path to update file system");
                return currentFS; // Return original on error
            }
        }
        if (!currentNode.children) currentNode.children = [];
        currentNode.children.push(newNode);
        return newFS;
     });
  }, []);
  
  const activeWindowId = useMemo(() => {
    const activeWindows = windows.filter(w => !w.isMinimized);
    if (activeWindows.length === 0) return null;
    return activeWindows.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id;
  }, [windows]);

  const appContextValue: AppContextType = {
    windows, openApp, closeApp, minimizeApp, focusApp, updateWindow, activeWindowId,
    theme, setTheme, wallpaper, setWallpaper, accentColor, setAccentColor,
    fileSystem, updateFileSystem
  };

  if (booting) return <BootScreen />;

  return (
    <AppContext.Provider value={appContextValue}>
      <div 
        className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] font-sans"
        data-theme={theme}
        style={{ '--accent-color': accentColor.hex } as React.CSSProperties}
      >
        <Desktop onBackdropClick={() => setStartMenuOpen(false)} />
        {windows.map(win => <Window key={win.id} win={win} />)}
        <Taskbar onToggleStartMenu={() => setStartMenuOpen(v => !v)} />
        {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}
      </div>
    </AppContext.Provider>
  );
};

export default App;
