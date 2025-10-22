
import React from 'react';
import type { AppDefinition, WindowInstance, AccentColor, FileSystemNode } from './types';

// --- ICONS (as JSX) ---
const AboutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-cyan-400" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>;
const PortfolioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-green-400" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>;
const GeminiChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-purple-400" viewBox="0 0 24 24"><path d="M15 4v16l-2-2-2 2-2-2-2 2-2-2-3 3V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2z"/></svg>;
const CreatorStudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-orange-400" viewBox="0 0 24 24"><path d="M12 2.5a.5.5 0 01.5.5v2.5a.5.5 0 01-1 0V3a.5.5 0 01.5-.5zM8.5 4.134a.5.5 0 01.5.866l-1.5 2.598a.5.5 0 11-.866-.5l1.5-2.598a.5.5 0 01.366-.366zM15.5 4.134a.5.5 0 01.366.366l1.5 2.598a.5.5 0 01-.866.5l-1.5-2.598a.5.5 0 01.5-.866zM4.134 8.5a.5.5 0 01.866.5l-2.598 1.5a.5.5 0 11-.5-.866l2.598-1.5a.5.5 0 01.366-.366zM19.866 8.5a.5.5 0 01.366.366l2.598 1.5a.5.5 0 01-.5.866l-2.598-1.5a.5.5 0 01.866-.5zM3 12.5a.5.5 0 01.5-.5h2.5a.5.5 0 010 1H3.5a.5.5 0 01-.5-.5zM18 12.5a.5.5 0 01.5-.5h2.5a.5.5 0 010 1H18.5a.5.5 0 01-.5-.5zM8.5 20.866a.5.5 0 01-.5-.866l1.5-2.598a.5.5 0 01.866.5l-1.5 2.598a.5.5 0 01-.366.366zM15.5 20.866a.5.5 0 01-.366-.366l-1.5-2.598a.5.5 0 11.866-.5l1.5 2.598a.5.5 0 01-.5.866zM12 21.5a.5.5 0 01-.5-.5v-2.5a.5.5 0 011 0V21a.5.5 0 01-.5-.5z"/></svg>;
const LiveAssistantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-red-400" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>;
const BrowserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-blue-400" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1h-2v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2 .9 2 2v5.41c0 .89-.38 1.7-1.1 2.22z"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-gray-400" viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>;
const FileExplorerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-yellow-500" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>;
const NotepadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-white" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 14h-8v-2h8v2zm0-4h-8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>;


// --- LAZY IMPORT APP COMPONENTS ---
import { AboutMeApp, PortfolioApp, GeminiChatApp, CreatorStudioApp, LiveAssistantApp, BrowserApp, SettingsApp, FileExplorerApp, NotepadApp } from './apps';


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
];

// --- INITIAL STATE ---
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

// --- SETTINGS CONSTANTS ---
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

// --- FILE SYSTEM ---
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
                        { id: 'pictures', name: 'Pictures', type: 'FOLDER', children: [] },
                    ],
                },
            ],
        },
    ],
};
