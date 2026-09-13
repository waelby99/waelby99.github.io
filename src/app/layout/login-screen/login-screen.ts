import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { SystemStateService } from '../../core/services/system-state';
import { LanguageService } from '../../core/services/language.service';
import { AudioService } from '../../core/services/audio';

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './login-screen.html',
  styleUrl: './login-screen.scss'
})
export class LoginScreen {

  readonly languageService =
    inject(LanguageService);

  private readonly systemStateService =
    inject(SystemStateService);

  private readonly audioService =
    inject(AudioService);


  login(): void {

    this.systemStateService.showWelcome();

    this.audioService.playStartup();

    setTimeout(() => {
      this.systemStateService.showDesktop();
    }, 1800);
  }
}