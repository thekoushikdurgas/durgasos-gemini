/**
 * @file Defines a standardized TextArea component for the OS.
 */
import React from 'react';

/**
 * A styled textarea component.
 * It inherits all standard textarea attributes.
 * @param {React.TextareaHTMLAttributes<HTMLTextAreaElement>} props - Standard textarea props.
 * @returns {React.ReactElement} The styled textarea component.
 */
export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
    <textarea className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-white ${className}`} {...props} />
);
