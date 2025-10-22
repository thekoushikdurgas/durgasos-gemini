/**
 * @file Defines a standardized Title component for application headers.
 */
import React from 'react';

/**
 * A styled H1 component for use as a title in application windows.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The text content of the title.
 * @returns {React.ReactElement} The title component.
 */
export const Title: React.FC<{children: React.ReactNode}> = ({ children }) => <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">{children}</h1>;
