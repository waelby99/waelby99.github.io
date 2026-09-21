import { Injectable, signal } from '@angular/core';

export type WallpaperPosition =
  | 'center'
  | 'tile'
  | 'stretch';

export interface WallpaperOption {
  id: string;
  name: string;
  path: string;
}

export interface DesktopIcon {
  id: string;
  icon: string;
  labelKey?: string;
  name?: string;
  x: number;
  y: number;

  type:
    | 'application'
    | 'folder'
    | 'file'
    | 'system';
}

@Injectable({
  providedIn: 'root'
})
export class DesktopService {
  private readonly iconsStorageKey =
    'wael-xp-desktop-icons';

  private readonly wallpaperStorageKey =
    'wael-xp-wallpaper-v5';

  private readonly wallpaperPositionStorageKey =
    'wael-xp-wallpaper-position-v5';

  private readonly defaultWallpaper =
    '/assets/wallpapers/wallpaper.jpg';

  readonly wallpaperOptions: WallpaperOption[] = [
    {
      id: 'default-xp',
      name: 'Bliss',
      path: '/assets/wallpapers/wallpaper.jpg'
    },
    {
      id: 'autumn',
      name: 'Autumn',
      path: '/assets/wallpapers/autumn.jpg'
    },
    {
      id: 'mountains',
      name: 'Mountains',
      path: '/assets/wallpapers/mountains.jpg'
    },
    {
      id: 'lake',
      name: 'Lake',
      path: '/assets/wallpapers/lake.jpg'
    }
  ];

  private readonly defaultIcons: DesktopIcon[] = [
    {
      id: 'my-computer',
      icon: '/assets/icons/desktop/my-computer.png',
      labelKey: 'SYSTEM.MY_COMPUTER',
      x: 10,
      y: 14,
      type: 'system'
    },
    {
      id: 'my-documents',
      icon: '/assets/icons/desktop/my-documents.png',
      labelKey: 'SYSTEM.MY_DOCUMENTS',
      x: 10,
      y: 104,
      type: 'folder'
    },
    {
      id: 'internet-explorer',
      icon: '/assets/icons/desktop/internet-explorer.png',
      labelKey: 'SYSTEM.INTERNET_EXPLORER',
      x: 10,
      y: 194,
      type: 'application'
    },
    {
      id: 'projects',
      icon: '/assets/icons/desktop/projects.png',
      labelKey: 'SYSTEM.PROJECTS',
      x: 10,
      y: 284,
      type: 'folder'
    },
    {
      id: 'recycle-bin',
      icon: '/assets/icons/desktop/recycle-bin.png',
      labelKey: 'SYSTEM.RECYCLE_BIN',
      x: 10,
      y: 374,
      type: 'system'
    },
    {
      id: 'education',
      icon: '/assets/icons/desktop/education.png',
      labelKey: 'SYSTEM.EDUCATION',
      x: 100,
      y: 14,
      type: 'folder'
    }
  ];

  readonly icons = signal<DesktopIcon[]>(
    this.loadIcons()
  );

  readonly currentWallpaper = signal<string>(
    this.loadWallpaper()
  );

  readonly currentWallpaperPosition =
    signal<WallpaperPosition>(
      this.loadWallpaperPosition()
    );

  moveIcon(
    id: string,
    x: number,
    y: number,
    persist = false
  ): void {
    this.icons.update(icons =>
      icons.map(icon =>
        icon.id === id
          ? {
              ...icon,
              x,
              y
            }
          : icon
      )
    );

    if (persist) {
      this.saveIcons();
    }
  }

  createTextFile(
    x: number,
    y: number
  ): void {
    const count = this.icons()
      .filter(icon =>
        icon.id.startsWith('text-file-')
      )
      .length;

    const name =
      count === 0
        ? 'New Text Document.txt'
        : `New Text Document (${count + 1}).txt`;

    const file: DesktopIcon = {
      id: `text-file-${Date.now()}`,
      icon: '/assets/icons/desktop/text-document.png',
      name,
      x,
      y,
      type: 'file'
    };

    this.icons.update(icons => [
      ...icons,
      file
    ]);

    this.saveIcons();
  }

  createFolder(
    x: number,
    y: number
  ): void {
    const count = this.icons()
      .filter(icon =>
        icon.id.startsWith('folder-')
      )
      .length;

    const name =
      count === 0
        ? 'New Folder'
        : `New Folder (${count + 1})`;

    const folder: DesktopIcon = {
      id: `folder-${Date.now()}`,
      icon: '/assets/icons/desktop/folder.png',
      name,
      x,
      y,
      type: 'folder'
    };

    this.icons.update(icons => [
      ...icons,
      folder
    ]);

    this.saveIcons();
  }

  sortIconsByName(): void {
    const sorted = [...this.icons()].sort(
      (a, b) => {
        const first =
          a.name ??
          a.labelKey ??
          '';

        const second =
          b.name ??
          b.labelKey ??
          '';

        return first.localeCompare(second);
      }
    );

    this.repositionIcons(sorted);
  }

  sortIconsByType(): void {
    const sorted = [...this.icons()].sort(
      (a, b) =>
        a.type.localeCompare(b.type)
    );

    this.repositionIcons(sorted);
  }

  private repositionIcons(
    icons: DesktopIcon[]
  ): void {
    const iconHeight = 90;
    const iconWidth = 90;

    const availableHeight =
      window.innerHeight - 50;

    const iconsPerColumn = Math.max(
      1,
      Math.floor(
        availableHeight / iconHeight
      )
    );

    const positioned = icons.map(
      (icon, index) => {
        const column = Math.floor(
          index / iconsPerColumn
        );

        const row =
          index % iconsPerColumn;

        return {
          ...icon,
          x: 10 + column * iconWidth,
          y: 14 + row * iconHeight
        };
      }
    );

    this.icons.set(positioned);
    this.saveIcons();
  }

  refresh(): void {
    this.icons.update(icons => [
      ...icons
    ]);
  }

  applyWallpaper(
    path: string,
    position: WallpaperPosition
  ): void {
    this.currentWallpaper.set(path);
    this.currentWallpaperPosition.set(position);

    localStorage.setItem(
      this.wallpaperStorageKey,
      path
    );

    localStorage.setItem(
      this.wallpaperPositionStorageKey,
      position
    );
  }

  saveIcons(): void {
    localStorage.setItem(
      this.iconsStorageKey,
      JSON.stringify(this.icons())
    );
  }

  private loadIcons(): DesktopIcon[] {
    const saved = localStorage.getItem(
      this.iconsStorageKey
    );

    if (!saved) {
      return [
        ...this.defaultIcons
      ];
    }

    try {
      const savedIcons =
        JSON.parse(saved) as DesktopIcon[];

      const savedIds = new Set(
        savedIcons.map(icon => icon.id)
      );

      const missingDefaultIcons =
        this.defaultIcons.filter(
          icon =>
            !savedIds.has(icon.id)
        );

      const mergedIcons = [
        ...savedIcons,
        ...missingDefaultIcons
      ];

      localStorage.setItem(
        this.iconsStorageKey,
        JSON.stringify(mergedIcons)
      );

      return mergedIcons;
    } catch {
      return [
        ...this.defaultIcons
      ];
    }
  }

  private loadWallpaper(): string {
    const saved = localStorage.getItem(
      this.wallpaperStorageKey
    );

    return saved ?? this.defaultWallpaper;
  }

  private loadWallpaperPosition():
    WallpaperPosition {
    const saved = localStorage.getItem(
      this.wallpaperPositionStorageKey
    ) as WallpaperPosition | null;

    if (
      saved === 'center' ||
      saved === 'tile' ||
      saved === 'stretch'
    ) {
      return saved;
    }

    return 'stretch';
  }
}