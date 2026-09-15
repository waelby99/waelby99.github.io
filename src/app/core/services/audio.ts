import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private startupAudio?: HTMLAudioElement;
  private notificationAudio?: HTMLAudioElement;

  playStartup(): void {
    if (!this.startupAudio) {
      this.startupAudio = new Audio('/assets/sounds/startup.flac');
      this.startupAudio.volume = 0.65;
    }

    this.startupAudio.currentTime = 0;

    this.startupAudio.play().catch(error => {
      console.warn('Could not play startup sound:', error);
    });
  }

  playNotification(): void {
    if (!this.notificationAudio) {
      this.notificationAudio = new Audio('/assets/sounds/notify.wav');
      this.notificationAudio.volume = 0.55;
    }

    this.notificationAudio.currentTime = 0;

    this.notificationAudio.play().catch(error => {
      console.warn('Could not play notification sound:', error);
    });
  }

  stopStartup(): void {
    if (!this.startupAudio) return;

    this.startupAudio.pause();
    this.startupAudio.currentTime = 0;
  }

  stopNotification(): void {
    if (!this.notificationAudio) return;

    this.notificationAudio.pause();
    this.notificationAudio.currentTime = 0;
  }
}