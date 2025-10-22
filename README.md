# DurgasOS - The Gemini Powered Desktop

Welcome to DurgasOS, a fully interactive, web-based desktop operating system simulator powered by the comprehensive suite of Google Gemini APIs. This project replicates a complete Windows 11-style user experience, from the boot sequence to a functional desktop environment with a variety of AI-driven applications.

![DurgasOS Desktop Screenshot](https://storage.googleapis.com/aistudio-project-images/b1897b5e-0125-452f-a0b4-3c66f2a6e9a0.png)

## ✨ Features

DurgasOS is packed with features that showcase a modern desktop environment seamlessly integrated with powerful AI capabilities.

### 🖥️ Core Desktop Experience
- **Window Management:** Draggable, resizable, and focus-aware windows for a true multi-tasking feel.
- **Taskbar & Start Menu:** A familiar taskbar with a functional Start Menu for launching applications and searching for files.
- **Virtual File System:** A complete file explorer to navigate a virtual file system, create folders, and open files with associated applications (Notepad, Video Player).
- **Personalization:** A settings app to customize the OS appearance, including light/dark themes, accent colors, and desktop wallpapers.
- **Command Line:** A built-in terminal for interacting with the file system using classic commands (`ls`, `cd`, `cat`, `pwd`, etc.).

### 🧠 Gemini-Powered Applications
- **Gemini Chat:** Engage in multi-turn conversations with various Gemini models (`gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-pro`) with an integrated Text-to-Speech feature to voice Gemini's responses.
- **Creator Studio:** A versatile multimedia toolkit:
    - **Image Generation:** Create images from text prompts with `imagen-4.0`.
    - **Image Editing:** Modify existing images using `gemini-2.5-flash-image`.
    - **Image & Video Analysis:** Ask questions about the content of images and videos.
    - **Audio Transcription:** Transcribe spoken words from audio files.
- **Live Assistant:** Experience real-time, low-latency voice conversations with Gemini's Live API, complete with live transcription.
- **Gemini Browser:** An intelligent browser that uses Google Search and Google Maps grounding to provide up-to-date, verifiable answers to your questions, complete with source links.

### 🗣️ Durgas Voice Assistant
- **Wake-Word Activation:** Simply say "Durgas" to activate the assistant without clicking anything.
- **OS Control:** Give commands to control the operating system, such as "Open the Creator Studio," "Close all apps," or "Switch to the dark theme."
- **Function Calling:** The assistant leverages Gemini's function calling capabilities to understand your intent and interact with the OS's internal functions.
- **Natural Language Responses:** The assistant provides helpful, spoken responses using Gemini's TTS capabilities.

## 🛠️ Tech Stack

- **Frontend:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI:** [Google Gemini API (@google/genai)](https://ai.google.dev/)
- **State Management:** React Context API

## 📂 Project Structure

The codebase is organized into a modular and maintainable structure within the `src/` directory:

```
src/
├── apps/         # Contains all application components and the master app list.
├── assets/       # Static assets like images or videos.
├── components/   # Core UI components (Window, Taskbar, Desktop, etc.) and reusable UI elements.
├── constants/    # Static data (icons, themes, initial file system structure).
├── contexts/     # Global state management via AppContext.
├── hooks/        # Custom React hooks (e.g., useAppContext).
├── services/     # API interaction layer (geminiService.ts) and assistant tool definitions.
├── types/        # TypeScript type definitions.
├── utils/        # Utility functions (e.g., file converters, audio decoders).
├── App.tsx       # Root component that handles the boot sequence.
└── index.tsx     # Main application entry point.
```

## 🚀 Getting Started

Follow these steps to get a local copy of DurgasOS up and running.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/).

### Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/durgasos.git
   ```
2. **Navigate to the project directory:**
   ```sh
   cd durgasos
   ```
3. **Install dependencies:**
   ```sh
   npm install
   ```
4. **Set up your environment variables:**
   Create a file named `.env` in the root of the project and add your Google Gemini API key:
   ```
   API_KEY=YOUR_GEMINI_API_KEY
   ```
   *Note: This project is configured to use this environment variable directly. No further code changes are needed.*

5. **Start the development server:**
   ```sh
   npm start
   ```
   The application will be available at `http://localhost:3000` (or another port if 3000 is busy).

## 🙏 Acknowledgements
- Wallpapers sourced from [Unsplash](https://unsplash.com/).
- Built with the powerful and versatile [Google Gemini API](https://ai.google.dev/).
