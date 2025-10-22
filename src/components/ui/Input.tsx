/**
 * @file Defines a standardized Input component for the OS.
 */
import React from 'react';

/**
 * A styled text input component.
 * It inherits all standard input attributes.
 * @param {React.InputHTMLAttributes<HTMLInputElement>} props - Standard input props.
 * @returns {React.ReactElement} The styled input component.
 */
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-white ${className}`} {...props} />
);
