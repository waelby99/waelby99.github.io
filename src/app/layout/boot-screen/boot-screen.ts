import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { SystemStateService } from '../../core/services/system-state';

@Component({
  selector: 'app-boot-screen',
  standalone: true,
  imports: [],
  templateUrl: './boot-screen.html',
  styleUrl: './boot-screen.scss'
})
export class BootScreen implements OnInit, OnDestroy {

  private readonly systemStateService =
    inject(SystemStateService);

  private timeoutId?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.timeoutId = setTimeout(() => {
      this.systemStateService.showLogin();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}