import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';
import { Language, LanguageService } from '../../core/services/language.service';
import { AudioService } from '../../core/services/audio';

interface TrayIcon {
  id: string;
  icon: string;
  labelKey: string;
  alwaysVisible?: boolean;
}

@Component({
  selector: 'app-system-tray',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './system-tray.html',
  styleUrl: './system-tray.scss'
})
export class SystemTray implements OnInit, OnDestroy {
  readonly languageService = inject(LanguageService);

  private readonly audioService = inject(AudioService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly currentTime = signal('');
  readonly languageMenuOpen = signal(false);
  readonly trayExpanded = signal(false);

  readonly notificationOpen = signal(false);
  readonly notificationFading = signal(false);

  readonly notificationLeft = signal(8);
  readonly notificationPointerLeft = signal(250);

  readonly trayIcons: TrayIcon[] = [
    {
      id: 'volume',
      icon: '/assets/icons/system/volume.png',
      labelKey: 'SYSTEM_TRAY.VOLUME',
      alwaysVisible: true
    },
    {
      id: 'info',
      icon: '/assets/icons/system/info.png',
      labelKey: 'SYSTEM_TRAY.INFO',
      alwaysVisible: true
    },
    {
      id: 'network',
      icon: '/assets/icons/system/network.png',
      labelKey: 'SYSTEM_TRAY.NETWORK'
    },
    {
      id: 'security',
      icon: '/assets/icons/system/security.png',
      labelKey: 'SYSTEM_TRAY.SECURITY'
    },
    {
      id: 'usb',
      icon: '/assets/icons/system/usb.png',
      labelKey: 'SYSTEM_TRAY.USB'
    }
  ];

  private clockInterval?: ReturnType<typeof setInterval>;
  private initialNotificationTimeout?: ReturnType<typeof setTimeout>;
  private notificationAutoHideTimeout?: ReturnType<typeof setTimeout>;
  private notificationFadeTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.updateClock();

    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);

    this.initialNotificationTimeout = setTimeout(() => {
      this.showNotification(true);
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }

    if (this.initialNotificationTimeout) {
      clearTimeout(this.initialNotificationTimeout);
    }

    this.clearNotificationTimers();
  }

  private updateClock(): void {
    const now = new Date();

    this.currentTime.set(
      now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    );
  }

  private showNotification(playSound = false): void {
    this.clearNotificationTimers();

    this.notificationFading.set(false);
    this.notificationOpen.set(true);

    setTimeout(() => {
      this.updateNotificationPosition();
    }, 0);

    if (playSound) {
      this.audioService.playNotification();
    }
    
    this.notificationAutoHideTimeout = setTimeout(() => {
      this.fadeNotification();
    }, 7000);
  }

  private fadeNotification(): void {
    if (!this.notificationOpen()) {
      return;
    }

    if (this.notificationAutoHideTimeout) {
      clearTimeout(this.notificationAutoHideTimeout);
      this.notificationAutoHideTimeout = undefined;
    }

    this.notificationFading.set(true);

    this.notificationFadeTimeout = setTimeout(() => {
      this.notificationOpen.set(false);
      this.notificationFading.set(false);
    }, 450);
  }

  private clearNotificationTimers(): void {
    if (this.notificationAutoHideTimeout) {
      clearTimeout(this.notificationAutoHideTimeout);
      this.notificationAutoHideTimeout = undefined;
    }

    if (this.notificationFadeTimeout) {
      clearTimeout(this.notificationFadeTimeout);
      this.notificationFadeTimeout = undefined;
    }
  }

  private updateNotificationPosition(): void {
    if (!this.notificationOpen()) {
      return;
    }

    const infoButton =
      this.elementRef.nativeElement.querySelector<HTMLElement>(
        '[data-tray-icon="info"]'
      );

    if (!infoButton) {
      return;
    }

    const iconRect = infoButton.getBoundingClientRect();
    const iconCenter = iconRect.left + iconRect.width / 2;

    const viewportMargin = 8;
    const balloonWidth = Math.min(255, window.innerWidth - viewportMargin * 2);

    /*
     * Put the balloon mostly to the left of the Info icon,
     * just like Windows XP.
     */
    let balloonLeft = iconCenter - balloonWidth + 42;

    balloonLeft = Math.max(
      viewportMargin,
      Math.min(
        balloonLeft,
        window.innerWidth - balloonWidth - viewportMargin
      )
    );

    /*
     * Exact horizontal position of the Info icon
     * inside the notification.
     */
    let pointerCenter = iconCenter - balloonLeft;

    pointerCenter = Math.max(
      18,
      Math.min(pointerCenter, balloonWidth - 18)
    );

    this.notificationLeft.set(balloonLeft);

    /*
     * Pointer is 12px wide.
     */
    this.notificationPointerLeft.set(pointerCenter - 6);
  }

  toggleTray(event: MouseEvent): void {
    event.stopPropagation();

    this.trayExpanded.update(expanded => !expanded);

    /*
     * Expanded tray changes the Info icon position.
     * Wait for Angular to redraw the icons, then
     * calculate the balloon pointer again.
     */
    if (this.notificationOpen()) {
      setTimeout(() => {
        this.updateNotificationPosition();
      }, 0);
    }
  }

  toggleLanguageMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.languageMenuOpen.update(open => !open);
  }

  selectLanguage(language: Language, event: MouseEvent): void {
    event.stopPropagation();

    this.languageService.setLanguage(language);
    this.languageMenuOpen.set(false);
  }

  clickTrayIcon(icon: TrayIcon, event: MouseEvent): void {
    event.stopPropagation();

    if (icon.id === 'info') {
      if (this.notificationOpen()) {
        this.fadeNotification();
      } else {
        this.showNotification(false);
      }

      return;
    }

    console.log('Tray icon clicked:', icon.id);
  }

  closeNotification(event?: MouseEvent): void {
    event?.stopPropagation();
    this.fadeNotification();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateNotificationPosition();
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.languageMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  escape(): void {
    this.languageMenuOpen.set(false);
    this.trayExpanded.set(false);

    if (this.notificationOpen()) {
      this.fadeNotification();
    }
  }
}