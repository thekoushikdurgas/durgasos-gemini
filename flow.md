# DurgasOS Data and Control Flow

This document outlines the primary data and control flows within the DurgasOS application. It explains how user actions trigger state changes, how state is managed globally, and how the application interacts with the Google Gemini API.

## 1. Application Bootstrapping

The application starts like a standard React SPA and goes through a simulated boot sequence.

**`index.html` -> `src/index.tsx` -> `src/App.tsx` -> `src/components/BootScreen.tsx` -> `src/components/OSInterface.tsx`**

1.  **`index.html`**: The browser loads the single HTML page.
2.  **`src/index.tsx`**: The main script entry point mounts the React application into the `<div id="root">`.
3.  **`src/App.tsx`**: The root component initializes. It sets a `booting` state to `true`.
4.  **`src/components/BootScreen.tsx`**: While `booting` is `true`, this component is rendered, showing a loading animation.
5.  **Timeout**: After a 2.5-second delay, the `booting` state is set to `false`.
6.  **`src/contexts/AppContext.tsx`**: The `AppProvider` is rendered, which initializes all global state (windows, theme, file system, etc.).
7.  **`src/components/OSInterface.tsx`**: This component, wrapped by `AppProvider`, renders the main desktop UI, including the `Desktop`, `Taskbar`, and any default `Window` components.

---

## 2. Global State Management: The AppContext Hub

The entire OS relies on a centralized state management system provided by `src/contexts/AppContext.tsx`.

-   **Provider (`AppProvider`)**: This component holds all the global `useState`, `useRef`, and `useCallback` hooks that manage the OS's state. This includes the list of open windows, the current theme, the file system tree, and the state of the AI assistants.
-   **Hook (`useAppContext`)**: Components throughout the application use this custom hook to access both the state values (e.g., `windows`, `theme`) and the functions to modify that state (e.g., `openApp`, `setTheme`).
-   **One-Way Data Flow**: When an action is called (e.g., `openApp`), it updates the state within `AppContext`. React then re-renders all components that consume that specific piece of state, ensuring the UI is always in sync with the application's state.

---

## 3. Core UI Interaction Flow: Opening an App

This flow demonstrates how a simple user action propagates through the system.

**User Action -> Component Event -> Context Function -> State Update -> UI Re-render**

1.  **User Action**: The user double-clicks an `Icon` on the `Desktop`.
2.  **Component Event**: The `onDoubleClick` event handler in the `src/components/Icon.tsx` component is triggered.
3.  **Context Function**: The event handler calls the `openApp(app.id)` function, which it gets from the `useAppContext` hook.
4.  **State Update**: Inside `AppContext`, the `openApp` function updates the `windows` state array, adding a new `WindowInstance` object with a unique ID and the highest `zIndex`.
5.  **UI Re-render**:
    -   The `OSInterface` component, which consumes the `windows` state, re-renders.
    -   Its `windows.map(...)` function now includes the new window, causing a new `Window` component to be mounted and displayed on the screen.
    -   The `Taskbar` component also re-renders to show the icon of the newly opened app.

---

## 4. Gemini API Interaction Flow: A Simple Chat Message

This flow shows how an application component uses the centralized `geminiService` to interact with the API.

**User Input -> App Component -> Gemini Service -> API Call -> Service Response -> App State -> UI Update**

1.  **User Input**: The user types a message into the `GeminiChatApp` and clicks "Send".
2.  **App Component**:
    -   The `handleSubmit` function in `src/apps/components.tsx` is called.
    -   It updates its local `messages` state to immediately show the user's message.
    -   It sets its local `isLoading` state to `true`.
3.  **Gemini Service**: The component calls `geminiService.sendMessage(prompt, model)`.
4.  **API Call**: The `geminiService` in `src/services/geminiService.ts` uses its configured `GoogleGenAI` instance to call the `chat.sendMessage()` method from the `@google/genai` SDK.
5.  **Service Response**: The `geminiService` awaits the promise, which resolves with the API response, and returns the extracted text.
6.  **App State**: The `handleSubmit` function in `GeminiChatApp` receives the text. It updates its `messages` state again, adding Gemini's response, and sets `isLoading` to `false`.
7.  **UI Update**: The `GeminiChatApp` re-renders to display the new message from Gemini and hide the loader.

---

## 5. Durgas Voice Assistant Flow (Function Calling)

This is a more complex flow involving speech recognition, function calling, and text-to-speech.

1.  **Idle State**: In `AppContext`, a `SpeechRecognition` instance (`wakeWordRecognizerRef`) is continuously listening for the wake word "Durgas".
2.  **Activation**:
    -   When "Durgas" is detected, the `activateAssistant` function is called.
    -   The `assistantState` is set to `'listening'`.
    -   The wake-word listener is stopped, and a new, short-term `SpeechRecognition` instance (`commandRecognizerRef`) is started to capture the user's command.
    -   The `DurgasAssistant` UI component appears on screen, showing the "Listening..." state.
3.  **Command Processing**:
    -   The user speaks a command (e.g., "Create a folder named 'Tests' on the desktop").
    -   When they stop speaking, the command listener's `onend` event fires, calling `processCommand` with the final transcript.
    -   `assistantState` is set to `'thinking'`.
4.  **First API Call (Intent Recognition)**:
    -   `processCommand` calls `geminiService.getAssistantResponse`, sending the transcript and the list of available tools (functions) from `src/services/assistantTools.ts`.
5.  **Function Call Execution**:
    -   Gemini analyzes the command and determines it matches the `createFolder` tool. It returns a `functionCall` object in its response (e.g., `{ name: 'createFolder', args: { folderName: 'Tests', location: 'Desktop' } }`).
    -   `AppContext` receives this response and calls `executeFunctionCall` with the `functionCall` object.
    -   The `switch` statement in `executeFunctionCall` matches the name and calls the corresponding context function (`updateFileSystem`).
    -   The result (e.g., "Created folder 'Tests' on the desktop.") is prepared.
6.  **Second API Call (Natural Language Response)**:
    -   The function's result is sent back to the Gemini API in a new `getAssistantResponse` call. This gives the model context on what action was just performed.
    -   Gemini generates a user-friendly, natural language confirmation (e.g., "Okay, I've created the 'Tests' folder on your desktop for you.").
7.  **Text-to-Speech and Playback**:
    -   This final text response is passed to the `speakResponse` function.
    -   `assistantState` is set to `'speaking'`.
    -   `speakResponse` calls `geminiService.textToSpeech`.
    -   The base64 audio data returned from the API is decoded using `decodeAudioData` and played through the browser's Web Audio API.
8.  **Return to Idle**: When the audio finishes playing (`onended`), the `assistantState` is reset to `'idle'`, the `DurgasAssistant` UI disappears, and the wake-word listener restarts.

---

## 6. Live Assistant Flow (Real-time Conversation)

This flow uses the Gemini Live API for low-latency, bidirectional audio streaming.

1.  **Initiation**: The user opens the `LiveAssistantApp` and clicks "Start Conversation". This calls the `startSession` function in `AppContext`.
2.  **Session Connection**:
    -   `startSession` requests microphone permissions.
    -   It calls `geminiService.connectLive`, providing four key callbacks: `onopen`, `onmessage`, `onerror`, and `onclose`.
3.  **Audio Pipelining (`onopen`)**:
    -   Once the connection is open, `isSessionActive` is set to `true`.
    -   A Web Audio API `AudioContext` and `ScriptProcessorNode` are created.
    -   The `onaudioprocess` event handler is set up. This function acts as a faucet, capturing small chunks of raw microphone audio data every few milliseconds.
4.  **Upstream (User to Gemini)**:
    -   Inside `onaudioprocess`, each audio chunk is encoded to base64 and wrapped in a `Blob` object.
    -   This `Blob` is sent to the Gemini API using `session.sendRealtimeInput({ media: pcmBlob })`. This happens continuously as long as the user is speaking.
5.  **Downstream (Gemini to User) (`onmessage`)**:
    -   `AppContext` receives a stream of `LiveServerMessage` objects from Gemini.
    -   **Transcription**: The message may contain `inputTranscription` or `outputTranscription` text fragments. These are appended to the `currentInput` and `currentOutput` states, causing the UI to update with a live transcript.
    -   **Audio Data**: The message may contain a `modelTurn` with a chunk of audio data (base64).
    -   **Playback Queuing**: This audio chunk is immediately decoded. To ensure gapless playback, its `start()` time is scheduled to be the exact end time of the previously received chunk. A `nextStartTime` variable tracks this audio queue.
6.  **Session Termination**:
    -   When the user clicks "Stop Conversation", `stopSession` is called.
    -   `session.close()` is called to terminate the WebSocket connection.
    -   All audio resources (`AudioContext`, `ScriptProcessorNode`, microphone stream) are disconnected and released to free up system resources.
    -   `isSessionActive` is set to `false`.
