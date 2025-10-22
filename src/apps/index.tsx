import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, GroundingChunk, AspectRatio, FileSystemNode, AppDefinition } from '../types';
import { geminiService } from '../services/geminiService';
import { fileToBase64, decode, decodeAudioData } from '../utils';
import { WALLPAPERS, ACCENT_COLORS, AboutIcon, PortfolioIcon, GeminiChatIcon, CreatorStudioIcon, LiveAssistantIcon, BrowserIcon, SettingsIcon, FileExplorerIcon, NotepadIcon, TerminalIcon } from '../constants';
import { useAppContext } from '../hooks/useAppContext';
import { AppContainer } from '../components/ui/AppContainer';
import { Title } from '../components/ui/Title';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Select } from '../components/ui/Select';
import { Loader } from '../components/ui/Loader';

// --- BUILT-IN APPS ---

export const AboutMeApp: React.FC = () => (
    <AppContainer>
        <Title>About DurgasOS</Title>
        <p>Welcome to DurgasOS, a simulated desktop environment built with React and powered by the Google Gemini API.</p>
        <p className="mt-2">This project showcases the capabilities of Gemini in a familiar, interactive user interface. Explore the various applications to see how AI can be integrated into everyday tools.</p>
    </AppContainer>
);

export const PortfolioApp: React.FC = () => (
    <AppContainer>
        <Title>Portfolio</Title>
        <p>This OS itself is a portfolio piece demonstrating advanced frontend development and API integration skills.</p>
        <ul className="list-disc list-inside mt-2">
            <li>React & TypeScript</li>
            <li>Tailwind CSS for styling</li>
            <li>Complex state management for windows and applications</li>
            <li>Comprehensive Gemini API integration</li>
        </ul>
    </AppContainer>
);

export const GeminiChatApp: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState<'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro'>('gemini-2.5-flash');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);
    
    const playAudio = async (text: string) => {
        try {
            const audioData = await geminiService.textToSpeech(text);
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const decodedData = await decodeAudioData(decode(audioData), audioContext, 24000, 1);
            const source = audioContext.createBufferSource();
            source.buffer = decodedData;
            source.connect(audioContext.destination);
            source.start(0);
        } catch (error) {
            console.error("Error playing TTS audio:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const newMessages: Message[] = [...messages, { sender: 'user', text: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await geminiService.sendMessage(input, model);
            const geminiResponse = { sender: 'gemini' as const, text: response };
            setMessages(prev => [...prev, geminiResponse]);
            await playAudio(response);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'gemini', text: `Error: ${(error as Error).message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppContainer>
            <div className="flex flex-col h-full">
                <div className="flex-grow overflow-y-auto pr-2">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-2.5 my-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                             <div className={`flex flex-col gap-1 w-full max-w-[320px] leading-1.5 p-4 border-gray-200 rounded-xl ${msg.sender === 'user' ? 'bg-[var(--accent-color)] rounded-tr-none' : 'bg-gray-700 rounded-tl-none'}`}>
                                <p className="text-sm font-normal text-white">{msg.text}</p>
                                {msg.sender === 'gemini' && <button onClick={() => playAudio(msg.text)} className="self-start mt-1 text-xs">🔊</button>}
                             </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-2.5 my-2">
                            <div className="flex flex-col gap-1 w-full max-w-[320px] p-4 bg-gray-700 rounded-xl rounded-tl-none"><Loader /></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2 p-2 border-t border-[var(--border-color)]">
                    <Select value={model} onChange={e => setModel(e.target.value as any)}>
                        <option value="gemini-2.5-flash-lite">Fast</option>
                        <option value="gemini-2.5-flash">Standard</option>
                        <option value="gemini-2.5-pro">Advanced (Thinking)</option>
                    </Select>
                    <Input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Gemini..." />
                    <Button type="submit" disabled={isLoading}>Send</Button>
                </form>
            </div>
        </AppContainer>
    );
};

export const CreatorStudioApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState('generate-image');
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setResult(null);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result as string);
            reader.readAsDataURL(f);
        }
    };
    
    const handleSubmit = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            let res: string | null = null;
            if (activeTab === 'generate-image') {
                if (!prompt) throw new Error("Prompt is required.");
                const imgBytes = await geminiService.generateImage(prompt, aspectRatio);
                res = `data:image/jpeg;base64,${imgBytes}`;
            } else if (file) {
                const base64Data = await fileToBase64(file);
                if (activeTab === 'edit-image') {
                    if (!prompt) throw new Error("Edit instruction is required.");
                    const imgBytes = await geminiService.editImage(prompt, base64Data, file.type);
                    res = `data:image/png;base64,${imgBytes}`;
                } else if (activeTab === 'analyze-image') {
                    if (!prompt) throw new Error("Analysis question is required.");
                    res = await geminiService.analyzeContent(prompt, base64Data, file.type, 'gemini-2.5-flash');
                } else if (activeTab === 'analyze-video') {
                     if (!prompt) throw new Error("Analysis question is required.");
                    res = await geminiService.analyzeContent(prompt, base64Data, file.type, 'gemini-2.5-pro');
                } else if (activeTab === 'transcribe-audio') {
                    res = await geminiService.transcribeAudio(base64Data, file.type);
                }
            } else {
                 throw new Error("A file is required for this operation.");
            }
            setResult(res);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTabContent = () => {
        const showFileInput = ['edit-image', 'analyze-image', 'analyze-video', 'transcribe-audio'].includes(activeTab);
        const showPreview = filePreview && showFileInput;
        return (
            <div className="flex flex-col gap-4">
                { showFileInput && <Input type="file" onChange={handleFileChange} accept={activeTab === 'transcribe-audio' ? 'audio/*' : (activeTab === 'analyze-video' ? 'video/*' : 'image/*')} /> }
                { showPreview && (
                    <div>
                        {file?.type.startsWith('image/') && <img src={filePreview!} alt="Preview" className="max-w-xs rounded" />}
                        {file?.type.startsWith('video/') && <video src={filePreview!} controls className="max-w-xs rounded" />}
                        {file?.type.startsWith('audio/') && <audio src={filePreview!} controls />}
                    </div>
                )}
                {activeTab !== 'transcribe-audio' && <TextArea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={
                    activeTab === 'generate-image' ? "A hyperrealistic photo of a cat wearing a tiny hat..." :
                    activeTab === 'edit-image' ? "Add sunglasses to the cat" :
                    "What is unusual about this content?"
                } rows={4} />}
                 {activeTab === 'generate-image' && (
                    <Select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)}>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                        <option value="4:3">4:3</option>
                        <option value="3:4">3:4</option>
                    </Select>
                 )}
                <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Working...' : 'Go'}</Button>
            </div>
        );
    };

    return (
        <AppContainer>
            <div className="flex flex-col h-full">
                <div className="flex border-b border-[var(--border-color)] mb-4 overflow-x-auto">
                    {['Generate Image', 'Edit Image', 'Analyze Image', 'Analyze Video', 'Transcribe Audio'].map(tab => {
                        const id = tab.toLowerCase().replace(/ /g, '-');
                        return <button key={id} onClick={() => setActiveTab(id)} className={`py-2 px-4 text-sm flex-shrink-0 ${activeTab === id ? 'border-b-2 border-[var(--accent-color)]' : ''}`}>{tab}</button>
                    })}
                </div>
                <div className="flex-grow grid md:grid-cols-2 gap-4">
                    <div>{renderTabContent()}</div>
                    <div className="bg-gray-900/50 rounded p-4 overflow-auto">
                        {isLoading && <Loader />}
                        {error && <p className="text-red-500">{error}</p>}
                        {result && (
                            (activeTab === 'generate-image' || activeTab === 'edit-image') ? <img src={result} alt="Result" className="w-full rounded"/> : <p className="whitespace-pre-wrap">{result}</p>
                        )}
                    </div>
                </div>
            </div>
        </AppContainer>
    );
};

export const LiveAssistantApp: React.FC = () => {
    const { isSessionActive, startSession, stopSession, transcripts, currentInput, currentOutput } = useAppContext();
    
    return (
        <AppContainer>
            <Title>Live Assistant</Title>
            <p className="mb-4">Have a real-time voice conversation with Gemini. Press start and begin speaking.</p>
            {!isSessionActive ? <Button onClick={startSession}>Start Conversation</Button> : <Button onClick={stopSession} className="bg-red-600 hover:bg-red-700">Stop Conversation</Button>}
            <div className="mt-4 space-y-4">
                {transcripts.map((t: {user: string, model: string}, i: number) => (
                    <div key={i} className="p-2 bg-black/20 rounded">
                        <p><strong>You:</strong> {t.user}</p>
                        <p><strong>Durgas:</strong> {t.model}</p>
                    </div>
                ))}
                {isSessionActive && (
                    <div className="p-2 bg-black/20 rounded animate-pulse">
                        {currentInput && <p><strong>You:</strong> <em>{currentInput}</em></p>}
                        {currentOutput && <p><strong>Durgas:</strong> <em>{currentOutput}</em></p>}
                    </div>
                )}
            </div>
        </AppContainer>
    );
};

export const BrowserApp: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{text: string; chunks: GroundingChunk[]}|null>(null);
    const [error, setError] = useState<string|null>(null);
    const [useMaps, setUseMaps] = useState(false);

    const handleSearch = async () => {
        if (!query.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await geminiService.groundedSearch(query, useMaps);
            setResult(response);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppContainer>
            <div className="flex gap-2 mb-4">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Ask about recent events or places..."/>
                <Button onClick={handleSearch} disabled={isLoading}>Search</Button>
                <label className="flex items-center gap-2 flex-shrink-0">
                    <input type="checkbox" checked={useMaps} onChange={() => setUseMaps(!useMaps)} className="form-checkbox h-5 w-5 text-[var(--accent-color)] bg-gray-800 border-gray-600 rounded focus:ring-offset-0 focus:ring-0"/>
                    <span className="text-[var(--text-primary)]">Use Maps</span>
                </label>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg flex-grow overflow-y-auto">
                {isLoading && <Loader />}
                {error && <p className="text-red-500">{error}</p>}
                {result && (
                    <div>
                        <p className="whitespace-pre-wrap">{result.text}</p>
                        {result.chunks.length > 0 && <h3 className="font-bold mt-4">Sources:</h3>}
                        <ul className="list-disc list-inside">
                            {result.chunks.map((chunk, i) => {
                                const source = chunk.web || chunk.maps;
                                return source ? <li key={i}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{source.title}</a></li> : null;
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </AppContainer>
    );
};

export const SettingsApp: React.FC = () => {
    const { theme, setTheme, wallpaper, setWallpaper, accentColor, setAccentColor } = useAppContext();

    return (
        <AppContainer>
            <Title>Settings</Title>
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Theme</h2>
                    <div className="flex items-center gap-4 bg-black/20 p-4 rounded-lg">
                        <span>Toggle between light and dark mode for the OS.</span>
                        <div className="flex gap-2 ml-auto">
                           <Button onClick={() => setTheme('light')} className={theme === 'light' ? '' : 'bg-gray-500'}>Light</Button>
                           <Button onClick={() => setTheme('dark')} className={theme === 'dark' ? '' : 'bg-gray-500'}>Dark</Button>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Accent Color</h2>
                    <div className="flex flex-wrap gap-4 bg-black/20 p-4 rounded-lg">
                        {ACCENT_COLORS.map(color => (
                            <button key={color.name} onClick={() => setAccentColor(color)} className={`w-12 h-12 rounded-full border-4 transition-all ${accentColor.hex === color.hex ? 'border-white' : 'border-transparent hover:border-white/50'}`} style={{ backgroundColor: color.hex }} title={color.name} />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Wallpaper</h2>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {WALLPAPERS.map(wp => (
                            <div key={wp.name} onClick={() => setWallpaper(wp.url)} className={`relative rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${wallpaper === wp.url ? 'border-[var(--accent-color)]' : 'border-transparent hover:border-[var(--accent-color)]/50'}`}>
                                <img src={wp.url} alt={wp.name} className="w-full h-32 object-cover"/>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-sm py-1">{wp.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppContainer>
    );
};

export const FileExplorerApp: React.FC<{ initialPath?: string }> = ({ initialPath }) => {
    const { fileSystem, openApp, updateFileSystem } = useAppContext();
    const [currentPath, setCurrentPath] = useState<string[]>(initialPath ? initialPath.split('/') : []);
    const [newFolderName, setNewFolderName] = useState('');

    const getCurrentNode = () => {
        let node = fileSystem;
        try {
            for (const part of currentPath) {
                const nextNode = node.children?.find(c => c.name === part);
                if (!nextNode) throw new Error("Path not found");
                node = nextNode;
            }
        } catch (error) {
            console.error(error);
            setCurrentPath([]); // Reset to root on error
            return fileSystem;
        }
        return node;
    };

    const handleDoubleClick = (item: FileSystemNode) => {
        if (item.type === 'FOLDER') {
            setCurrentPath(prev => [...prev, item.name]);
        } else {
            openApp('notepad', { content: item.content || 'This file is empty.', title: item.name });
        }
    };

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        const fullPath = currentPath.join('/');
        const newNode: FileSystemNode = {
            id: `folder-${Date.now()}`,
            name: newFolderName,
            type: 'FOLDER',
            children: [],
        };
        updateFileSystem(fullPath, newNode);
        setNewFolderName('');
    };
    
    const currentNode = getCurrentNode();

    return (
        <AppContainer className="!p-0 flex flex-col">
            <div className="flex items-center gap-2 p-2 border-b border-[var(--border-color)] flex-shrink-0">
                <button disabled={currentPath.length === 0} onClick={() => setCurrentPath(p => p.slice(0, -1))} className="px-2 py-1 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">↑</button>
                <div className="bg-black/20 px-2 py-1 rounded text-sm">C:\{currentPath.join('\\')}</div>
            </div>
            <div className="flex-grow overflow-y-auto p-2">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {currentNode.children?.map(item => (
                         <div key={item.id} onDoubleClick={() => handleDoubleClick(item)} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-[var(--accent-color)]/50 cursor-pointer text-center">
                            <span className="text-4xl">{item.type === 'FOLDER' ? '📁' : '📄'}</span>
                            <span className="text-xs break-all">{item.name}</span>
                        </div>
                    ))}
                    {!currentNode.children || currentNode.children.length === 0 && <p className="col-span-full text-center text-gray-400">This folder is empty.</p>}
                </div>
            </div>
            <form onSubmit={handleCreateFolder} className="p-2 border-t border-[var(--border-color)] flex gap-2 flex-shrink-0">
                <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="New folder name..." className="text-sm"/>
                <Button type="submit" className="text-sm">Create Folder</Button>
            </form>
        </AppContainer>
    );
};

export const NotepadApp: React.FC<{ content: string, title: string }> = ({ content = 'This file is empty.', title = 'Untitled' }) => {
    return (
        <AppContainer>
            <textarea
                readOnly
                defaultValue={content}
                className="w-full h-full bg-transparent text-[var(--text-primary)] resize-none focus:outline-none font-mono"
            />
        </AppContainer>
    );
};

export const TerminalApp: React.FC = () => {
    const { fileSystem } = useAppContext();
    const [history, setHistory] = useState<React.ReactNode[]>(['Welcome to DurgasOS Terminal.', 'Type "help" for a list of commands.']);
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        terminalBodyRef.current?.scrollTo(0, terminalBodyRef.current.scrollHeight);
    }, [history]);

    const getNodeFromPath = useCallback((path: string[], fs: FileSystemNode): FileSystemNode | null => {
        let node: FileSystemNode | undefined = fs;
        for (const part of path) {
            node = node?.children?.find(c => c.name.toLowerCase() === part.toLowerCase());
            if (!node) return null;
        }
        return node || null;
    }, []);

    const processCommand = useCallback((command: string) => {
        const [cmd, ...args] = command.trim().split(/\s+/);
        const prompt = `C:\\${currentPath.join('\\')}>`;
        const commandLine = `${prompt} ${command}`;

        if (!cmd) {
            setHistory(prev => [...prev, prompt]);
            return;
        }

        let output: React.ReactNode[] = [];

        switch (cmd.toLowerCase()) {
            case 'help':
                output = ['Available commands:', '  help     - Show this help message', '  clear    - Clear the terminal screen', '  ls       - List directory contents', '  cd <dir> - Change directory', '  pwd      - Print working directory', '  echo ... - Print arguments', '  cat <file> - Display file content'];
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'pwd':
                output = [`C:\\${currentPath.join('\\')}`];
                break;
            case 'echo':
                output = [args.join(' ')];
                break;
            case 'ls': {
                const currentNode = getNodeFromPath(currentPath, fileSystem);
                if (currentNode && currentNode.children && currentNode.children.length > 0) {
                    output = currentNode.children.map(child => (
                        <div key={child.id} className="flex">
                            <span className={`w-24 ${child.type === 'FOLDER' ? 'text-cyan-400' : 'text-gray-300'}`}>{`<${child.type}>`}</span>
                            <span>{child.name}</span>
                        </div>
                    ));
                } else if (currentNode) {
                    output = ['Directory is empty.'];
                } else {
                    output = ['Error: Current directory not found.'];
                }
                break;
            }
            case 'cd': {
                const target = args[0] || '';
                if (target === '..') {
                    if (currentPath.length > 0) {
                        setCurrentPath(p => p.slice(0, -1));
                    }
                } else if (target === '/' || target === '\\' || !target) {
                    setCurrentPath([]);
                } else {
                    const currentNode = getNodeFromPath(currentPath, fileSystem);
                    const targetNode = currentNode?.children?.find(c => c.name.toLowerCase() === target.toLowerCase());
                    if (targetNode && targetNode.type === 'FOLDER') {
                        setCurrentPath(p => [...p, targetNode.name]);
                    } else {
                        output = [`cd: no such directory: ${target}`];
                    }
                }
                break;
            }
            case 'cat': {
                const fileName = args[0];
                if (!fileName) {
                    output = ['cat: missing file operand'];
                    break;
                }
                const currentNode = getNodeFromPath(currentPath, fileSystem);
                const fileNode = currentNode?.children?.find(c => c.name.toLowerCase() === fileName.toLowerCase());
                if (fileNode && fileNode.type === 'FILE') {
                    output = (fileNode.content || '').split('\n');
                } else if (fileNode && fileNode.type === 'FOLDER') {
                    output = [`cat: ${fileName}: Is a directory`];
                } else {
                    output = [`cat: ${fileName}: No such file or directory`];
                }
                break;
            }
            default:
                output = [`Command not found: ${cmd}. Type 'help' for a list of commands.`];
        }
        setHistory(prev => [...prev, commandLine, ...output]);
    }, [currentPath, fileSystem, getNodeFromPath]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const command = inputRef.current?.value || '';
        if (inputRef.current) inputRef.current.value = '';
        processCommand(command);
    }

    const promptText = `C:\\${currentPath.join('\\')}>`;

    return (
        <div className="h-full w-full bg-[#0D1117] font-mono text-sm text-white p-2 overflow-hidden flex flex-col" onClick={() => inputRef.current?.focus()}>
            <div ref={terminalBodyRef} className="flex-grow overflow-y-auto pr-2">
                {history.map((line, index) => <div key={index} className="whitespace-pre-wrap leading-snug">{line}</div>)}
            </div>
            <form onSubmit={handleFormSubmit} className="flex items-center flex-shrink-0 mt-2">
                <label htmlFor="terminal-input" className="shrink-0 text-green-400">{promptText}</label>
                <input id="terminal-input" ref={inputRef} type="text" autoFocus autoComplete="off" className="flex-1 bg-transparent border-none outline-none text-white ml-2 p-0" />
            </form>
        </div>
    );
};


// --- APP DEFINITIONS ---
export const APPS: AppDefinition[] = [
  { id: 'about', name: 'About Me', icon: <AboutIcon />, component: AboutMeApp },
  { id: 'portfolio', name: 'Portfolio', icon: <PortfolioIcon />, component: PortfolioApp },
  { id: 'browser', name: 'Gemini Browser', icon: <BrowserIcon />, component: BrowserApp },
  { id: 'chat', name: 'Gemini Chat', icon: <GeminiChatIcon />, component: GeminiChatApp },
  { id: 'creator', name: 'Creator Studio', icon: <CreatorStudioIcon />, component: CreatorStudioApp },
  { id: 'live', name: 'Live Assistant', icon: <LiveAssistantIcon />, component: LiveAssistantApp },
  { id: 'fileExplorer', name: 'File Explorer', icon: <FileExplorerIcon />, component: FileExplorerApp },
  { id: 'settings', name: 'Settings', icon: <SettingsIcon />, component: SettingsApp },
  { id: 'notepad', name: 'Notepad', icon: <NotepadIcon />, component: NotepadApp },
  { id: 'terminal', name: 'Terminal', icon: <TerminalIcon />, component: TerminalApp },
];