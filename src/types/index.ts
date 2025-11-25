export interface Message {
  role: 'user' | 'model';
  parts: MessagePart[];
  timestamp?: number;
}

export interface MessagePart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

export interface ApiResponse {
  candidates: Array<{
    content: {
      parts: MessagePart[];
    };
  }>;
}

export interface StoredKey {
  key: string;
  timestamp: number;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  id: string;
}

export interface ChatConfig {
  validKey: string;
  apiKeys: string[];
  geminiModel: string;
  persona: string;
  devInfo: string;
}
