import { StorageService } from '../services/StorageService';

export class StatusBarComponent {
  private statusText: HTMLElement;
  private timeRemaining: HTMLElement;

  constructor() {
    this.statusText = document.getElementById('statusText') as HTMLElement;
    this.timeRemaining = document.getElementById('timeRemaining') as HTMLElement;
    this.updateTimeRemaining();
  }

  setOnlineStatus(): void {
    this.statusText.textContent = "Online";
    this.statusText.style.color = "#00ff88";
  }

  setOfflineStatus(): void {
    this.statusText.textContent = "Masukkan Key";
    this.statusText.style.color = "";
  }

  updateTimeRemaining(): void {
    const remaining = StorageService.getRemainingTime();
    if (remaining) {
      this.timeRemaining.textContent = `Key ${remaining.hours}j ${remaining.minutes}m`;
      this.timeRemaining.style.display = 'inline';
    } else {
      this.timeRemaining.style.display = 'none';
    }
  }
}
