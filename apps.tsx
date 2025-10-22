
import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import type { Message, GroundingChunk, AspectRatio, FileSystemNode } from './types';
import { geminiService } from './services';
import { fileToBase64, decode, decodeAudioData, encode } from './utils';
import { WALLPAPERS, ACCENT_COLORS } from './constants';
import { AppContext } from './App';

// Define hook locally to use the context from the root App.tsx
const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within the root AppProvider");
    }
    return context;
};


const AppContainer: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`h-full w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 overflow-y-auto ${className}`}>{children}</div>
);
const Title: React.FC<{children: React.ReactNode}> = ({ children }) => <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">{children}</h1>;
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button className={`bg-[var(--accent-color)] hover:opacity-90 text-white font-bold py-2 px-4 rounded transition-all ${className}`} {...props}>{children}</button>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-white ${className}`} {...props} />
);
const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
    <textarea className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-white ${className}`} {...props} />
);
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, className, ...props }) => (
    <select className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-white ${className}`} {...props}>{children}</select>
);
const Loader: React.FC = () => <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>;


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
            setMessages([...newMessages, { sender: 'gemini', text: response }]);
        } catch (error) {
            setMessages([...newMessages, { sender: 'gemini', text: `Error: ${(error as Error).message}` }]);
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
                                {msg.sender === 'gemini' && <button onClick={() => playAudio(msg.text)}>🔊</button>}
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
    const [activeTab, setActiveTab] = useState('generate');
    // Common state
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Specific state
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
            if (activeTab === 'generate') {
                if (!prompt) throw new Error("Prompt is required.");
                const imgBytes = await geminiService.generateImage(prompt, aspectRatio);
                res = `data:image/jpeg;base64,${imgBytes}`;
            } else if (file) {
                const base64Data = await fileToBase64(file);
                if (activeTab === 'edit') {
                    if (!prompt) throw new Error("Edit instruction is required.");
                    const imgBytes = await geminiService.editImage(prompt, base64Data, file.type);
                    res = `data:image/png;base64,${imgBytes}`;
                } else if (activeTab === 'analyze-img') {
                    if (!prompt) throw new Error("Analysis question is required.");
                    res = await geminiService.analyzeContent(prompt, base64Data, file.type, 'gemini-2.5-flash');
                } else if (activeTab === 'analyze-vid') {
                     if (!prompt) throw new Error("Analysis question is required.");
                    res = await geminiService.analyzeContent(prompt, base64Data, file.type, 'gemini-2.5-pro');
                } else if (activeTab === 'transcribe') {
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
        const showFileInput = ['edit', 'analyze-img', 'analyze-vid', 'transcribe'].includes(activeTab);
        const showPreview = filePreview && showFileInput;
        return (
            <div className="flex flex-col gap-4">
                { showFileInput && <Input type="file" onChange={handleFileChange} accept={activeTab === 'transcribe' ? 'audio/*' : (activeTab === 'analyze-vid' ? 'video/*' : 'image/*')} /> }
                { showPreview && (
                    <div>
                        {file?.type.startsWith('image/') && <img src={filePreview!} alt="Preview" className="max-w-xs rounded" />}
                        {file?.type.startsWith('video/') && <video src={filePreview!} controls className="max-w-xs rounded" />}
                        {file?.type.startsWith('audio/') && <audio src={filePreview!} controls />}
                    </div>
                )}
                {activeTab !== 'transcribe' && <TextArea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={
                    activeTab === 'generate' ? "A hyperrealistic photo of a cat wearing a tiny hat..." :
                    activeTab === 'edit' ? "Add sunglasses to the cat" :
                    "What is unusual about this content?"
                } rows={4} />}
                 {activeTab === 'generate' && (
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
                <div className="flex border-b border-[var(--border-color)] mb-4">
                    {['Generate Image', 'Edit Image', 'Analyze Image', 'Analyze Video', 'Transcribe Audio'].map(tab => {
                        const id = tab.toLowerCase().replace(' ', '-');
                        return <button key={id} onClick={() => setActiveTab(id)} className={`py-2 px-4 ${activeTab === id ? 'border-b-2 border-[var(--accent-color)]' : ''}`}>{tab}</button>
                    })}
                </div>
                <div className="flex-grow grid grid-cols-2 gap-4">
                    <div>{renderTabContent()}</div>
                    <div className="bg-gray-900/50 rounded p-4 overflow-auto">
                        {isLoading && <Loader />}
                        {error && <p className="text-red-500">{error}</p>}
                        {result && (
                            activeTab === 'generate' || activeTab === 'edit' ? <img src={result} alt="Result" className="w-full rounded"/> : <p className="whitespace-pre-wrap">{result}</p>
                        )}
                    </div>
                </div>
            </div>
        </AppContainer>
    );
};


export const LiveAssistantApp: React.FC = () => {
    // This app uses the context defined in App.tsx, but since we are in a single file
    // for this tool, we will have to imagine it's being passed down or consumed properly.
    const isSessionActive = false; // Placeholder
    const startSession = () => console.log("start session");
    const stopSession = () => console.log("stop session");
    const transcripts: {user:string, model:string}[] = []; // Placeholder
    const currentInput = ""; // Placeholder
    const currentOutput = ""; // Placeholder

    return (
        <AppContainer>
            <Title>Live Assistant</Title>
            <p className="mb-4">Have a real-time voice conversation with Gemini. (Live API component is complex and state should be managed in main App component)</p>
            {!isSessionActive ? <Button onClick={startSession}>Start Conversation</Button> : <Button onClick={stopSession} className="bg-red-600 hover:bg-red-700">Stop Conversation</Button>}
            <div className="mt-4 space-y-4">
                {transcripts.map((t, i) => (
                    <div key={i}>
                        <p><strong>You:</strong> {t.user}</p>
                        <p><strong>Durgas:</strong> {t.model}</p>
                    </div>
                ))}
                {isSessionActive && (
                    <div>
                        {currentInput && <p><strong>You:</strong> {currentInput}</p>}
                        {currentOutput && <p><strong>Durgas:</strong> {currentOutput}</p>}
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
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about recent events or places..."/>
                <Button onClick={handleSearch} disabled={isLoading}>Search</Button>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={useMaps} onChange={() => setUseMaps(!useMaps)} className="form-checkbox h-5 w-5 text-blue-600"/>
                    <span className="text-[var(--text-primary)]">Use Maps</span>
                </label>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg h-full overflow-y-auto">
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

// --- NEW APPS ---

export const SettingsApp: React.FC = () => {
    const { theme, setTheme, wallpaper, setWallpaper, accentColor, setAccentColor } = useAppContext();

    return (
        <AppContainer>
            <Title>Settings</Title>
            <div className="space-y-8">
                {/* Theme Settings */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Theme</h2>
                    <div className="flex items-center gap-4 bg-black/20 p-4 rounded-lg">
                        <span>Toggle between light and dark mode for the OS.</span>
                        <div className="flex gap-2">
                           <Button onClick={() => setTheme('light')} className={theme === 'light' ? '' : 'bg-gray-500'}>Light</Button>
                           <Button onClick={() => setTheme('dark')} className={theme === 'dark' ? '' : 'bg-gray-500'}>Dark</Button>
                        </div>
                    </div>
                </div>

                {/* Accent Color Settings */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Accent Color</h2>
                    <div className="flex flex-wrap gap-4 bg-black/20 p-4 rounded-lg">
                        {ACCENT_COLORS.map(color => (
                            <button key={color.name} onClick={() => setAccentColor(color)} className={`w-12 h-12 rounded-full border-4 ${accentColor.hex === color.hex ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color.hex }} title={color.name} />
                        ))}
                    </div>
                </div>

                {/* Wallpaper Settings */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Wallpaper</h2>
                     <div className="grid grid-cols-2 gap-4">
                        {WALLPAPERS.map(wp => (
                            <div key={wp.name} onClick={() => setWallpaper(wp.url)} className={`relative rounded-lg overflow-hidden cursor-pointer border-4 ${wallpaper === wp.url ? 'border-[var(--accent-color)]' : 'border-transparent'}`}>
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
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [newFolderName, setNewFolderName] = useState('');

    const getCurrentNode = () => {
        let node = fileSystem;
        for (const part of currentPath) {
            node = node.children?.find(c => c.name === part)!;
        }
        return node;
    };

    const handleNavigation = (folderName: string) => {
        setCurrentPath(prev => [...prev, folderName]);
    };

    const handleDoubleClick = (item: FileSystemNode) => {
        if (item.type === 'FOLDER') {
            handleNavigation(item.name);
        } else {
            openApp('notepad', { content: item.content || 'This file is empty.', title: item.name });
        }
    };

    const handleCreateFolder = () => {
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
        <AppContainer className="flex flex-col">
            <div className="flex items-center gap-2 p-2 border-b border-[var(--border-color)] mb-2">
                <button disabled={currentPath.length === 0} onClick={() => setCurrentPath(p => p.slice(0, -1))} className="px-2 py-1 rounded hover:bg-white/10 disabled:opacity-50">↑</button>
                <div>C:\{currentPath.join('\\')}</div>
            </div>
            <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-4 gap-4 p-2">
                    {currentNode.children?.map(item => (
                         <div key={item.id} onDoubleClick={() => handleDoubleClick(item)} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-[var(--accent-color)]/50 cursor-pointer">
                            <span className="text-4xl">{item.type === 'FOLDER' ? '📁' : '📄'}</span>
                            <span className="text-xs text-center break-all">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-2 border-t border-[var(--border-color)] flex gap-2">
                <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="New folder name..." className="text-sm"/>
                <Button onClick={handleCreateFolder} className="text-sm">Create Folder</Button>
            </div>
        </AppContainer>
    );
};

export const NotepadApp: React.FC<{ content: string, title: string }> = ({ content, title }) => {
    return (
        <AppContainer>
            <Title>{title}</Title>
            <textarea
                readOnly
                value={content}
                className="w-full h-full bg-transparent text-[var(--text-primary)] resize-none focus:outline-none"
            />
        </AppContainer>
    );
};
