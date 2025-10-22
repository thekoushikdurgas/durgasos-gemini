
import type * as React from 'react';

export interface AppDefinition {
  id: string;
  name: string;
  // FIX: Use React.ReactNode to avoid issues with the JSX namespace in a .ts file.
  icon: React.ReactNode;
  component: React.FC<any>; // Allow components to accept props
}

export interface WindowInstance {
  id: string;
  appId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  data?: Record<string, any>; // For passing initial props to app components
}

export interface Message {
  sender: 'user' | 'gemini';
  text: string;
  isThinking?: boolean;
}

export interface GroundingChunk {
  web?: {
      uri: string;
      title: string;
  };
  maps?: {
      uri: string;
      title: string;
  };
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export type Theme = 'light' | 'dark';

export interface AccentColor {
  name: string;
  hex: string;
}

export type FileSystemNodeType = 'FILE' | 'FOLDER';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileSystemNodeType;
  children?: FileSystemNode[];
  content?: string; // for files, or to store path during search
}
