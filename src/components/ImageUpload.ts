import { ImageFile } from '../types';
import { generateId } from '../utils/helpers';
import { CONFIG } from '../utils/constants';

export class ImageUploadComponent {
  private selectedFiles: ImageFile[] = [];
  private container: HTMLElement;
  private attachmentsContainer: HTMLElement;
  private attachmentsInfo: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.attachmentsContainer = container.querySelector('#attachmentsContainer') as HTMLElement;
    this.attachmentsInfo = container.querySelector('#attachmentsInfo') as HTMLElement;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const uploadModal = document.getElementById('uploadModal');
    const closeModal = document.getElementById('closeModal');
    const uploadArea = document.getElementById('uploadArea');
    const modalFileInput = document.getElementById('modalFileInput') as HTMLInputElement;
    const cancelUpload = document.getElementById('cancelUpload');
    const confirmUpload = document.getElementById('confirmUpload');

    uploadBtn?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => this.handleImageUpload(e as Event));
    
    uploadArea?.addEventListener('click', () => modalFileInput?.click());
    modalFileInput?.addEventListener('change', (e) => this.handleImageUpload(e as Event));
    
    uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea?.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      
      if (e.dataTransfer?.files.length) {
        const event = { target: { files: e.dataTransfer.files } };
        this.handleImageUpload(event as any);
      }
    });
    
    closeModal?.addEventListener('click', () => this.closeModal());
    cancelUpload?.addEventListener('click', () => this.closeModal());
    confirmUpload?.addEventListener('click', () => this.confirmUpload());
  }

  private handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;
    
    this.showImageLoading();
    
    setTimeout(() => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          this.showNotification('Hanya file gambar yang diizinkan!');
          continue;
        }
        
        if (file.size > CONFIG.MAX_FILE_SIZE) {
          this.showNotification(`Ukuran gambar ${file.name} maksimal 20MB!`);
          continue;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageFile: ImageFile = {
            file: file,
            previewUrl: e.target?.result as string,
            id: generateId()
          };
          this.selectedFiles.push(imageFile);
          this.updateAttachmentsDisplay();
        };
        reader.readAsDataURL(file);
      }
      
      this.hideImageLoading();
      input.value = '';
    }, 1000);
  }

  private showImageLoading(): void {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.id = 'imageLoading';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    
    const text = document.createElement('div');
    text.className = 'loading-text';
    text.textContent = 'Memproses gambar...';
    
    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(text);
    
    const inputArea = document.querySelector('.input-area');
    inputArea?.parentNode?.insertBefore(loadingDiv, inputArea);
    
    const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
    if (sendBtn) sendBtn.disabled = true;
  }

  private hideImageLoading(): void {
    const loadingDiv = document.getElementById('imageLoading');
    loadingDiv?.remove();
    
    const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
    if (sendBtn) sendBtn.disabled = false;
  }

  private updateAttachmentsDisplay(): void {
    if (this.selectedFiles.length === 0) {
      this.container.style.display = 'none';
      return;
    }
    
    this.container.style.display = 'block';
    this.attachmentsContainer.innerHTML = '';
    
    this.selectedFiles.forEach((imageFile, index) => {
      const attachmentItem = document.createElement('div');
      attachmentItem.className = 'attachment-item';
      
      const img = document.createElement('img');
      img.src = imageFile.previewUrl;
      img.className = 'attachment-image';
      img.alt = imageFile.file.name;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-attachment';
      removeBtn.innerHTML = '×';
      removeBtn.onclick = () => {
        this.selectedFiles.splice(index, 1);
        this.updateAttachmentsDisplay();
      };
      
      attachmentItem.appendChild(img);
      attachmentItem.appendChild(removeBtn);
      this.attachmentsContainer.appendChild(attachmentItem);
    });
    
    this.attachmentsInfo.textContent = `${this.selectedFiles.length} foto terpasang. Klik tombol kirim untuk menganalisis.`;
    this.showNotification(`${this.selectedFiles.length} gambar berhasil ditambahkan!`);
  }

  private closeModal(): void {
    const uploadModal = document.getElementById('uploadModal');
    if (uploadModal) uploadModal.style.display = 'none';
  }

  private confirmUpload(): void {
    this.closeModal();
  }

  private showNotification(message: string): void {
    const notification = document.getElementById('notification');
    if (notification) {
      notification.textContent = message;
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 2000);
    }
  }

  getSelectedFiles(): File[] {
    return this.selectedFiles.map(imgFile => imgFile.file);
  }

  clearSelectedFiles(): void {
    this.selectedFiles = [];
    this.updateAttachmentsDisplay();
  }

  hasFiles(): boolean {
    return this.selectedFiles.length > 0;
  }
}
