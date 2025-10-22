
import React from 'react';

export const Title: React.FC<{children: React.ReactNode}> = ({ children }) => <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">{children}</h1>;