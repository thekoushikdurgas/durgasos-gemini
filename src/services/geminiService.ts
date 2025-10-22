
import { GoogleGenAI, Chat, Modality, Type, GenerateContentResponse, LiveServerMessage } from "@google/genai";
import type { AspectRatio } from '../types';

type ConnectCallbacks = {
  onopen: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror: (e: ErrorEvent) => void;
  onclose: (e: CloseEvent) => void;
}

class GeminiService {
  private ai: GoogleGenAI;
  private chatSessions: Map<string, Chat> = new Map();

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new Error("API_KEY is not set in environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }
  
  private getChat(model: string): Chat {
    if (!this.chatSessions.has(model)) {
      this.chatSessions.set(model, this.ai.chats.create({ model }));
    }
    return this.chatSessions.get(model)!;
  }
  
  async sendMessage(prompt: string, model: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro'): Promise<string> {
    const config = model === 'gemini-2.5-pro' ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
    const chat = this.getChat(model);
    const result = await chat.sendMessage({ message: prompt, config: config });
    return result.text;
  }

  async generateImage(prompt: string, aspectRatio: AspectRatio): Promise<string> {
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
  
  async analyzeContent(prompt: string, base64Data: string, mimeType: string, model: 'gemini-2.5-flash' | 'gemini-2.5-pro'): Promise<string> {
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

  async editImage(prompt: string, base64Data: string, mimeType: string): Promise<string> {
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

  async transcribeAudio(base64Data: string, mimeType: string): Promise<string> {
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

  async textToSpeech(text: string): Promise<string> {
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

  async groundedSearch(prompt: string, useMaps: boolean): Promise<{text: string, chunks: any[]}> {
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
  
  connectLive(callbacks: ConnectCallbacks) {
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

export const geminiService = new GeminiService(process.env.API_KEY);