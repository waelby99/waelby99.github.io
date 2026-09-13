import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  Language,
  LanguageService
} from '../../core/services/language.service';


interface TrayIcon {

  id: string;

  icon: string;

  label: string;

}


@Component({
  selector:
    'app-system-tray',

  standalone:
    true,

  imports: [],

  templateUrl:
    './system-tray.html',

  styleUrl:
    './system-tray.scss'
})
export class SystemTray
  implements OnInit, OnDestroy {


  readonly languageService =
    inject(LanguageService);


  readonly currentTime =
    signal('');


  readonly languageMenuOpen =
    signal(false);


  readonly trayIcons:
    TrayIcon[] = [

      {
        id:
          'network',

        icon:
          '/assets/icons/system/network.png',

        label:
          'Network Connection'
      },

      {
        id:
          'volume',

        icon:
          '/assets/icons/system/volume.png',

        label:
          'Volume'
      },

      {
        id:
          'security',

        icon:
          '/assets/icons/system/security.png',

        label:
          'Windows Security Center'
      },

      {
        id:
          'usb',

        icon:
          '/assets/icons/system/usb.png',

        label:
          'Safely Remove Hardware'
      }

    ];


  private clockInterval?:
    ReturnType<typeof setInterval>;


  /* =====================================================
     LIFECYCLE
  ===================================================== */

  ngOnInit(): void {

    this.updateClock();


    this.clockInterval =
      setInterval(
        () => {

          this.updateClock();

        },
        1000
      );
  }


  ngOnDestroy(): void {

    if (
      this.clockInterval
    ) {

      clearInterval(
        this.clockInterval
      );
    }
  }


  /* =====================================================
     CLOCK
  ===================================================== */

  private updateClock(): void {

    const now =
      new Date();


    this.currentTime.set(
      now.toLocaleTimeString(
        'en-GB',
        {
          hour:
            '2-digit',

          minute:
            '2-digit',

          hour12:
            false
        }
      )
    );
  }


  /* =====================================================
     LANGUAGE
  ===================================================== */

  toggleLanguageMenu(
    event: MouseEvent
  ): void {

    event.stopPropagation();


    this.languageMenuOpen.update(
      value =>
        !value
    );
  }


  selectLanguage(
    language: Language,
    event: MouseEvent
  ): void {

    event.stopPropagation();


    this.languageService
      .setLanguage(
        language
      );


    this.languageMenuOpen
      .set(false);
  }


  /* =====================================================
     TRAY ICON
  ===================================================== */

  clickTrayIcon(
    icon: TrayIcon,
    event: MouseEvent
  ): void {

    event.stopPropagation();


    /*
     * Later we can give each icon
     * real Windows XP-like behavior.
     */

    console.log(
      'Tray icon clicked:',
      icon.id
    );
  }


  /* =====================================================
     GLOBAL EVENTS
  ===================================================== */

  @HostListener(
    'document:click'
  )
  closeLanguageMenu(): void {

    this.languageMenuOpen
      .set(false);
  }


  @HostListener(
    'document:keydown.escape'
  )
  escape(): void {

    this.languageMenuOpen
      .set(false);
  }

}