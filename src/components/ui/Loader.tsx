/**
 * @file Defines a simple loading spinner component.
 */
import React from 'react';

/**
 * A reusable loading spinner component for indicating background activity.
 * @returns {React.ReactElement} The loader component.
 */
export const Loader: React.FC = () => <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>;
