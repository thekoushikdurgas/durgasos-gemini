# DurgasOS Internal Packages & Modules

This document provides a manifest of all key internal modules (files) within the DurgasOS codebase. It serves as a quick reference for understanding the role of each component, service, and context.

---

## 📂 Core Application Logic

These files are the foundation of the application's startup and global state.

-   **`src/index.tsx`**: The main entry point that renders the React application into the DOM.
-   **`src/App.tsx`**: The root React component. It manages the boot sequence and wraps the entire OS in the `AppProvider`.
-   **`src/contexts/AppContext.tsx`**: The heart of the application. This context provider manages all global state, including window management, theming, the file system, and the state for both the Live and Durgas assistants.
-   **`src/hooks/useAppContext.ts`**: A custom hook for easy and type-safe access to the `AppContext` from any component.

---

## 🖥️ OS Shell & UI Components

These modules build the core desktop interface and experience.

-   **`src/components/OSInterface.tsx`**: The main component that assembles the desktop, windows, and taskbar into a cohesive user interface.
-   **`src/components/BootScreen.tsx`**: The component displayed during the initial simulated boot-up.
-   **`src/components/Desktop.tsx`**: Renders the wallpaper and the grid of application icons.
-   **`src/components/Window.tsx`**: A generic, reusable component that provides the draggable, resizable, and focusable frame for all applications.
-   **`src/components/Taskbar.tsx`**: Renders the taskbar at the bottom of the screen, including the start button, assistant button, open app icons, and the clock.
-   **`src/components/StartMenu.tsx`**: The component for the start menu, including app search and pinned applications.
-   **`src/components/DurgasAssistant.tsx`**: The UI for the voice assistant, which provides visual feedback on its current state (listening, thinking, etc.).
-   **`src/components/ui/`**: A directory of generic, reusable UI components (`Button`, `Input`, `Loader`, etc.) used consistently across all applications.

---

## 🧠 Services & API Layer

This layer is responsible for all external communication and business logic.

-   **`src/services/geminiService.ts`**: A singleton class that centralizes all communication with the Google Gemini API. It provides clean methods for chat, image generation, vision, TTS, and more.
-   **`src/services/assistantTools.ts`**: Defines the function declarations (the "tools") that the Durgas Assistant can use, enabling Gemini to interact with the OS's functions.

---

## 🧩 Applications

These modules define the applications that run inside DurgasOS.

-   **`src/apps/index.tsx`**: The central registry for all applications. It creates the master `APPS` array, mapping app IDs to their respective icons and components.
-   **`src/apps/components.tsx`**: Contains the actual React components for every application, from the simple `AboutMeApp` to the complex, multi-tab `CreatorStudioApp` and `FileExplorerApp`.

---

## ⚙️ Utilities, Types, and Constants

These files provide shared resources, definitions, and static data used throughout the codebase.

-   **`src/types/index.ts`**: A central file for all TypeScript type definitions, ensuring type safety and consistency across the project.
-   **`src/constants/index.tsx`**: A collection of all static data, such as icon components, wallpaper URLs, accent color codes, and the initial file system structure.
-   **`src/utils/index.ts`**: A set of pure, reusable utility functions, such as base64 encoders/decoders and audio data processors.
