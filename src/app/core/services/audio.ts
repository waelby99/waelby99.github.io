import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private startupAudio?: HTMLAudioElement;

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
}