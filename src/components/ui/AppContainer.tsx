
import React from 'react';

export const AppContainer: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`h-full w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 overflow-y-auto ${className}`}>
        {children}
    </div>
);