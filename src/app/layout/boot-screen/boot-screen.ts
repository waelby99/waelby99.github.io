import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import {
  SystemStateService
} from '../../core/services/system-state';

import {
  DesktopService
} from '../../core/services/desktop';


@Component({
  selector: 'app-boot-screen',

  standalone: true,

  imports: [],

  templateUrl:
    './boot-screen.html',

  styleUrl:
    './boot-screen.scss'
})
export class BootScreen
  implements OnInit, OnDestroy {


  private readonly systemStateService =
    inject(SystemStateService);


  private readonly desktopService =
    inject(DesktopService);


  private timeoutId?:
    ReturnType<typeof setTimeout>;


  /* =====================================================
     INIT
  ===================================================== */

  ngOnInit(): void {

    /*
     * Start downloading the desktop assets immediately
     * while the XP boot animation is visible.
     */
    this.preloadDesktopAssets();


    /*
     * Keep the existing 4-second XP boot screen.
     */
    this.timeoutId =
      setTimeout(
        () => {

          this.systemStateService
            .showLogin();

        },
        4000
      );
  }


  /* =====================================================
     DESTROY
  ===================================================== */

  ngOnDestroy(): void {

    if (
      this.timeoutId
    ) {

      clearTimeout(
        this.timeoutId
      );
    }
  }


  /* =====================================================
     PRELOAD DESKTOP ASSETS
  ===================================================== */

  private preloadDesktopAssets(): void {

    const assets: string[] = [

      /*
       * Current wallpaper
       */
      this.desktopService
        .currentWallpaper(),


      /*
       * Every desktop icon already registered
       * inside DesktopService.
       */
      ...this.desktopService
        .icons()
        .map(
          icon =>
            icon.icon
        ),


      /*
       * Taskbar
       */
      '/assets/logos/windows-xp-flag.png',


      /*
       * System tray
       */
      '/assets/icons/system/network.png',
      '/assets/icons/system/volume.png',
      '/assets/icons/system/security.png',
      '/assets/icons/system/usb.png',


      /*
       * System / context menu
       */
      '/assets/icons/system/cmd.png',


      /*
       * Icons used when creating files/folders
       */
      '/assets/icons/desktop/folder.png',
      '/assets/icons/desktop/text-document.png'

    ];


    /*
     * Remove duplicates.
     */
    const uniqueAssets =
      [...new Set(assets)];


    for (
      const src of uniqueAssets
    ) {

      if (
        !src
      ) {
        continue;
      }


      const image =
        new Image();


      /*
       * Starts the browser request.
       *
       * We don't display the image here.
       * It simply enters the browser cache
       * before the desktop becomes visible.
       */
      image.src =
        src;
    }
  }

}