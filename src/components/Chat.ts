import { Message } from '../types';
import { MessageComponent } from './Message';
import { ApiService } from '../services/ApiService';
import { StorageService } from '../services/StorageService';
import { CONFIG } from '../utils/constants';

export class ChatComponent {
  private chatLog: HTMLElement;
  private chatInput: HTMLTextAreaElement;
  private sendBtn: HTMLButtonElement;
  private apiService: ApiService;
  private conversationHistory: Message[];
  private isKeyVerified: boolean = false;

  constructor() {
    this.chatLog = document.getElementById('chatLog') as HTMLElement;
    this.chatInput = document.getElementById('chatInput') as HTMLTextAreaElement;
    this.sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
    this.apiService = new ApiService();
    
    this.conversationHistory = [
      {
        role: "user",
        parts: [{ text: CONFIG.PERSONA }]
      },
      {
        role: "model",
        parts: [{ text: "Hallo bro welcome to CentralGPT." }]
      }
    ];
    
    this.setupEventListeners();
    this.initializeFromStorage();
  }

  private setupEventListeners(): void {
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.chatInput.addEventListener('input', () => {
      this.chatInput.style.height = 'auto';
      this.chatInput.style.height = (this.chatInput.scrollHeight) + 'px';
    });

    const devBtn = document.getElementById('devBtn');
    devBtn?.addEventListener('click', () => this.handleDevQuestion());
  }

  private initializeFromStorage(): void {
    if (StorageService.isValidStoredKey()) {
      this.isKeyVerified = true;
      this.chatInput.placeholder = "Ketik pertanyaan di sini...";
      
      const tempMessage = MessageComponent.createTemporaryMessage('Key terdeteksi! Anda bisa langsung menggunakan CentralGPT.');
      this.chatLog.appendChild(tempMessage);
      
      this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }
  }

  private async sendMessage(): Promise<void> {
    const message = this.chatInput.value.trim();
    
    if (!message && !this.hasImages()) return;
    
    this.chatInput.value = '';
    this.chatInput.style.height = 'auto';
    this.sendBtn.disabled = true;
    
    if (!this.isKeyVerified) {
      this.addMessage(message, true);
      
      if (this.verifyKey(message)) {
        this.sendBtn.disabled = false;
        return;
      } else {
        this.addMessage("❌ Key salah! Silakan coba lagi.", false);
        this.sendBtn.disabled = false;
        return;
      }
    }
    
    this.addMessage(message, true);
    this.showTyping();
    
    try {
      let aiResponse: string;
      
      if (this.hasImages()) {
        aiResponse = await this.sendMessageWithImages(message);
      } else {
        aiResponse = await this.sendTextMessage(message);
      }
      
      this.hideTyping();
      this.addMessage(aiResponse, false);
      
    } catch (error) {
      console.error('Error:', error);
      this.hideTyping();
      this.addMessage("Maaf, terjadi kesalahan. Silakan coba lagi.", false);
    }
    
    this.sendBtn.disabled = false;
    this.chatInput.focus();
  }

  private async sendTextMessage(message: string): Promise<string> {
    this.conversationHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    let retryCount = 0;
    
    while (retryCount < CONFIG.KEYS.length) {
      try {
        const response = await this.apiService.sendTextMessage(this.conversationHistory, message);
        
        this.conversationHistory.push({
          role: "model",
          parts: [{ text: response }]
        });
        
        return response;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount < CONFIG.KEYS.length) {
          this.apiService.rotateApiKey();
        } else {
          throw new Error('All API keys are currently unavailable');
        }
      }
    }
    
    throw new Error('Failed to send message');
  }

  private async sendMessageWithImages(message: string): Promise<string> {
    const imageFiles = this.getImageFiles();
    const response = await this.apiService.sendMessage(this.conversationHistory, message, imageFiles);
    
    this.conversationHistory.push({
      role: "user",
      parts: [
        { text: message || "Analisis gambar ini" },
        ...imageFiles.map(file => ({
          inline_data: {
            mime_type: file.type,
            data: "" // This would be filled by the API service
          }
        }))
      ]
    });
    
    this.conversationHistory.push({
      role: "model",
      parts: [{ text: response }]
    });
    
    this.clearImages();
    return response;
  }

  private verifyKey(key: string): boolean {
    if (key === CONFIG.VALID_KEY) {
      this.isKeyVerified = true;
      StorageService.saveKey(key);
      this.chatInput.placeholder = "Ketik pertanyaan di sini...";
      
      const tempMessage = MessageComponent.createTemporaryMessage('Key berhasil diverifikasi! Sekarang Anda bisa menggunakan CentralGPT.');
      this.chatLog.appendChild(tempMessage);
      
      this.chatLog.scrollTop = this.chatLog.scrollHeight;
      return true;
    }
    return false;
  }

  private handleDevQuestion(): void {
    if (!this.isKeyVerified) {
      this.addMessage("Masukkan Key Anda Terlebih Dahulu", false);
      return;
    }
    
    const devQuestion = "Siapa developer Lo?";
    this.addMessage(devQuestion, true);
    this.addMessage(CONFIG.DEV_INFO, false);
    
    this.conversationHistory.push({
      role: "user",
      parts: [{ text: devQuestion }]
    });
    
    this.conversationHistory.push({
      role: "model",
      parts: [{ text: CONFIG.DEV_INFO }]
    });
  }

  addMessage(content: string, isUser: boolean = false): void {
    const messageElement = MessageComponent.createMessage(content, isUser);
    this.chatLog.appendChild(messageElement);
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
  }

  private showTyping(): void {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.style.display = 'block';
      this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }
  }

  private hideTyping(): void {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }
  }

  // These methods would integrate with ImageUploadComponent
  private hasImages(): boolean {
    // Implementation depends on ImageUploadComponent integration
    return false;
  }

  private getImageFiles(): File[] {
    // Implementation depends on ImageUploadComponent integration
    return [];
  }

  private clearImages(): void {
    // Implementation depends on ImageUploadComponent integration
  }
}
