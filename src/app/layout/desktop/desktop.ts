import {
  Component,
  HostListener,
  inject,
  signal
} from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import {
  DesktopIcon,
  DesktopService
} from '../../core/services/desktop';

import { DisplayProperties } from '../../applications/display-properties/display-properties';
import { Education } from '../../applications/education/education';

import { Taskbar } from '../taskbar/taskbar';

type DesktopSubmenu =
  | 'sort'
  | 'new'
  | null;

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [
    TranslatePipe,
    DisplayProperties,
    Education,
    Taskbar
  ],
  templateUrl: './desktop.html',
  styleUrl: './desktop.scss'
})
export class Desktop {
  readonly desktopService =
    inject(DesktopService);

  readonly iconsVisible =
    signal(true);

  readonly cmdOpen =
    signal(false);

  readonly displayPropertiesOpen =
    signal(false);

  readonly educationOpen =
    signal(false);

  readonly contextMenuOpen =
    signal(false);

  readonly contextMenuX =
    signal(0);

  readonly contextMenuY =
    signal(0);

  readonly activeSubmenu =
    signal<DesktopSubmenu>(null);

  readonly startupNoticeOpen =
    signal(
      sessionStorage.getItem(
        'xp-startup-notice-seen'
      ) !== 'true'
    );

  private draggingIconId:
    string | null = null;

  private dragOffsetX = 0;
  private dragOffsetY = 0;

  private dragStartX = 0;
  private dragStartY = 0;

  private iconWasDragged = false;

  desktopBackgroundSize(): string {
    switch (
      this.desktopService
        .currentWallpaperPosition()
    ) {
      case 'center':
      case 'tile':
        return 'auto';

      case 'stretch':
      default:
        return '100% 100%';
    }
  }

  desktopBackgroundRepeat(): string {
    switch (
      this.desktopService
        .currentWallpaperPosition()
    ) {
      case 'tile':
        return 'repeat';

      case 'center':
      case 'stretch':
      default:
        return 'no-repeat';
    }
  }

  startIconDrag(
    event: PointerEvent,
    icon: DesktopIcon
  ): void {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();

    this.closeContextMenu();

    const target =
      event.currentTarget;

    if (
      !(target instanceof HTMLElement)
    ) {
      return;
    }

    const rect =
      target.getBoundingClientRect();

    this.dragOffsetX =
      event.clientX -
      rect.left;

    this.dragOffsetY =
      event.clientY -
      rect.top;

    this.dragStartX =
      event.clientX;

    this.dragStartY =
      event.clientY;

    this.draggingIconId =
      icon.id;

    this.iconWasDragged =
      false;

    target.setPointerCapture(
      event.pointerId
    );
  }

  moveIcon(
    event: PointerEvent
  ): void {
    if (!this.draggingIconId) {
      return;
    }

    const distanceX =
      Math.abs(
        event.clientX -
        this.dragStartX
      );

    const distanceY =
      Math.abs(
        event.clientY -
        this.dragStartY
      );

    /*
     * Ignore tiny mouse movement.
     *
     * This is important so a normal
     * Windows-style double click does not
     * accidentally count as dragging.
     */
    if (
      !this.iconWasDragged &&
      distanceX < 4 &&
      distanceY < 4
    ) {
      return;
    }

    this.iconWasDragged = true;

    const desktop =
      event.currentTarget;

    if (
      !(desktop instanceof HTMLElement)
    ) {
      return;
    }

    const rect =
      desktop.getBoundingClientRect();

    let x =
      event.clientX -
      rect.left -
      this.dragOffsetX;

    let y =
      event.clientY -
      rect.top -
      this.dragOffsetY;

    const maxX =
      Math.max(
        0,
        rect.width - 80
      );

    const maxY =
      Math.max(
        0,
        rect.height - 130
      );

    x = Math.max(
      0,
      Math.min(x, maxX)
    );

    y = Math.max(
      0,
      Math.min(y, maxY)
    );

    this.desktopService.moveIcon(
      this.draggingIconId,
      Math.round(x),
      Math.round(y)
    );
  }

  finishIconDrag(): void {
    if (!this.draggingIconId) {
      return;
    }

    if (this.iconWasDragged) {
      this.desktopService.saveIcons();
    }

    this.draggingIconId =
      null;
  }

  openDesktopIcon(
    icon: DesktopIcon,
    event: MouseEvent
  ): void {
    event.preventDefault();
    event.stopPropagation();

    /*
     * Don't open applications when the user
     * has just dragged the icon.
     */
    if (this.iconWasDragged) {
      this.iconWasDragged = false;
      return;
    }

    this.closeContextMenu();

    switch (icon.id) {
      case 'education':
        this.openEducation();
        break;

      default:
        console.log(
          'Desktop icon opened:',
          icon.id
        );
        break;
    }
  }

  openEducation(): void {
    this.educationOpen.set(true);
    this.closeContextMenu();
  }

  closeEducation(): void {
    this.educationOpen.set(false);
  }

  openCommandPrompt(): void {
    this.cmdOpen.set(true);
    this.closeContextMenu();
  }

  closeCommandPrompt(): void {
    this.cmdOpen.set(false);
  }

  openDisplayProperties(): void {
    this.displayPropertiesOpen.set(true);
    this.closeContextMenu();
  }

  closeDisplayProperties(): void {
    this.displayPropertiesOpen.set(false);
  }

  openDesktopContextMenu(
    event: MouseEvent
  ): void {
    event.preventDefault();
    event.stopPropagation();

    const desktop =
      event.currentTarget;

    let x =
      event.clientX;

    let y =
      event.clientY;

    if (
      desktop instanceof HTMLElement &&
      desktop.classList.contains(
        'desktop'
      )
    ) {
      const rect =
        desktop.getBoundingClientRect();

      x -= rect.left;
      y -= rect.top;
    }

    const menuWidth =
      210;

    const menuHeight =
      310;

    x = Math.min(
      x,
      window.innerWidth -
        menuWidth -
        5
    );

    y = Math.min(
      y,
      window.innerHeight -
        menuHeight -
        45
    );

    this.contextMenuX.set(
      Math.max(0, x)
    );

    this.contextMenuY.set(
      Math.max(0, y)
    );

    this.activeSubmenu.set(null);
    this.contextMenuOpen.set(true);
  }

  closeContextMenu(): void {
    this.contextMenuOpen.set(false);
    this.activeSubmenu.set(null);
  }

  setSubmenu(
    submenu: Exclude<
      DesktopSubmenu,
      null
    >
  ): void {
    this.activeSubmenu.set(
      submenu
    );
  }

  clearSubmenu(): void {
    this.activeSubmenu.set(null);
  }

  refreshDesktop(): void {
    this.desktopService.refresh();
    this.closeContextMenu();
  }

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

  createFolder(): void {
    this.desktopService.createFolder(
      this.contextMenuX(),
      this.contextMenuY()
    );

    this.closeContextMenu();
  }

  createTextDocument(): void {
    this.desktopService.createTextFile(
      this.contextMenuX(),
      this.contextMenuY()
    );

    this.closeContextMenu();
  }

  toggleFullScreen(): void {
    this.closeContextMenu();

    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch(error => {
          console.warn(
            'Could not enter fullscreen:',
            error
          );
        });

      return;
    }

    document
      .exitFullscreen()
      .catch(error => {
        console.warn(
          'Could not exit fullscreen:',
          error
        );
      });
  }

  closeStartupNotice(): void {
    this.startupNoticeOpen.set(false);

    sessionStorage.setItem(
      'xp-startup-notice-seen',
      'true'
    );
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeContextMenu();
  }

  @HostListener(
    'document:keydown.escape'
  )
  onEscape(): void {
    this.closeContextMenu();
  }
}