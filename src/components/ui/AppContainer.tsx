/**
 * @file Defines a generic container component for application content.
 */
import React from 'react';

/**
 * A reusable container for application windows.
 * It provides consistent padding, background color, and scrolling behavior.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be rendered inside the container.
 * @param {string} [props.className] - Optional additional CSS classes.
 * @returns {React.ReactElement} The app container component.
 */
export const AppContainer: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`h-full w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 overflow-y-auto ${className}`}>
        {children}
    </div>
);
