# DurgasOS Application Suite

This document provides an overview of all the native applications built into DurgasOS. Each application is designed to showcase specific capabilities of the Google Gemini API within a familiar desktop environment.

---

### 🖥️ Core Applications

These applications provide the essential functionalities of the desktop experience.

#### **File Explorer**
The File Explorer is a comprehensive tool for managing the virtual file system.

-   **Features:**
    -   Navigate through a hierarchical folder structure.
    -   Double-click to open files in their associated applications (e.g., `.txt` in Notepad, `.mp4` in Video Player).
    -   Right-click context menu for file and folder operations.
    -   Create new folders.
    -   Rename and delete files and folders.
    -   A details pane to preview selected items.

#### **Settings**
The Settings app allows for personalization of the DurgasOS environment.

-   **Features:**
    -   Switch between `light` and `dark` UI themes.
    -   Select from a variety of accent colors that apply system-wide.
    -   Change the desktop wallpaper from a predefined gallery.

#### **Notepad**
A simple, fast, and clean text file viewer.

-   **Features:**
    -   Opens `.txt` files from the File Explorer.
    -   Displays file content in a read-only view.

#### **Terminal**
A command-line interface for power users to interact with the virtual file system.

-   **Features:**
    -   Executes common shell commands: `ls`, `cd`, `pwd`, `cat`, `echo`, `clear`.
    -   Maintains a command history for the session.

#### **Video Player**
A lightweight media player for video files stored in the virtual file system.

-   **Features:**
    -   Plays `.mp4` files.
    -   Basic playback controls: play/pause, seek bar, volume control.
    -   Full-screen mode.

---

### 🧠 Gemini-Powered Applications

These applications are specifically designed to highlight the power and versatility of the Google Gemini API.

#### **Gemini Chat**
A classic chat interface for multi-turn conversations with Gemini.

-   **Features:**
    -   Model selection: Choose between `gemini-2.5-flash-lite` (fastest), `gemini-2.5-flash` (balanced), and `gemini-2.5-pro` (advanced reasoning with a thinking budget).
    -   Maintains conversation history within the session.
-   **Gemini APIs Used:**
    -   **Chat:** `ai.chats.create()` and `chat.sendMessage()` for conversational AI.
    -   **Text-to-Speech:** `gemini-2.5-flash-preview-tts` to read responses aloud, enhancing accessibility and user experience.

#### **Creator Studio**
A multi-functional creative suite for multimedia generation and analysis.

-   **Features:**
    -   **Generate Image:** Create high-quality images from text prompts with various aspect ratios.
    -   **Edit Image:** Perform in-painting and out-painting style edits on an existing image using a text prompt.
    -   **Analyze Image/Video:** Upload an image or video and ask complex questions about its content.
    -   **Transcribe Audio:** Convert spoken words from an audio file into text.
-   **Gemini APIs Used:**
    -   **Image Generation:** `imagen-4.0-generate-001` for text-to-image creation.
    -   **Image Editing:** `gemini-2.5-flash-image` for prompt-based image manipulation.
    -   **Vision (Image/Video Analysis):** `gemini-2.5-flash` and `gemini-2.5-pro` models to understand and reason about visual content.
    -   **Transcription:** `gemini-2.5-flash` for audio-to-text conversion.

#### **Live Assistant**
An application for real-time, low-latency voice conversations with Gemini.

-   **Features:**
    -   Starts a continuous, bidirectional audio stream.
    -   Displays live, streaming transcriptions of both the user's speech and Gemini's response.
    -   Provides a natural, human-like conversational experience.
-   **Gemini APIs Used:**
    -   **Live API:** `ai.live.connect()` using the `gemini-2.5-flash-native-audio-preview-09-2025` model for real-time interaction.
    -   **Live Transcription:** The `inputAudioTranscription` and `outputAudioTranscription` features of the Live API are enabled.

#### **Gemini Browser**
An intelligent browser that grounds its responses in real-time data from the web.

-   **Features:**
    -   Answers questions about recent events, news, or any topic requiring up-to-date information.
    -   Option to ground queries in Google Maps data for location-based questions.
    -   Displays a list of source links from the web that were used to generate the answer, ensuring verifiability.
-   **Gemini APIs Used:**
    -   **Search Grounding:** `tools: [{googleSearch: {}}]` to connect Gemini's reasoning to Google Search.
    -   **Maps Grounding:** `tools: [{googleMaps: {}}]` for place-based information.

---

### 🗣️ The Durgas Assistant (Integrated OS Feature)

While not a standalone application, the Durgas Assistant is a core OS feature accessible from the taskbar or via a wake word.

-   **Features:**
    -   **Voice Commands:** Control the OS using natural language (e.g., "Open Notepad," "Create a folder on the desktop").
    -   **Wake-Word Activation:** Activate the assistant hands-free by saying "Durgas."
    -   **Visual Feedback:** An animated orb UI provides feedback on the assistant's state (listening, thinking, speaking).
-   **Gemini APIs Used:**
    -   **Function Calling:** The model is provided with a set of "tools" (e.g., `openApp`, `setSystemTheme`) that it can choose to call based on the user's command. This allows the AI to interact directly with the OS's functions.
    -   **Text-to-Speech:** `gemini-2.5-flash-preview-tts` is used to voice the assistant's responses.
