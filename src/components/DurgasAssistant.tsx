/**
 * @file Defines the UI component for the Durgas Assistant, visualizing its state.
 */
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { DurgasAssistantIcon } from '../constants';

/**
 * The UI for the Durgas voice assistant.
 * It appears when the assistant is active (listening, thinking, speaking, or in an error state)
 * and provides visual feedback to the user. It also displays the current transcript.
 * @returns {React.ReactElement | null} The assistant UI or null if idle.
 */
export const DurgasAssistant: React.FC = () => {
    const { assistantState, assistantTranscript } = useAppContext();

    if (assistantState === 'idle') {
        return null;
    }

    /** Determines the CSS classes for the orb based on the assistant's state. */
    const getStateStyles = () => {
        switch (assistantState) {
            case 'listening':
                return 'border-cyan-400 animate-pulse-strong';
            case 'thinking':
                return 'border-purple-400 animate-spin';
            case 'speaking':
                return 'border-green-400 animate-glow';
            case 'error':
                 return 'border-red-500';
            default:
                return 'border-gray-500';
        }
    };
    
    /** Gets the status message corresponding to the assistant's state. */
    const getStateMessage = () => {
        switch (assistantState) {
             case 'listening': return 'Listening...';
             case 'thinking': return 'Thinking...';
             case 'speaking': return 'Speaking...';
             case 'error': return 'An error occurred.';
             default: return '';
        }
    }

    return (
        <div className="absolute bottom-16 right-5 z-[100] flex flex-col items-center gap-4 pointer-events-none">
            <style>{`
                @keyframes pulse-strong {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                }
                .animate-pulse-strong { animation: pulse-strong 1.5s infinite ease-in-out; }

                @keyframes glow {
                     0%, 100% { box-shadow: 0 0 10px ${assistantState === 'speaking' ? '#4ade80' : 'transparent'}; }
                     50% { box-shadow: 0 0 25px ${assistantState === 'speaking' ? '#4ade80' : 'transparent'}; }
                }
                .animate-glow { animation: glow 2s infinite ease-in-out; }
            `}</style>
            
            <div className={`bg-black/70 text-white p-3 rounded-lg shadow-lg max-w-sm text-center transition-opacity duration-300 ${assistantTranscript || assistantState !== 'listening' ? 'opacity-100' : 'opacity-0'}`}>
                {assistantTranscript || getStateMessage()}
            </div>

            <div className={`relative w-24 h-24 rounded-full bg-black/50 border-4 flex items-center justify-center transition-all duration-300 ${getStateStyles()}`}>
                 <div className="w-12 h-12 text-white">
                    <DurgasAssistantIcon />
                </div>
            </div>
        </div>
    );
};
