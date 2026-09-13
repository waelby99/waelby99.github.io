import {
  Component,
  EventEmitter,
  Output,
  inject,
  signal
} from '@angular/core';

import {
  TranslatePipe
} from '@ngx-translate/core';

import {
  DesktopService,
  WallpaperPosition
} from '../../core/services/desktop';


@Component({
  selector: 'app-display-properties',

  standalone: true,

  imports: [
    TranslatePipe
  ],

  templateUrl:
    './display-properties.html',

  styleUrl:
    './display-properties.scss'
})
export class DisplayProperties {

  private readonly desktopService =
    inject(DesktopService);


  @Output()
  readonly closed =
    new EventEmitter<void>();


  readonly selectedWallpaper =
    signal<string>(
      this.desktopService.currentWallpaper()
    );


  readonly selectedPosition =
    signal<WallpaperPosition>(
      this.desktopService.currentWallpaperPosition()
    );


  readonly wallpapers =
    this.desktopService.wallpaperOptions;


  /* =====================================================
     WALLPAPER
  ===================================================== */

  selectWallpaper(
    path: string
  ): void {

    this.selectedWallpaper.set(path);
  }


  /* =====================================================
     POSITION
  ===================================================== */

  selectPosition(
    event: Event
  ): void {

    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    const value = target.value;

    if (
      value === 'center' ||
      value === 'tile' ||
      value === 'stretch'
    ) {

      this.selectedPosition.set(value);
    }
  }


  /* =====================================================
     APPLY
  ===================================================== */

  apply(): void {

    this.desktopService.applyWallpaper(
      this.selectedWallpaper(),
      this.selectedPosition()
    );
  }


  /* =====================================================
     OK
  ===================================================== */

  ok(): void {

    this.apply();

    this.closed.emit();
  }


  /* =====================================================
     CANCEL
  ===================================================== */

  cancel(): void {

    this.closed.emit();
  }


  /* =====================================================
     PREVIEW SIZE
  ===================================================== */

  previewSize(): string {

    switch (this.selectedPosition()) {

      case 'stretch':
        return '100% 100%';

      case 'center':
        return 'auto';

      case 'tile':
        return '75px 55px';

      default:
        return 'auto';
    }
  }


  /* =====================================================
     PREVIEW REPEAT
  ===================================================== */

  previewRepeat(): string {

    if (
      this.selectedPosition() === 'tile'
    ) {

      return 'repeat';
    }

    return 'no-repeat';
  }
}