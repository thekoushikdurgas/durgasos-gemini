/**
 * @file This is the core of the application's state management.
 * It provides all global state and actions to the entire component tree,
 * including window management, theming, file system operations, and assistant logic.
 */

import React, { createContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { WindowInstance, Theme, AccentColor, FileSystemNode, AssistantState } from '../types';
import { defaultWindows, WALLPAPERS, ACCENT_COLORS, initialFileSystem } from '../constants/index';
import { geminiService } from '../services/geminiService';
import { encode, decode, decodeAudioData } from '../utils';
import { LiveServerMessage, Blob, GenerateContentResponse } from '@google/genai';
import { assistantTools } from '../services/assistantTools';
import { APPS } from '../apps';

/**
 * Defines the shape of the global context provided by AppProvider.
 */
export interface AppContextType {
    // Window Management
    windows: WindowInstance[];
    openApp: (appId: string, data?: Record<string, any>) => void;
    closeApp: (id: string) => void;
    minimizeApp: (id: string) => void;
    focusApp: (id: string) => void;
    updateWindow: (id: string, updates: Partial<WindowInstance>) => void;
    activeWindowId: string | null;
    // Theme & Appearance
    theme: Theme;
    setTheme: (theme: Theme) => void;
    wallpaper: string;
    setWallpaper: (wallpaperUrl: string) => void;
    accentColor: AccentColor;
    setAccentColor: (color: AccentColor) => void;
    // File System
    fileSystem: FileSystemNode;
    updateFileSystem: (path: string, newNode: FileSystemNode) => boolean;
    renameFileSystemNode: (path: string, oldName: string, newName: string) => void;
    deleteFileSystemNode: (path: string, name: string) => void;
    // Live Assistant (Real-time Conversation)
    isSessionActive: boolean;
    startSession: () => void;
    stopSession: () => void;
    transcripts: { user: string; model: string }[];
    currentInput: string;
    currentOutput: string;
    // Durgas Assistant (Voice Commands & Function Calling)
    assistantState: AssistantState;
    assistantTranscript: string;
    activateAssistant: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

// Attempt to get the browser's speech recognition object.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

/**
 * The main provider component that encapsulates all global state logic.
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // =============================================================================================
    // SECTION: Window Management State & Logic
    // =============================================================================================
    const [windows, setWindows] = useState<WindowInstance[]>(defaultWindows);
    const zIndexCounter = useRef(defaultWindows.length + 1);

    /** Opens a new application window or focuses an existing one. */
    const openApp = useCallback((appId: string, data?: Record<string, any>) => {
        console.debug(`[AppContext] Opening app: ${appId}`, data);
        setWindows(prev => {
            const app = APPS.find(a => a.id === appId);
            if (!app) {
                console.error(`[AppContext] App with ID "${appId}" not found.`);
                return prev;
            }

            const existingWindow = prev.find(w => w.appId === appId && !w.isMinimized);
            if (existingWindow && !(appId === 'fileExplorer' && data?.initialPath)) {
                // If window exists, bring it to front
                return prev.map(w => w.id === existingWindow.id ? { ...w, zIndex: zIndexCounter.current++, isMinimized: false } : w);
            }
            // Create a new window instance
            const newWindow: WindowInstance = {
                id: `win-${Date.now()}`,
                appId,
                x: 100 + (prev.length % 10) * 20,
                y: 100 + (prev.length % 10) * 20,
                width: 800,
                height: 600,
                isMinimized: false,
                zIndex: zIndexCounter.current++,
                data: { ...data, title: data?.title || app.name },
            };
            return [...prev, newWindow];
        });
    }, []);

    const closeApp = useCallback((id: string) => setWindows(prev => prev.filter(win => win.id !== id)), []);
    const minimizeApp = useCallback((id: string) => setWindows(prev => prev.map(win => win.id === id ? { ...win, isMinimized: true } : win)), []);
    const updateWindow = useCallback((id: string, updates: Partial<WindowInstance>) => setWindows(prev => prev.map(win => win.id === id ? { ...win, ...updates } : win)), []);

    /** Brings a window to the foreground and un-minimizes it. */
    const focusApp = useCallback((id: string) => {
        setWindows(prev => {
            const targetWindow = prev.find(w => w.id === id);
            // Only update z-index if it's not already the top window
            if (targetWindow && targetWindow.zIndex < zIndexCounter.current - 1) {
                return prev.map(win => win.id === id ? { ...win, zIndex: zIndexCounter.current++, isMinimized: false } : win);
            } else if (targetWindow && targetWindow.isMinimized) {
                return prev.map(win => win.id === id ? { ...win, zIndex: zIndexCounter.current++, isMinimized: false } : win);
            }
            return prev;
        });
    }, []);

    /** Memoized calculation to find the currently active window ID. */
    const activeWindowId = useMemo(() => {
        const activeWindows = windows.filter(w => !w.isMinimized);
        if (activeWindows.length === 0) return null;
        return activeWindows.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id;
    }, [windows]);

    // =============================================================================================
    // SECTION: Theme & Appearance State
    // =============================================================================================
    const [theme, setTheme] = useState<Theme>('dark');
    const [wallpaper, setWallpaper] = useState(WALLPAPERS[0].url);
    const [accentColor, setAccentColor] = useState<AccentColor>(ACCENT_COLORS[0]);

    // =============================================================================================
    // SECTION: File System State & Logic
    // =============================================================================================
    const [fileSystem, setFileSystem] = useState<FileSystemNode>(initialFileSystem);
    
    /** Adds a new node (file/folder) to the file system at a given path. */
    const updateFileSystem = useCallback((path: string, newNode: FileSystemNode): boolean => {
        let success = false;
        setFileSystem(currentFS => {
            const newFS = JSON.parse(JSON.stringify(currentFS)); // Deep clone
            let currentNode: FileSystemNode = newFS;
            if (path) {
                // Traverse to the target directory
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
            // Check for name collision
            if(currentNode.children.some((c: FileSystemNode) => c.name.toLowerCase() === newNode.name.toLowerCase())) {
                console.warn(`[AppContext] File/folder named "${newNode.name}" already exists at path "${path}".`);
                return currentFS;
            }
            currentNode.children.push(newNode);
            success = true;
            return newFS;
        });
        return success;
    }, []);
    
    /** Renames a node in the file system. */
    const renameFileSystemNode = useCallback((path: string, oldName: string, newName: string) => {
        if (!newName.trim() || newName.includes('/') || newName.includes('\\')) {
            alert("Invalid file/folder name.");
            return;
        }
        setFileSystem(currentFS => {
            const newFS = JSON.parse(JSON.stringify(currentFS));
            let parentNode: FileSystemNode = newFS;
            if (path) {
                for (const part of path.split('/')) {
                    const child = parentNode.children?.find((c: FileSystemNode) => c.name === part);
                    if (child) parentNode = child;
                    else return currentFS; // Path not found
                }
            }
            if (parentNode.children) {
                if(parentNode.children.some((c: FileSystemNode) => c.name.toLowerCase() === newName.toLowerCase() && c.name.toLowerCase() !== oldName.toLowerCase())) {
                    alert(`A file or folder named "${newName}" already exists here.`);
                    return currentFS;
                }
                const nodeToRename = parentNode.children.find((c: FileSystemNode) => c.name === oldName);
                if (nodeToRename) nodeToRename.name = newName;
            }
            return newFS;
        });
    }, []);
    
    /** Deletes a node from the file system. */
    const deleteFileSystemNode = useCallback((path: string, name: string) => {
        setFileSystem(currentFS => {
            const newFS = JSON.parse(JSON.stringify(currentFS));
            let parentNode: FileSystemNode = newFS;
            if (path) {
                for (const part of path.split('/')) {
                    const child = parentNode.children?.find((c: FileSystemNode) => c.name === part);
                    if (child) parentNode = child;
                    else return currentFS; // path not found
                }
            }
            if (parentNode.children) {
                parentNode.children = parentNode.children.filter((c: FileSystemNode) => c.name !== name);
            }
            return newFS;
        });
    }, []);

    // FIX: Hoisted assistant-related state declarations to resolve "used before declaration" errors.
    // =============================================================================================
    // SECTION: Assistant States (Durgas & Live)
    // =============================================================================================
    // Durgas Assistant State
    const [assistantState, setAssistantState] = useState<AssistantState>('idle');
    const [assistantTranscript, setAssistantTranscript] = useState('');
    const wakeWordRecognizerRef = useRef<any>(null);
    const commandRecognizerRef = useRef<any>(null);
    const assistantConversationHistory = useRef<any[]>([]);
    
    // Live Assistant State
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [transcripts, setTranscripts] = useState<{ user: string; model: string }[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const [currentOutput, setCurrentOutput] = useState("");
    const sessionPromiseRef = useRef<ReturnType<typeof geminiService.connectLive> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const streamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);


    // =============================================================================================
    // SECTION: Durgas Assistant (Voice Commands) Logic
    // =============================================================================================
    /** Converts text to speech and plays it. */
    const speakResponse = useCallback(async (text: string) => {
        if (!text) return;
        setAssistantState('speaking');
        try {
            const audioData = await geminiService.textToSpeech(text);
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const decodedData = await decodeAudioData(decode(audioData), audioContext, 24000, 1);
            const source = audioContext.createBufferSource();
            source.buffer = decodedData;
            source.connect(audioContext.destination);
            source.start(0);
            source.onended = () => {
                setAssistantState('idle');
            };
        } catch (error) {
            console.error("[AppContext] Error playing TTS audio:", error);
            setAssistantState('idle');
        }
    }, []);

    /** Executes a function call from the Gemini model. */
    const executeFunctionCall = useCallback(async (call: any): Promise<{result: any}> => {
        const { name, args } = call;
        console.debug(`[AppContext] Executing function call: ${name}`, args);
        let functionResult: any = "Unknown function";
        
        switch (name) {
            case 'openApp': {
                const app = APPS.find(a => a.name.toLowerCase().includes(args.appName.toLowerCase()));
                if (app) {
                    openApp(app.id);
                    functionResult = `Opening ${app.name}.`;
                } else {
                    functionResult = `Sorry, I couldn't find an app named ${args.appName}.`;
                }
                break;
            }
            case 'closeApp': {
                if (args.appName.toLowerCase() === 'all') {
                    setWindows([]);
                    functionResult = 'Closing all applications.';
                } else {
                    const win = windows.find(w => APPS.find(a => a.id === w.appId)?.name.toLowerCase().includes(args.appName.toLowerCase()));
                    if (win) {
                        closeApp(win.id);
                        functionResult = `Closed ${args.appName}.`;
                    } else {
                        functionResult = `App ${args.appName} is not open.`;
                    }
                }
                break;
            }
            case 'createFolder': {
                const locationMap: Record<string, string> = {
                    desktop: 'Users/Durgas/Desktop',
                    documents: 'Users/Durgas/Documents',
                    pictures: 'Users/Durgas/Pictures',
                    videos: 'Users/Durgas/Videos',
                };
                const path = locationMap[args.location.toLowerCase()];
                if (path) {
                    const newNode: FileSystemNode = { id: `folder-${Date.now()}`, name: args.folderName, type: 'FOLDER', children: [] };
                    const success = updateFileSystem(path, newNode);
                    functionResult = success ? `Created folder "${args.folderName}" in ${args.location}.` : `A folder named "${args.folderName}" already exists in ${args.location}.`;
                } else {
                    functionResult = `Sorry, I don't know the location "${args.location}".`;
                }
                break;
            }
            case 'setSystemTheme': {
                const newTheme = args.theme.toLowerCase();
                if (newTheme === 'light' || newTheme === 'dark') {
                    setTheme(newTheme);
                    functionResult = `Switched to ${newTheme} theme.`;
                } else {
                    functionResult = "I can only switch between 'light' and 'dark' themes.";
                }
                break;
            }
            case 'answerGeneralQuestion': {
                const response = await geminiService.sendMessage(args.query, 'gemini-2.5-flash');
                functionResult = response;
                break;
            }
            default:
                functionResult = `Function ${name} not implemented.`;
        }
        return { result: functionResult };
    }, [openApp, closeApp, updateFileSystem, windows, setWindows, setTheme]);

    /** Processes a transcribed voice command. */
    const processCommand = useCallback(async (command: string) => {
        if (!command) {
            setAssistantState('idle');
            return;
        }
        console.debug(`[AppContext] Processing command: "${command}"`);
        setAssistantState('thinking');
        assistantConversationHistory.current.push({ role: 'user', parts: [{ text: command }] });

        try {
            // Initial call to Gemini
            let response: GenerateContentResponse = await geminiService.getAssistantResponse(command, assistantTools, assistantConversationHistory.current);
            let functionCall = response.functionCalls?.[0];

            // If a function call is returned, execute it and send the result back
            if (functionCall) {
                const functionResponse = await executeFunctionCall(functionCall);
                assistantConversationHistory.current.push({ role: 'model', parts: [{ functionCall }] });
                assistantConversationHistory.current.push({
                    role: 'tool',
                    parts: [{ functionResponse: {name: functionCall.name, response: functionResponse} }],
                });
                // Call Gemini again with the function result for a final response
                response = await geminiService.getAssistantResponse(command, assistantTools, assistantConversationHistory.current);
            }
            
            const textResponse = response.text;
            assistantConversationHistory.current.push({ role: 'model', parts: [{ text: textResponse }] });
            await speakResponse(textResponse);

        } catch (error) {
            console.error("[AppContext] Error processing command:", error);
            setAssistantState('error');
            await speakResponse("Sorry, something went wrong.");
        }
    }, [executeFunctionCall, speakResponse]);

    /** Starts the speech recognition for a command after wake word is detected. */
    const startCommandListener = useCallback(() => {
        if (!SpeechRecognition || commandRecognizerRef.current) return;
        setAssistantState('listening');
        const recognizer = new SpeechRecognition();
        recognizer.continuous = false;
        recognizer.interimResults = true;
        recognizer.lang = 'en-US';
        
        let finalTranscript = '';
        recognizer.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setAssistantTranscript(finalTranscript + interimTranscript);
        };

        recognizer.onend = () => {
            commandRecognizerRef.current = null;
            if (assistantState === 'listening') {
                 processCommand(finalTranscript);
            }
        };
        
        recognizer.onerror = (event: any) => {
            console.error('[AppContext] Command recognition error', event.error);
            commandRecognizerRef.current = null;
            setAssistantState('error');
            setTimeout(() => setAssistantState('idle'), 2000);
        }

        recognizer.start();
        commandRecognizerRef.current = recognizer;
    }, [assistantState, processCommand]);

    /** Manually activates the assistant, e.g., via button click. */
    const activateAssistant = useCallback(() => {
        if (assistantState !== 'idle' && assistantState !== 'error') return;
        if(isSessionActive) {
            speakResponse("Please stop the Live Assistant before using voice commands.");
            return;
        }
        setAssistantTranscript('');
        assistantConversationHistory.current = [];
        if (wakeWordRecognizerRef.current) {
            wakeWordRecognizerRef.current.stop();
        }
        startCommandListener();
    }, [assistantState, isSessionActive, startCommandListener, speakResponse]);
    
    /** Effect to manage the wake-word listener. */
    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }
        const startWakeWordListener = () => {
             if (wakeWordRecognizerRef.current || assistantState !== 'idle' || isSessionActive) return;
             const recognizer = new SpeechRecognition();
             recognizer.continuous = true;
             recognizer.lang = 'en-US';
             recognizer.onresult = (event: any) => {
                 for (let i = event.resultIndex; i < event.results.length; ++i) {
                     const transcript = event.results[i][0].transcript.trim().toLowerCase();
                     if (transcript.includes('durgas')) {
                        activateAssistant();
                     }
                 }
             };
             recognizer.onend = () => {
                wakeWordRecognizerRef.current = null;
                // Restart listener if it stops due to no speech
                setTimeout(startWakeWordListener, 100);
             }
             recognizer.onerror = (event: any) => {
                 console.error("[AppContext] Wake word recognition error", event.error);
                 wakeWordRecognizerRef.current = null;
                 if (event.error === 'no-speech' || event.error === 'audio-capture') {
                    setTimeout(startWakeWordListener, 100);
                 }
             }
             recognizer.start();
             wakeWordRecognizerRef.current = recognizer;
        };

        if (assistantState === 'idle' && !isSessionActive) {
            startWakeWordListener();
        } else if (wakeWordRecognizerRef.current) {
            wakeWordRecognizerRef.current.stop();
            wakeWordRecognizerRef.current = null;
        }
        return () => { // Cleanup
            if (wakeWordRecognizerRef.current) wakeWordRecognizerRef.current.stop();
            if (commandRecognizerRef.current) commandRecognizerRef.current.stop();
        }
    }, [assistantState, isSessionActive, activateAssistant]);


    // =============================================================================================
    // SECTION: Live Assistant (Real-time Conversation) Logic
    // =============================================================================================
    /** Gracefully stops the live session and cleans up all audio resources. */
    const stopSession = useCallback(() => {
        console.debug("[AppContext] Stopping Live Assistant session.");
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        scriptProcessorRef.current?.disconnect();
        streamSourceRef.current?.disconnect();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        audioContextRef.current?.close().catch(console.error);
        setIsSessionActive(false);
        setCurrentInput('');
        setCurrentOutput('');
    }, []);

    /** Starts a new live conversation session. */
    const startSession = useCallback(async () => {
        if (isSessionActive) return;
        if (assistantState !== 'idle') {
            alert("Please wait for the voice assistant to finish.");
            return;
        }
        
        try {
            console.debug("[AppContext] Starting Live Assistant session.");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            let nextStartTime = 0;

            const onmessage = async (message: LiveServerMessage) => {
                let localCurrentInput = '';
                let localCurrentOutput = '';

                if (message.serverContent?.outputTranscription) {
                    localCurrentOutput += message.serverContent.outputTranscription.text;
                }
                if (message.serverContent?.inputTranscription) {
                    localCurrentInput += message.serverContent.inputTranscription.text;
                }

                setCurrentInput(prev => prev + localCurrentInput);
                setCurrentOutput(prev => prev + localCurrentOutput);

                // When a full turn is complete, save transcripts and reset current turn text.
                if (message.serverContent?.turnComplete) {
                    setTranscripts(prev => [...prev, { user: currentInput + localCurrentInput, model: currentOutput + localCurrentOutput }]);
                    setCurrentInput('');
                    setCurrentOutput('');
                }
                
                // Decode and play audio response from the model.
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
                    setCurrentInput('');
                    setCurrentOutput('');
                    
                    // Setup audio processing pipeline to stream microphone data to the API.
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
                        // Per Gemini guidelines, only rely on the promise being resolved to send data.
                         sessionPromiseRef.current?.then(session => {
                             session.sendRealtimeInput({ media: pcmBlob });
                         });
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
            alert("Could not access microphone. Please check permissions.");
        }
    }, [isSessionActive, stopSession, assistantState, currentInput, currentOutput]);

    // Cleanup session on component unmount.
    useEffect(() => stopSession, [stopSession]);


    // =============================================================================================
    // SECTION: Context Value Composition
    // =============================================================================================
    const appContextValue: AppContextType = {
        windows, openApp, closeApp, minimizeApp, focusApp, updateWindow, activeWindowId,
        theme, setTheme, wallpaper, setWallpaper, accentColor, setAccentColor,
        fileSystem, updateFileSystem, renameFileSystemNode, deleteFileSystemNode,
        isSessionActive, startSession, stopSession, transcripts, currentInput, currentOutput,
        assistantState, assistantTranscript, activateAssistant,
    };

    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
};
