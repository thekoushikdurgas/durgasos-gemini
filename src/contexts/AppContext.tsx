
import React, { createContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { WindowInstance, Theme, AccentColor, FileSystemNode } from '../types';
import { defaultWindows, WALLPAPERS, ACCENT_COLORS, initialFileSystem } from '../constants/index';
import { geminiService } from '../services/geminiService';
import { encode, decode, decodeAudioData } from '../utils';
import { LiveServerMessage, Blob } from '@google/genai';

export interface AppContextType {
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
    // Live Assistant State
    isSessionActive: boolean;
    startSession: () => void;
    stopSession: () => void;
    transcripts: { user: string; model: string }[];
    currentInput: string;
    currentOutput: string;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- Window State ---
    const [windows, setWindows] = useState<WindowInstance[]>(defaultWindows);
    const zIndexCounter = useRef(defaultWindows.length + 1);

    // --- Theme State ---
    const [theme, setTheme] = useState<Theme>('dark');
    const [wallpaper, setWallpaper] = useState(WALLPAPERS[0].url);
    const [accentColor, setAccentColor] = useState<AccentColor>(ACCENT_COLORS[0]);

    // --- File System State ---
    const [fileSystem, setFileSystem] = useState<FileSystemNode>(initialFileSystem);
    
    // --- Live Assistant State ---
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [transcripts, setTranscripts] = useState<{ user: string; model: string }[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const [currentOutput, setCurrentOutput] = useState("");
    const sessionPromiseRef = useRef<ReturnType<typeof geminiService.connectLive> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const streamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // --- Window Management ---
    const openApp = useCallback((appId: string, data?: Record<string, any>) => {
        setWindows(prev => {
            const existingWindow = prev.find(w => w.appId === appId && !w.isMinimized);
            if (existingWindow && !(appId === 'fileExplorer' && data?.initialPath)) {
                return prev.map(w => w.id === existingWindow.id ? { ...w, zIndex: zIndexCounter.current++, isMinimized: false } : w);
            }
            const newWindow: WindowInstance = {
                id: `win-${Date.now()}`,
                appId,
                x: 100 + (prev.length % 10) * 20,
                y: 100 + (prev.length % 10) * 20,
                width: 800,
                height: 600,
                isMinimized: false,
                zIndex: zIndexCounter.current++,
                data,
            };
            return [...prev, newWindow];
        });
    }, []);

    const closeApp = useCallback((id: string) => setWindows(prev => prev.filter(win => win.id !== id)), []);
    const minimizeApp = useCallback((id: string) => setWindows(prev => prev.map(win => win.id === id ? { ...win, isMinimized: true } : win)), []);
    const updateWindow = useCallback((id: string, updates: Partial<WindowInstance>) => setWindows(prev => prev.map(win => win.id === id ? { ...win, ...updates } : win)), []);

    const focusApp = useCallback((id: string) => {
        setWindows(prev => {
            const targetWindow = prev.find(w => w.id === id);
            if (targetWindow && targetWindow.zIndex < zIndexCounter.current - 1) {
                return prev.map(win => win.id === id ? { ...win, zIndex: zIndexCounter.current++, isMinimized: false } : win);
            } else if (targetWindow && targetWindow.isMinimized) {
                 return prev.map(win => win.id === id ? { ...win, isMinimized: false } : win);
            }
            return prev;
        });
    }, []);

    const activeWindowId = useMemo(() => {
        const activeWindows = windows.filter(w => !w.isMinimized);
        if (activeWindows.length === 0) return null;
        return activeWindows.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id;
    }, [windows]);

    // --- File System Management ---
    const updateFileSystem = useCallback((path: string, newNode: FileSystemNode) => {
        setFileSystem(currentFS => {
            const newFS = JSON.parse(JSON.stringify(currentFS));
            let currentNode = newFS;
            if (path) {
                const parts = path.split('/');
                for (const part of parts) {
                    const child = currentNode.children?.find((c: FileSystemNode) => c.name === part);
                    if (child?.type === 'FOLDER') {
                        currentNode = child;
                    } else {
                        console.error("Invalid path to update file system:", path);
                        return currentFS;
                    }
                }
            }
            if (!currentNode.children) currentNode.children = [];
            currentNode.children.push(newNode);
            return newFS;
        });
    }, []);

    // --- Live Assistant Logic ---
    const stopSession = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        scriptProcessorRef.current?.disconnect();
        streamSourceRef.current?.disconnect();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        audioContextRef.current?.close();

        setIsSessionActive(false);
        setCurrentInput('');
        setCurrentOutput('');
    }, []);

    const startSession = useCallback(async () => {
        if (isSessionActive) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            let nextStartTime = 0;
            let localCurrentInput = '';
            let localCurrentOutput = '';

            const onmessage = async (message: LiveServerMessage) => {
                if (message.serverContent?.outputTranscription) {
                    const text = message.serverContent.outputTranscription.text;
                    localCurrentOutput += text;
                    setCurrentOutput(localCurrentOutput);
                }
                if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    localCurrentInput += text;
                    setCurrentInput(localCurrentInput);
                }
                if (message.serverContent?.turnComplete) {
                    setTranscripts(prev => [...prev, { user: localCurrentInput, model: localCurrentOutput }]);
                    localCurrentInput = '';
                    localCurrentOutput = '';
                    setCurrentInput('');
                    setCurrentOutput('');
                }
                const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                if (audioData) {
                    nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                    const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputAudioContext.destination);
                    source.start(nextStartTime);
                    nextStartTime += audioBuffer.duration;
                }
            };

            sessionPromiseRef.current = geminiService.connectLive({
                onopen: () => {
                    setIsSessionActive(true);
                    setTranscripts([]);
                    streamSourceRef.current = audioContextRef.current!.createMediaStreamSource(stream);
                    scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current.onaudioprocess = (event) => {
                        const inputData = event.inputBuffer.getChannelData(0);
                        const int16 = new Int16Array(inputData.length);
                        for (let i = 0; i < inputData.length; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    streamSourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                },
                onmessage,
                onerror: (e) => { console.error("Live session error:", e); stopSession(); },
                onclose: () => { stopSession(); },
            });

        } catch (error) {
            console.error("Failed to start session:", error);
        }
    }, [isSessionActive, stopSession]);

    useEffect(() => {
        // Cleanup on unmount
        return () => stopSession();
    }, [stopSession]);


    const appContextValue: AppContextType = {
        windows, openApp, closeApp, minimizeApp, focusApp, updateWindow, activeWindowId,
        theme, setTheme, wallpaper, setWallpaper, accentColor, setAccentColor,
        fileSystem, updateFileSystem,
        isSessionActive, startSession, stopSession, transcripts, currentInput, currentOutput,
    };

    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
};
