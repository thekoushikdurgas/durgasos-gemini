/**
 * @file Centralized service for all interactions with the Google Gemini API.
 */
import { GoogleGenAI, Chat, Modality, GenerateContentResponse, LiveServerMessage, FunctionDeclaration } from "@google/genai";
import type { AspectRatio } from '../types';

/**
 * Defines the callback structure required for the Live API connection.
 */
type ConnectCallbacks = {
  onopen: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror: (e: ErrorEvent) => void;
  onclose: (e: CloseEvent) => void;
}

/**
 * A singleton class to handle all Gemini API communications.
 */
class GeminiService {
  private ai: GoogleGenAI;
  private chatSessions: Map<string, Chat> = new Map();

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      console.error("API_KEY is not set. Application will not function correctly.");
      throw new Error("API_KEY is not set in environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }
  
  /**
   * Retrieves or creates a chat session for a given model.
   * @param {string} model The model name for the chat session.
   * @returns {Chat} The chat session instance.
   */
  private getChat(model: string): Chat {
    if (!this.chatSessions.has(model)) {
      console.debug(`[GeminiService] Creating new chat session for model: ${model}`);
      this.chatSessions.set(model, this.ai.chats.create({ model }));
    }
    return this.chatSessions.get(model)!;
  }
  
  /**
   * Sends a message in a chat session.
   * @param {string} prompt The user's message.
   * @param {'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro'} model The model to use.
   * @returns {Promise<string>} The model's text response.
   */
  async sendMessage(prompt: string, model: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro'): Promise<string> {
    console.debug(`[GeminiService] sendMessage with model ${model}`);
    const config = model === 'gemini-2.5-pro' ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
    const chat = this.getChat(model);
    const result = await chat.sendMessage({ message: prompt, config: config });
    return result.text;
  }

  /**
   * Gets a response from the model, including function calling capabilities.
   * @param {string} prompt The user's prompt.
   * @param {FunctionDeclaration[]} tools The function declarations available to the model.
   * @param {any[]} [history] The conversation history.
   * @returns {Promise<GenerateContentResponse>} The full response object from the API.
   */
  async getAssistantResponse(prompt: string, tools: FunctionDeclaration[], history?: any[]): Promise<GenerateContentResponse> {
    console.debug("[GeminiService] getAssistantResponse called");
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: history || [{role: "user", parts: [{text: prompt}] }],
        config: {
          tools: [{ functionDeclarations: tools }],
        },
      });
      return response;
  }

  /**
   * Generates an image using the Imagen model.
   * @param {string} prompt The prompt for image generation.
   * @param {AspectRatio} aspectRatio The desired aspect ratio.
   * @returns {Promise<string>} The base64 encoded image bytes.
   */
  async generateImage(prompt: string, aspectRatio: AspectRatio): Promise<string> {
    console.debug("[GeminiService] generateImage called");
    const response = await this.ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio,
      },
    });
    return response.generatedImages[0].image.imageBytes;
  }
  
  /**
   * Analyzes content (image or video) with a text prompt.
   * @param {string} prompt The prompt for analysis.
   * @param {string} base64Data The base64 encoded content data.
   * @param {string} mimeType The MIME type of the content.
   * @param {'gemini-2.5-flash' | 'gemini-2.5-pro'} model The model to use.
   * @returns {Promise<string>} The model's text response.
   */
  async analyzeContent(prompt: string, base64Data: string, mimeType: string, model: 'gemini-2.5-flash' | 'gemini-2.5-pro'): Promise<string> {
    console.debug(`[GeminiService] analyzeContent with model ${model}`);
    const imagePart = {
      inlineData: { data: base64Data, mimeType },
    };
    const textPart = { text: prompt };
    const response = await this.ai.models.generateContent({
      model,
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
  }

  /**
   * Edits an image based on a text prompt.
   * @param {string} prompt The editing instruction.
   * @param {string} base64Data The base64 encoded image data.
   * @param {string} mimeType The MIME type of the image.
   * @returns {Promise<string>} The base64 encoded edited image.
   */
  async editImage(prompt: string, base64Data: string, mimeType: string): Promise<string> {
    console.debug("[GeminiService] editImage called");
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return part.inlineData.data;
    }
    throw new Error("No image data found in response");
  }

  /**
   * Transcribes an audio file.
   * @param {string} base64Data The base64 encoded audio data.
   * @param {string} mimeType The MIME type of the audio.
   * @returns {Promise<string>} The transcribed text.
   */
  async transcribeAudio(base64Data: string, mimeType: string): Promise<string> {
    console.debug("[GeminiService] transcribeAudio called");
    const audioPart = {
        inlineData: { data: base64Data, mimeType }
    };
    const textPart = { text: "Transcribe this audio." };
    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [audioPart, textPart] },
    });
    return response.text;
  }

  /**
   * Converts text to speech.
   * @param {string} text The text to convert.
   * @returns {Promise<string>} The base64 encoded audio data.
   */
  async textToSpeech(text: string): Promise<string> {
    console.debug("[GeminiService] textToSpeech called");
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("TTS failed to generate audio.");
    return base64Audio;
  }

  /**
   * Performs a search-grounded query using Google Search or Maps.
   * @param {string} prompt The user's query.
   * @param {boolean} useMaps Whether to use Google Maps for grounding.
   * @returns {Promise<{text: string, chunks: any[]}>} The grounded text response and source chunks.
   */
  async groundedSearch(prompt: string, useMaps: boolean): Promise<{text: string, chunks: any[]}> {
      console.debug(`[GeminiService] groundedSearch called with useMaps: ${useMaps}`);
      const tools = useMaps ? [{googleMaps: {}}] : [{googleSearch: {}}];
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools,
        },
      });
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { text: response.text, chunks };
  }
  
  /**
   * Connects to the Live API for real-time conversation.
   * @param {ConnectCallbacks} callbacks The callbacks for handling session events.
   * @returns A promise that resolves to the live session object.
   */
  connectLive(callbacks: ConnectCallbacks) {
    console.debug("[GeminiService] connectLive called");
    return this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Zephyr'}},
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            systemInstruction: 'You are Durgas, the helpful AI assistant for DurgasOS.',
        },
    });
  }
}

// Export a singleton instance of the service
export const geminiService = new GeminiService(process.env.API_KEY);
