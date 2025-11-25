export function detectCodeBlocks(text: string): Array<{ type: 'text' | 'code'; language?: string; content: string }> {
  let result: Array<{ type: 'text' | 'code'; language?: string; content: string }> = [];
  let remainingText = text;
  
  const codeBlockPattern = /```([a-zA-Z0-9_]+)?\s*([\s\S]*?)```/g;
  
  let match;
  let lastIndex = 0;
  
  while ((match = codeBlockPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }
    
    const language = match[1] || 'text';
    const codeContent = match[2].trim();
    
    result.push({
      type: 'code',
      language: language,
      content: codeContent
    });
    
    lastIndex = codeBlockPattern.lastIndex;
  }
  
  if (lastIndex < text.length) {
    result.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }
  
  return result.length > 0 ? result : [{ type: 'text', content: text }];
}

export function formatTextContent(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function calculateRemainingTime(timestamp: number): { hours: number; minutes: number } | null {
  const currentTime = Date.now();
  const timeDiff = currentTime - timestamp;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  const remainingHours = 24 - hoursDiff;
  
  if (remainingHours > 0) {
    const hours = Math.floor(remainingHours);
    const minutes = Math.floor((remainingHours - hours) * 60);
    return { hours, minutes };
  }
  
  return null;
}
