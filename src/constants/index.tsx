
import React from 'react';
import type { WindowInstance, AccentColor, FileSystemNode } from '../types';

// ICONS (as JSX)
export const AboutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-cyan-400" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>;
export const PortfolioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-green-400" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>;
export const GeminiChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-purple-400" viewBox="0 0 24 24"><path d="M15 4v16l-2-2-2 2-2-2-2 2-2-2-3 3V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2z"/></svg>;
export const CreatorStudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-orange-400" viewBox="0 0 24 24"><path d="M12 2.5a.5.5 0 01.5.5v2.5a.5.5 0 01-1 0V3a.5.5 0 01.5-.5zM8.5 4.134a.5.5 0 01.5.866l-1.5 2.598a.5.5 0 11-.866-.5l1.5-2.598a.5.5 0 01.366-.366zM15.5 4.134a.5.5 0 01.366.366l1.5 2.598a.5.5 0 01-.866.5l-1.5-2.598a.5.5 0 01.5-.866zM4.134 8.5a.5.5 0 01.866.5l-2.598 1.5a.5.5 0 11-.5-.866l2.598-1.5a.5.5 0 01.366-.366zM19.866 8.5a.5.5 0 01.366.366l2.598 1.5a.5.5 0 01-.5.866l-2.598-1.5a.5.5 0 01.866-.5zM3 12.5a.5.5 0 01.5-.5h2.5a.5.5 0 010 1H3.5a.5.5 0 01-.5-.5zM18 12.5a.5.5 0 01.5-.5h2.5a.5.5 0 010 1H18.5a.5.5 0 01-.5-.5zM8.5 20.866a.5.5 0 01-.5-.866l1.5-2.598a.5.5 0 01.866.5l-1.5 2.598a.5.5 0 01-.366.366zM15.5 20.866a.5.5 0 01-.366-.366l-1.5-2.598a.5.5 0 11.866-.5l1.5 2.598a.5.5 0 01-.5.866zM12 21.5a.5.5 0 01-.5-.5v-2.5a.5.5 0 011 0V21a.5.5 0 01-.5-.5z"/></svg>;
export const LiveAssistantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-red-400" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>;
export const BrowserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-blue-400" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1h-2v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2 .9 2 2v5.41c0 .89-.38 1.7-1.1 2.22z"/></svg>;
export const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-gray-400" viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17-.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>;
export const FileExplorerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-yellow-500" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>;
export const NotepadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-white" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 14h-8v-2h8v2zm0-4h-8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>;
export const TerminalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-gray-300 w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>;
export const DurgasAssistantIcon = () => <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-white w-full h-full"><circle cx="50" cy="50" r="32" stroke="cyan" strokeWidth="6" fill="none" /><circle cx="50" cy="50" r="18" fill="cyan" /></svg>;
export const VideoPlayerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-rose-500" viewBox="0 0 24 24"><path d="M10 16.5v-9l6 4.5-6 4.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>;


// INITIAL STATE
export const defaultWindows: WindowInstance[] = [
  {
    id: 'win-1',
    appId: 'about',
    x: 150,
    y: 150,
    width: 600,
    height: 400,
    isMinimized: false,
    zIndex: 1,
  },
];

// SETTINGS CONSTANTS
export const WALLPAPERS = [
    { name: "Flow", url: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1932&auto=format&fit=crop" },
    { name: "Glow", url: "https://images.unsplash.com/photo-1541278127399-63a238713364?q=80&w=1974&auto=format&fit=crop" },
    { name: "Mountains", url: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=2070&auto=format&fit=crop" },
    { name: "Abstract", url: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=1887&auto=format&fit=crop" }
];

export const ACCENT_COLORS: AccentColor[] = [
    { name: "Default Blue", hex: "#0078D4" },
    { name: "Orchid", hex: "#DA70D6" },
    { name: "Emerald", hex: "#50C878" },
    { name: "Tangerine", hex: "#F28500" },
    { name: "Ruby", hex: "#E0115F" },
];

// FILE SYSTEM
export const initialFileSystem: FileSystemNode = {
    id: 'root',
    name: 'C:',
    type: 'FOLDER',
    children: [
        {
            id: 'users',
            name: 'Users',
            type: 'FOLDER',
            children: [
                {
                    id: 'durgas',
                    name: 'Durgas',
                    type: 'FOLDER',
                    children: [
                        { id: 'desktop', name: 'Desktop', type: 'FOLDER', children: [] },
                        {
                            id: 'documents',
                            name: 'Documents',
                            type: 'FOLDER',
                            children: [
                                { id: 'readme', name: 'readme.txt', type: 'FILE', content: 'Welcome to DurgasOS! This is a simple text file.' },
                            ],
                        },
                        { 
                            id: 'pictures', 
                            name: 'Pictures', 
                            type: 'FOLDER', 
                            children: [
                                { id: 'gemini-logo', name: 'gemini.png', type: 'FILE', content: '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' },
                            ]
                        },
                         { 
                            id: 'videos', 
                            name: 'Videos', 
                            type: 'FOLDER', 
                            children: [
                                { id: 'countdown-video', name: 'countdown.mp4', type: 'FILE', content: 'AAAAGGZ0eXBNNFYgAAACAGlzb21hdmMxbXA0MgAAAZRtb292AAAAbG12aGQAAAAAzdK2Y83StmMAAV+kAAEePAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACdXRyYWsAAABcdGtoZAAAAAMzStmPN0rZjAAAAAEAAAAAAA48AAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAgAAAACAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEADjwAAAABAAAAAAG9bWRpYQAAACBtZGhkAAAAAM3StmPN0rZjAAAFoAAAEKxVxAAAAAAALWhkbHIAAAAAbWhscnZpZGV2aWRlAAAAAAAAAAAAAAAAAAAAAAVtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAABtc3RpYgAAAChzdHNkAAAAAAAAAAEAAACuYXZjMQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAACAAIAAIAAAAEgAIAAAAAAEgICAgDAAEAE/////wAAADBhdmNDAWQAH/hAAmpoA//gH0EAcqACwIA3/gABgAXogAcgYQ///wEABGdhdmNjAAAAAAAAAAYAEAAAAAAAAAAAEAAAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAYc3R0cwAAAAAAAAACAAAAAQAAABgAAAABAAAAIQAAABRzdHNzAAAAAAAAAAEAAAABAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAACAAAAAQAAABRzdHN6AAAAAAAAAAAAAAIAAAEAAAG8AAAAHHN0Y28AAAAAAAAAAQAAACQAAABIdXVpZAAAAABodHRwOi8vdGsubWljcm9zb2Z0LmNvbS8gW1Rlc3QgVmVyc2lvbiAxXQAAAhtkYXRhAAAAgQEF/A4AAAAAYWR0bAAAAAxjYWxyYwAAAAEAAADvY2FscQAAAAEAAADvbWRhdAAAAgkBA/wOAAMAGBv8eQADAGQAHwABgwP//gH0EAcqACwIA3/gABgAXogAcgYQAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAQAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAADAAAAcAAAAAAIAAAAAAAAAAAAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAACAAAAAQAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAACAAAAAQAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAACAAAABAAAAAEAAAAAAAAAAAAAAAAAAAAJAAAAAQAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAACAAAADAAAAAIAAAAAAAAAAAAAAAAAAAAPAAAAAgAAAAAAAAAAAAAAAAAAABMAAAAAAAAAAAAAAAAAAAACAAAADwAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAACAAAAEwAAAAIAAAAAAAAAAAAAAAAAAAAbAAAAAgAAAAAAAAAAAAAAAAAAAB4AAAACAAAAAAAAAAAAAAAAAAAAIQAAAAIAAAAAAAAAAAAAAAAAAAAhAAAAAgAAAAAAAAAAAAAAAAAAACEAAAACAAAAAAAAAAAAAAAAAAAAIQAAAADh83+YSAEAAAMAGBv8eQADAGQAHwABgwP//gH0EAcqACwIA3/gABgAXogAcgYQAAAAAAAAAAAAAAAAAAAAAAAADQAAAAMAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAIAAAAAAAAAAAAAAAAAAAA' },
                            ]
                        },
                    ],
                },
            ],
        },
    ],
};
