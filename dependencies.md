# DurgasOS Dependencies

This document outlines the core libraries, frameworks, and tools used to build the DurgasOS project. Understanding these dependencies is key to working with the codebase.

---

## 🚀 Core Framework

These libraries form the fundamental building blocks of the user interface.

-   **[React](https://react.dev/)**: The core UI library used for building the component-based architecture of the entire operating system, from individual icons to complex application windows.
-   **[React DOM](https://react.dev/learn/add-react-to-an-existing-project#step-2-render-react-components)**: The library that provides the DOM-specific methods to render React components into the browser. It acts as the bridge between React's virtual DOM and the actual HTML DOM.

---

## 🧠 Artificial Intelligence

This is the primary dependency for all AI-powered features in DurgasOS.

-   **[@google/genai](https://www.npmjs.com/package/@google/genai)**: The official Google Gemini API client library for JavaScript/TypeScript. It is used for all interactions with the Gemini models, including:
    -   Chat completions (`ai.chats.create`).
    -   Image generation (`ai.models.generateImages`).
    -   Vision (image/video analysis) (`ai.models.generateContent`).
    -   Text-to-Speech (`gemini-2.5-flash-preview-tts`).
    -   Function calling and search/maps grounding.
    -   The low-latency Live API for real-time voice conversations (`ai.live.connect`).

---

## 🎨 Styling

This section covers the tools used for the visual appearance of the OS.

-   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework used for all styling within the application. It allows for rapid development of the complex, modern UI of DurgasOS directly within the JSX of the components. The application uses a CDN version for simplicity.

---

## 🛠️ Development & Build Tools

These tools are essential for the development workflow, providing type safety and enabling the use of modern JavaScript features.

-   **[TypeScript](https://www.typescriptlang.org/)**: A superset of JavaScript that adds static typing to the language. It is used throughout the project (`.ts`, `.tsx` files) to improve code quality, maintainability, and developer experience by catching errors early.
-   **Build Tooling (e.g., Vite, esbuild)**: The project is set up to use modern JavaScript modules and JSX syntax. This implies a build tool is used in the development environment to transpile TypeScript/JSX into standard JavaScript that the browser can execute.
