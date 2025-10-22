
import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button className={`bg-[var(--accent-color)] hover:opacity-90 text-white font-bold py-2 px-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`} {...props}>
        {children}
    </button>
);