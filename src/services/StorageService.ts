import { StoredKey } from '../types';
import { CONFIG } from '../utils/constants';
import { calculateRemainingTime } from '../utils/helpers';

export class StorageService {
  private static readonly STORAGE_KEY = 'centralGPT_key';

  static saveKey(key: string): void {
    const keyData: StoredKey = {
      key: key,
      timestamp: Date.now()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keyData));
  }

  static getStoredKey(): StoredKey | null {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (!storedData) return null;
    
    try {
      return JSON.parse(storedData) as StoredKey;
    } catch (e) {
      console.error('Error parsing stored key:', e);
      return null;
    }
  }

  static isValidStoredKey(): boolean {
    const storedKey = this.getStoredKey();
    if (!storedKey) return false;
    
    const currentTime = Date.now();
    const timeDiff = currentTime - storedKey.timestamp;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < CONFIG.KEY_EXPIRY_HOURS && storedKey.key === CONFIG.VALID_KEY) {
      return true;
    } else {
      this.removeKey();
      return false;
    }
  }

  static removeKey(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getRemainingTime(): { hours: number; minutes: number } | null {
    const storedKey = this.getStoredKey();
    if (!storedKey) return null;
    
    return calculateRemainingTime(storedKey.timestamp);
  }
}
