/**
 * @file Defines a standardized Button component for the OS.
 */
import React from 'react';

/**
 * A styled button component that uses the current accent color.
 * It inherits all standard button attributes.
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props - Standard button props.
 * @returns {React.ReactElement} The styled button component.
 */
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button className={`bg-[var(--accent-color)] hover:opacity-90 text-white font-bold py-2 px-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`} {...props}>
        {children}
    </button>
);
