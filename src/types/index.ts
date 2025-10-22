/**
 * @file This file contains all the core type definitions for the DurgasOS application.
 */
import type * as React from 'react';

/**
 * Defines the structure for an application that can be opened in DurgasOS.
 */
export interface AppDefinition {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.FC<any>; 
}

/**
 * Represents an active instance of an application window on the desktop.
 */
export interface WindowInstance {
  id: string;
  appId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  data?: Record<string, any>;
}

/**
 * Represents a single message in a chat interface.
 */
export interface Message {
  sender: 'user' | 'gemini';
  text: string;
  isThinking?: boolean;
}

/**
 * Represents a grounding chunk from a Gemini search-grounded response, containing source URLs.
 */
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

/**
 * Defines the allowed aspect ratios for image generation.
 */
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

/**
 * Defines the available UI themes.
 */
export type Theme = 'light' | 'dark';

/**
 * Defines the structure for an accent color option.
 */
export interface AccentColor {
  name: string;
  hex: string;
}

/**
 * Defines the types of nodes in the file system.
 */
export type FileSystemNodeType = 'FILE' | 'FOLDER';

/**
 * Represents a node (file or folder) in the virtual file system.
 */
export interface FileSystemNode {
  id: string;
  name: string;
  type: FileSystemNodeType;
  children?: FileSystemNode[];
  content?: string; // Base64 content for files, or temporary path for search results
}

/**
 * Defines the possible states for the Durgas voice assistant.
 */
export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
