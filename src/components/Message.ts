import { detectCodeBlocks, formatTextContent } from '../utils/helpers';

export class MessageComponent {
  static createMessage(content: string, isUser: boolean = false): HTMLElement {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const contentParts = detectCodeBlocks(content);
    
    contentParts.forEach(part => {
      if (part.type === 'code') {
        contentDiv.appendChild(this.createCodeBlock(part.content, part.language || 'text'));
      } else {
        contentDiv.appendChild(this.createTextBlock(part.content));
      }
    });
    
    bubbleDiv.appendChild(contentDiv);
    messageDiv.appendChild(bubbleDiv);
    
    return messageDiv;
  }

  private static createCodeBlock(codeContent: string, language: string): HTMLElement {
    const codeBlock = document.createElement('div');
    codeBlock.className = 'code-block';
    
    const codeHeader = document.createElement('div');
    codeHeader.className = 'code-header';
    
    const codeLanguage = document.createElement('span');
    codeLanguage.className = 'code-language';
    codeLanguage.textContent = language.toUpperCase() || 'CODE';
    
    const copyCodeBtn = document.createElement('button');
    copyCodeBtn.className = 'copy-code-btn';
    copyCodeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
      Copy
    `;
    copyCodeBtn.onclick = () => this.copyToClipboard(codeContent, 'Code copied successfully!');
    
    codeHeader.appendChild(codeLanguage);
    codeHeader.appendChild(copyCodeBtn);
    
    const codeContentElement = document.createElement('pre');
    codeContentElement.textContent = codeContent;
    codeContentElement.style.margin = '0';
    codeContentElement.style.whiteSpace = 'pre-wrap';
    codeContentElement.style.color = '#e0e0e0';
    codeContentElement.style.fontSize = '0.9em';
    codeContentElement.style.lineHeight = '1.4';
    codeContentElement.style.fontFamily = "'JetBrains Mono', 'Consolas', 'Monaco', monospace";
    
    codeBlock.appendChild(codeHeader);
    codeBlock.appendChild(codeContentElement);
    
    return codeBlock;
  }

  private static createTextBlock(textContent: string): HTMLElement {
    const textDiv = document.createElement('div');
    const formattedContent = formatTextContent(textContent);
    textDiv.innerHTML = '<p>' + formattedContent + '</p>';
    textDiv.style.whiteSpace = 'pre-wrap';
    return textDiv;
  }

  private static copyToClipboard(text: string, message: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      this.showNotification(successful ? message : 'Failed to copy text!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      this.showNotification('Failed to copy text!');
    }
    
    document.body.removeChild(textArea);
  }

  private static showNotification(message: string): void {
    const notification = document.getElementById('notification');
    if (notification) {
      notification.textContent = message;
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 2000);
    }
  }

  static createTemporaryMessage(message: string, className: string = 'key-verified'): HTMLElement {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${className} temporary-message`;
    messageDiv.textContent = message;
    
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
    
    return messageDiv;
  }

  static createTypingIndicator(): HTMLElement {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const typingAnimation = document.createElement('div');
    typingAnimation.className = 'typing-animation';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      typingAnimation.appendChild(dot);
    }
    
    typingDiv.appendChild(typingAnimation);
    return typingDiv;
  }
}
