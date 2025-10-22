/**
 * @file This file defines the master list of all applications available in DurgasOS.
 * It aggregates the components, icons, and metadata for each app.
 * This structure prevents circular dependencies.
 */
import React from 'react';
import type { AppDefinition } from '../types';

// Import all app components from their dedicated file
import {
    AboutMeApp,
    PortfolioApp,
    GeminiChatApp,
    CreatorStudioApp,
    LiveAssistantApp,
    BrowserApp,
    SettingsApp,
    FileExplorerApp,
    NotepadApp,
    TerminalApp,
    VideoPlayerApp
} from './components';

// Import all app icons from the constants file
import {
    AboutIcon,
    PortfolioIcon,
    GeminiChatIcon,
    CreatorStudioIcon,
    LiveAssistantIcon,
    BrowserIcon,
    SettingsIcon,
    FileExplorerIcon,
    NotepadIcon,
    TerminalIcon,
    VideoPlayerIcon
} from '../constants';

/**
 * The master list of all applications available in DurgasOS.
 * This array is used to populate the desktop, start menu, and handle app opening.
 */
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
  { id: 'videoPlayer', name: 'Video Player', icon: <VideoPlayerIcon />, component: VideoPlayerApp },
];
