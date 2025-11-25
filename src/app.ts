import './styles/main.css';
import { ChatComponent } from './components/Chat';
import { StatusBarComponent } from './components/StatusBar';
import { ImageUploadComponent } from './components/ImageUpload';
import { StorageService } from './services/StorageService';

class CentralGPTApp {
  private chatComponent!: ChatComponent;
  private statusBarComponent!: StatusBarComponent;
  private imageUploadComponent!: ImageUploadComponent;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Create notification element if it doesn't exist
    this.createNotificationElement();
    
    // Initialize components
    this.statusBarComponent = new StatusBarComponent();
    
    const imageAttachments = document.getElementById('imageAttachments');
    if (imageAttachments) {
      this.imageUploadComponent = new ImageUploadComponent(imageAttachments);
    } else {
      console.error('Image attachments container not found');
      // Create a fallback or handle the error appropriately
      this.imageUploadComponent = {} as ImageUploadComponent;
    }
    
    this.chatComponent = new ChatComponent();
    
    // Set up time remaining updates
    setInterval(() => {
      this.statusBarComponent.updateTimeRemaining();
    }, 60000);
    
    // Focus on chat input
    const chatInput = document.getElementById('chatInput') as HTMLTextAreaElement;
    if (chatInput) {
      chatInput.focus();
    }
    
    console.log('CentralGPT TypeScript App initialized');
  }

  private createNotificationElement(): void {
    if (!document.getElementById('notification')) {
      const notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = 'notification';
      notification.textContent = 'Text copied successfully!';
      document.body.appendChild(notification);
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CentralGPTApp();
});
