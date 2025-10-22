/**
 * @file This component orchestrates the main user interface of the operating system.
 */
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Desktop } from './Desktop';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { DurgasAssistant } from './DurgasAssistant';

/**
 * The OSInterface component is the primary container for all visual elements of the OS,
 * including the desktop, windows, taskbar, start menu, and the assistant UI.
 * It applies the current theme and accent color to the entire environment.
 * @returns {React.ReactElement} The main OS interface.
 */
export const OSInterface: React.FC = () => {
    const { windows, theme, accentColor } = useAppContext();
    const [startMenuOpen, setStartMenuOpen] = useState(false);

    return (
        <div
            className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] font-sans"
            data-theme={theme}
            style={{ '--accent-color': accentColor.hex } as React.CSSProperties}
        >
            <Desktop onBackdropClick={() => setStartMenuOpen(false)} />
            {windows.map(win => <Window key={win.id} win={win} />)}
            <Taskbar onToggleStartMenu={() => setStartMenuOpen(v => !v)} />
            {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}
            <DurgasAssistant />
        </div>
    );
};
