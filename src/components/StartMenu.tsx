/**
 * @file Defines the Start Menu component, which provides app launching and search functionality.
 */
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { APPS } from '../apps/index';
import { AppDefinition, FileSystemNode } from '../types';
import { Icon } from './Icon';

/**
 * The Start Menu component.
 * Features a search bar for apps and files, a grid of pinned apps, and a recommended section.
 * @param {object} props - The component props.
 * @param {() => void} props.onClose - Callback to close the start menu.
 * @returns {React.ReactElement} The rendered start menu.
 */
export const StartMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { openApp, fileSystem } = useAppContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{apps: AppDefinition[], files: FileSystemNode[]}>({apps: [], files: []});

    // Effect to perform search whenever the query changes.
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults({ apps: [], files: [] });
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const filteredApps = APPS.filter(app => app.name.toLowerCase().includes(lowerQuery));
        
        const foundFiles: FileSystemNode[] = [];
        const searchFS = (node: FileSystemNode, path: string) => {
            if (node.name.toLowerCase().includes(lowerQuery)) {
                foundFiles.push({ ...node, content: path }); // Use content to store path
            }
            if (node.children) {
                node.children.forEach(child => searchFS(child, `${path}/${child.name}`));
            }
        };
        searchFS(fileSystem, 'C:');
        
        setSearchResults({ apps: filteredApps, files: foundFiles });

    }, [searchQuery, fileSystem]);

    const handleFileClick = (file: FileSystemNode) => {
        const pathParts = file.content?.split('/') ?? [];
        openApp('fileExplorer', { initialPath: pathParts.slice(1).join('/') });
        onClose();
    }

    return (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-auto max-h-[70vh] bg-black/40 backdrop-blur-2xl rounded-lg p-6 flex flex-col gap-6 text-white z-40 animate-slide-up"
             onClick={(e) => e.stopPropagation()}>
            <style>{`
                @keyframes slide-up {
                    from { transform: translate(-50%, 20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.2s ease-out; }
            `}</style>
            <input 
                type="text" 
                placeholder="Type here to search" 
                className="w-full bg-slate-700/80 p-2 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
            />
            <div className="overflow-y-auto pr-2">
                {searchQuery.trim() ? (
                    <>
                        {searchResults.apps.length > 0 && <h2 className="text-lg font-semibold mb-2 text-gray-300">Apps</h2>}
                        {searchResults.apps.map(app => (
                            <div key={app.id} onClick={() => { openApp(app.id); onClose(); }} className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 cursor-pointer">
                               <div className="w-8 h-8 flex items-center justify-center">{app.icon}</div> <span>{app.name}</span>
                            </div>
                        ))}
                        {searchResults.files.length > 0 && <h2 className="text-lg font-semibold my-2 text-gray-300">Files & Folders</h2>}
                         {searchResults.files.map(file => (
                            <div key={file.id} onClick={() => handleFileClick(file)} className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 cursor-pointer">
                               <div className="w-8 h-8 flex items-center justify-center text-2xl">{file.type === 'FOLDER' ? '📁' : '📄'}</div> <span>{file.name}</span>
                            </div>
                        ))}
                        {searchResults.apps.length === 0 && searchResults.files.length === 0 && <p className="text-center text-gray-400">No results found.</p>}
                    </>
                ) : (
                    <>
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Pinned</h2>
                            <div className="grid grid-cols-5 sm:grid-cols-6 gap-4">
                                {APPS.filter(app => app.id !== 'notepad').slice(0, 12).map(app => <div key={app.id} onClick={onClose}><Icon app={app} type="start-menu" /></div>)}
                            </div>
                        </div>
                         <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-4">Recommended</h2>
                            <div className="bg-slate-700/50 p-4 rounded-md h-48 flex items-center justify-center">
                                <p className="text-sm text-slate-300">Your recent files and apps will show up here.</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
