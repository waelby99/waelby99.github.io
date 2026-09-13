import {
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  TranslatePipe
} from '@ngx-translate/core';

import {
  DesktopIcon,
  DesktopService
} from '../../core/services/desktop';

import {
  DisplayProperties
} from '../../applications/display-properties/display-properties';

import {
  Taskbar
} from '../taskbar/taskbar';


type DesktopSubmenu =
  | 'sort'
  | 'new'
  | null;


@Component({
  selector:
    'app-desktop',

  standalone:
    true,

  imports: [
    TranslatePipe,
    DisplayProperties,
    Taskbar
  ],

  templateUrl:
    './desktop.html',

  styleUrl:
    './desktop.scss'
})
export class Desktop {


  /* =====================================================
     SERVICES
  ===================================================== */

  readonly desktopService =
    inject(DesktopService);


  /* =====================================================
     STARTUP NOTICE
  ===================================================== */

  readonly startupNoticeOpen =
    signal(
      sessionStorage.getItem(
        'xp-startup-notice-seen'
      ) !== 'true'
    );


  /* =====================================================
     CONTEXT MENU
  ===================================================== */

  readonly contextMenuOpen =
    signal(false);


  readonly contextMenuX =
    signal(0);


  readonly contextMenuY =
    signal(0);


  readonly activeSubmenu =
    signal<DesktopSubmenu>(
      null
    );


  /* =====================================================
     WINDOWS
  ===================================================== */

  readonly cmdOpen =
    signal(false);


  readonly displayPropertiesOpen =
    signal(false);


  readonly iconsVisible =
    signal(true);


  /* =====================================================
     WALLPAPER
  ===================================================== */

  readonly desktopBackgroundSize =
    computed(() => {

      switch (
        this.desktopService
          .currentWallpaperPosition()
      ) {

        case 'stretch':

          return '100% 100%';


        case 'center':

        case 'tile':

        default:

          return 'auto';
      }
    });


  readonly desktopBackgroundRepeat =
    computed(() => {

      return (
        this.desktopService
          .currentWallpaperPosition() ===
        'tile'
          ? 'repeat'
          : 'no-repeat'
      );
    });


  /* =====================================================
     PRIVATE STATE
  ===================================================== */

  private contextDesktopX =
    0;


  private contextDesktopY =
    0;


  private draggingIconId:
    string | null =
    null;


  private dragOffsetX =
    0;


  private dragOffsetY =
    0;


  /* =====================================================
     STARTUP NOTICE
  ===================================================== */

  closeStartupNotice(): void {

    sessionStorage.setItem(
      'xp-startup-notice-seen',
      'true'
    );


    this.startupNoticeOpen
      .set(false);
  }


  /* =====================================================
     RIGHT CLICK
  ===================================================== */

  openDesktopContextMenu(
    event: MouseEvent
  ): void {

    event.preventDefault();

    event.stopPropagation();


    this.activeSubmenu
      .set(null);


    const menuWidth =
      215;


    const menuHeight =
      230;


    this.contextMenuX.set(
      Math.max(
        4,

        Math.min(
          event.clientX,

          window.innerWidth -
          menuWidth -
          4
        )
      )
    );


    this.contextMenuY.set(
      Math.max(
        4,

        Math.min(
          event.clientY,

          window.innerHeight -
          40 -
          menuHeight -
          4
        )
      )
    );


    this.contextDesktopX =
      event.clientX;


    this.contextDesktopY =
      event.clientY;


    this.contextMenuOpen
      .set(true);
  }


  closeContextMenu(): void {

    this.contextMenuOpen
      .set(false);


    this.activeSubmenu
      .set(null);
  }


  setSubmenu(
    menu: DesktopSubmenu
  ): void {

    this.activeSubmenu
      .set(menu);
  }


  clearSubmenu(): void {

    this.activeSubmenu
      .set(null);
  }


  /* =====================================================
     REFRESH
  ===================================================== */

  refreshDesktop(): void {

    this.closeContextMenu();


    this.iconsVisible
      .set(false);


    this.desktopService
      .refresh();


    setTimeout(
      () => {

        this.iconsVisible
          .set(true);

      },
      70
    );
  }


  /* =====================================================
     SORT
  ===================================================== */

  sortIconsByName(): void {

    this.desktopService
      .sortIconsByName();


    this.closeContextMenu();
  }


  sortIconsByType(): void {

    this.desktopService
      .sortIconsByType();


    this.closeContextMenu();
  }


  /* =====================================================
     NEW
  ===================================================== */

  createTextDocument(): void {

    const position =
      this.getSafeContextPosition();


    this.desktopService
      .createTextFile(
        position.x,
        position.y
      );


    this.closeContextMenu();
  }


  createFolder(): void {

    const position =
      this.getSafeContextPosition();


    this.desktopService
      .createFolder(
        position.x,
        position.y
      );


    this.closeContextMenu();
  }


  private getSafeContextPosition(): {
    x: number;
    y: number;
  } {

    const iconWidth =
      86;


    const iconHeight =
      82;


    const taskbarHeight =
      40;


    return {

      x:
        Math.max(
          0,

          Math.min(
            this.contextDesktopX,

            window.innerWidth -
            iconWidth
          )
        ),


      y:
        Math.max(
          0,

          Math.min(
            this.contextDesktopY,

            window.innerHeight -
            taskbarHeight -
            iconHeight
          )
        )
    };
  }


  /* =====================================================
     CMD
  ===================================================== */

  openCommandPrompt(): void {

    this.cmdOpen
      .set(true);


    this.closeContextMenu();
  }


  closeCommandPrompt(): void {

    this.cmdOpen
      .set(false);
  }


  /* =====================================================
     DISPLAY PROPERTIES
  ===================================================== */

  openDisplayProperties(): void {

    this.displayPropertiesOpen
      .set(true);


    this.closeContextMenu();
  }


  closeDisplayProperties(): void {

    this.displayPropertiesOpen
      .set(false);
  }


  /* =====================================================
     FULL SCREEN
  ===================================================== */

  async toggleFullScreen():
    Promise<void> {

    this.closeContextMenu();


    try {

      if (
        !document.fullscreenElement
      ) {

        await document
          .documentElement
          .requestFullscreen();

      } else {

        await document
          .exitFullscreen();
      }

    } catch (error) {

      console.warn(
        'Fullscreen failed:',
        error
      );
    }
  }


  /* =====================================================
     ICON DRAG
  ===================================================== */

  startIconDrag(
    event: PointerEvent,
    icon: DesktopIcon
  ): void {

    if (
      event.button !== 0
    ) {
      return;
    }


    this.closeContextMenu();


    event.preventDefault();


    this.draggingIconId =
      icon.id;


    this.dragOffsetX =
      event.clientX -
      icon.x;


    this.dragOffsetY =
      event.clientY -
      icon.y;


    const target =
      event.currentTarget;


    if (
      !(target instanceof HTMLElement)
    ) {
      return;
    }


    target.setPointerCapture(
      event.pointerId
    );
  }


  moveIcon(
    event: PointerEvent
  ): void {

    if (
      !this.draggingIconId
    ) {
      return;
    }


    const iconWidth =
      86;


    const iconHeight =
      82;


    const taskbarHeight =
      40;


    let x =
      event.clientX -
      this.dragOffsetX;


    let y =
      event.clientY -
      this.dragOffsetY;


    x =
      Math.max(
        0,

        Math.min(
          x,

          window.innerWidth -
          iconWidth
        )
      );


    y =
      Math.max(
        0,

        Math.min(
          y,

          window.innerHeight -
          taskbarHeight -
          iconHeight
        )
      );


    this.desktopService
      .moveIcon(
        this.draggingIconId,
        x,
        y
      );
  }


  finishIconDrag(): void {

    if (
      !this.draggingIconId
    ) {
      return;
    }


    this.desktopService
      .saveIcons();


    this.draggingIconId =
      null;
  }


  /* =====================================================
     GLOBAL EVENTS
  ===================================================== */

  @HostListener(
    'document:click'
  )
  closeMenus(): void {

    this.closeContextMenu();
  }


  @HostListener(
    'document:keydown.escape'
  )
  escape(): void {

    this.closeContextMenu();
  }

}