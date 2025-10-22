
import React from 'react';

export const BootScreen: React.FC = () => (
    <div className="bg-black h-screen w-screen flex flex-col justify-center items-center gap-4 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 48 48" className="w-24 h-24"><path d="M6 38h14V24H6v14zm0-16h14V8H6v14zm16 16h14V24H22v14zm0-16h14V8H22v14z"/></svg>
        <p className="text-xl">Starting DurgasOS</p>
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
    </div>
);