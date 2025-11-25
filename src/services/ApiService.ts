import { Message, MessagePart, ApiResponse } from '../types';
import { CONFIG } from '../utils/constants';
import { fileToBase64 } from '../utils/helpers';

export class ApiService {
  private currentKeyIndex = 0;
  private totalKeys = CONFIG.KEYS.length;

  private getCurrentApiKey(): string {
    return CONFIG.KEYS[this.currentKeyIndex];
  }

  rotateApiKey(): string {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.totalKeys;
    console.log(`Switched to API Key index: ${this.currentKeyIndex}`);
    return this.getCurrentApiKey();
  }

  async sendMessage(
    conversationHistory: Message[], 
    message: string, 
    imageFiles: File[] = []
  ): Promise<string> {
    const API_KEY = this.getCurrentApiKey();
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${API_KEY}`;

    const contentParts: MessagePart[] = [];
    
    if (message) {
      contentParts.push({ text: message });
    } else if (imageFiles.length > 0) {
      contentParts.push({ text: "Analisis gambar ini dengan persona CentralGPT yang telah ditentukan." });
    }

    for (const file of imageFiles) {
      const base64Image = await fileToBase64(file);
      contentParts.push({
        inline_data: {
          mime_type: file.type,
          data: base64Image.split(',')[1]
        }
      });
    }

    const requestBody = {
      contents: [
        {
          role: "user" as const,
          parts: [{ text: CONFIG.PERSONA }]
        },
        {
          role: "model" as const, 
          parts: [{ text: "Oke bro, gua paham persona gua. Sekarang lo mau gua analisis gambar apa?" }]
        },
        {
          role: "user" as const,
          parts: contentParts
        }
      ]
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text || '';
    } else {
      throw new Error('No response from AI');
    }
  }

  async sendTextMessage(conversationHistory: Message[], message: string): Promise<string> {
    const API_KEY = this.getCurrentApiKey();
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${API_KEY}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text || '';
    } else {
      throw new Error('No response from AI');
    }
  }
}
