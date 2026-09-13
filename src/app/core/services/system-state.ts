import { Injectable, signal } from '@angular/core';

export type SystemState =
  | 'boot'
  | 'login'
  | 'welcome'
  | 'desktop';

@Injectable({
  providedIn: 'root'
})
export class SystemStateService {

  readonly state = signal<SystemState>('boot');

  showBoot(): void {
    this.state.set('boot');
  }

  showLogin(): void {
    this.state.set('login');
  }

  showWelcome(): void {
    this.state.set('welcome');
  }

  showDesktop(): void {
    this.state.set('desktop');
  }
}