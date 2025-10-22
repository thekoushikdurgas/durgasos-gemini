/**
 * @file Defines a standardized Select (dropdown) component for the OS.
 */
import React from 'react';

/**
 * A styled select dropdown component.
 * It inherits all standard select attributes.
 * @param {React.SelectHTMLAttributes<HTMLSelectElement>} props - Standard select props.
 * @returns {React.ReactElement} The styled select component.
 */
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, className, ...props }) => (
    <select className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-white ${className}`} {...props}>
        {children}
    </select>
);
