# DurgasOS Codebase Structure

This document provides a detailed overview of the project's architecture. It is intended to help developers understand the organization of the codebase, the role of each directory, and the flow of data and state throughout the application.

## 🌳 Root Directory

The root directory contains the main configuration files and the entry point for the application.

-   `index.html`: The single HTML file for this single-page application (SPA). It includes the root div where the React app is mounted and imports the necessary scripts.
-   `package.json`: Defines project metadata, dependencies, and scripts.
-   `metadata.json`: Specifies application metadata and permissions required for the execution environment (e.g., microphone access).
-   `README.md`: The main project documentation you are currently reading.
-   `structure.md`: This file, detailing the codebase architecture.
-   `src/`: The heart of the application, containing all the React source code.

---

## 📂 `src/` Directory Structure

The `src` directory is organized by feature and responsibility to ensure a clean, scalable, and maintainable codebase.

### `src/index.tsx`

The main entry point for the React application. Its sole responsibility is to find the `#root` element in `index.html` and render the root `<App />` component into it.

### `src/App.tsx`

The top-level React component. It manages the initial boot sequence (displaying the `BootScreen`) and wraps the entire application in the `AppProvider` to make global state available everywhere.

### `src/types/`

-   **`index.ts`**: A central file containing all TypeScript type and interface definitions used across the application (e.g., `AppDefinition`, `WindowInstance`, `FileSystemNode`). This promotes type safety and reusability.

### `src/constants/`

-   **`index.tsx`**: A repository for all static, unchanging data. This includes:
    -   **Icons:** SVG icons defined as React components.
    -   **Initial State:** The default window that appears on boot (`defaultWindows`).
    -   **Settings Constants:** Arrays of available `WALLPAPERS` and `ACCENT_COLORS`.
    -   **Initial File System:** The default directory and file structure (`initialFileSystem`).

### `src/contexts/`

-   **`AppContext.tsx`**: This is the core of the application's state management. It uses React's Context API to create a global state provider (`AppProvider`). This provider manages and distributes all shared state and logic, including:
    -   Window management (opening, closing, focusing).
    -   Theme and appearance settings.
    -   The virtual file system state and manipulation functions.
    -   The state and logic for both the Live Assistant (real-time conversation) and the Durgas Assistant (voice commands).

### `src/hooks/`

-   **`useAppContext.ts`**: A custom hook that simplifies accessing the `AppContext`. It provides a clean, reusable way for any component to consume the global state without needing to import `useContext` and `AppContext` directly.

### `src/services/`

This directory acts as the API layer, isolating external communications.

-   **`geminiService.ts`**: A singleton class that encapsulates all interactions with the Google Gemini API. It provides methods for chat, image generation, content analysis, TTS, grounding, and the Live API. Centralizing this logic makes the rest of the app unaware of the specific API implementation details.
-   **`assistantTools.ts`**: Defines the function declarations (the "tools") that the Durgas Assistant can use. This file essentially creates the schema that the Gemini model uses to understand how it can interact with the OS (e.g., `openApp`, `createFolder`).

### `src/utils/`

-   **`index.ts`**: A collection of pure, reusable utility functions that don't fit into a more specific category. This includes functions for file-to-base64 conversion and audio data encoding/decoding.

### `src/components/`

This directory contains all the core UI components that form the operating system's shell.

-   **`OSInterface.tsx`**: The main layout component that assembles the `Desktop`, `Window`, `Taskbar`, and other core elements.
-   **`BootScreen.tsx`**: The initial loading screen.
-   **`Desktop.tsx`**: Renders the wallpaper and desktop icons.
-   **`Window.tsx`**: The draggable, resizable container for all applications.
-   **`Taskbar.tsx`**: The bar at the bottom of the screen.
-   **`StartMenu.tsx`**: The pop-up menu for launching apps and searching.
-   **`Icon.tsx`**: A versatile component for app icons that adapts its style based on its location (desktop, taskbar, or start menu).
-   **`DurgasAssistant.tsx`**: The UI for the voice assistant, visualizing its state (listening, thinking, etc.).
-   **`ui/`**: A subdirectory for generic, reusable UI components like `Button.tsx`, `Input.tsx`, `Loader.tsx`, etc. These components are styled according to the OS theme but contain no application-specific logic.

### `src/apps/`

This directory contains the logic and UI for all the individual applications that can run within DurgasOS.

-   **`components.tsx`**: This file contains the actual React components for every single application (e.g., `GeminiChatApp`, `CreatorStudioApp`, `FileExplorerApp`). Keeping them in one file simplifies imports.
-   **`index.tsx`**: This file defines the master list of all applications (`APPS`). It imports the components from `components.tsx` and the icons from `constants` and maps them to an `AppDefinition` object. This central registry is used by the Start Menu, Desktop, and window management system to know what applications are available and how to render them. This separation prevents circular dependency issues.
