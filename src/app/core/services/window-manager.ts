import { Injectable, signal } from '@angular/core';

export type WindowApplication =
  | 'about'
  | 'education'
  | 'cmd'
  | 'display-properties';

export type NavigableWindowApplication =
  | 'about'
  | 'education';

export interface WindowBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ManagedWindow {
  id: string;
  app: WindowApplication;

  title: string;
  translateTitle: boolean;

  icon: string;

  minimized: boolean;
  active: boolean;

  zIndex: number;

  cascadeOffset: number;

  bounds?: WindowBounds;
  restoreBounds?: WindowBounds;

  maximized: boolean;
}

interface WindowDefinition {
  title: string;
  translateTitle: boolean;
  icon: string;
}

const WINDOW_DEFINITIONS: Record<WindowApplication, WindowDefinition> = {
  about: {
    title: 'ABOUT.TITLE',
    translateTitle: true,
    icon: '/assets/icons/desktop/tour-xp.png'
  },

  education: {
    title: 'EDUCATION.TITLE',
    translateTitle: true,
    icon: '/assets/icons/desktop/education.png'
  },

  cmd: {
    title: 'C:\\WINDOWS\\system32\\cmd.exe',
    translateTitle: false,
    icon: '/assets/icons/system/cmd.png'
  },

  'display-properties': {
    title: 'SYSTEM.PROPERTIES',
    translateTitle: true,
    icon: '/assets/icons/desktop/folder.png'
  }
};

@Injectable({
  providedIn: 'root'
})
export class WindowManagerService {
  readonly windows = signal<ManagedWindow[]>([]);

  private windowCounter = 0;
  private zCounter = 100;

  open(app: WindowApplication): string {
    this.windowCounter++;
    this.zCounter++;

    const definition = WINDOW_DEFINITIONS[app];

    const id = `${app}-${this.windowCounter}`;

    const newWindow: ManagedWindow = {
      id,
      app,

      title: definition.title,
      translateTitle: definition.translateTitle,

      icon: definition.icon,

      minimized: false,
      active: true,

      zIndex: this.zCounter,

      cascadeOffset:
        ((this.windowCounter - 1) % 8) * 24,

      maximized: false
    };

    this.windows.update(windows => [
      ...windows.map(window => ({
        ...window,
        active: false
      })),
      newWindow
    ]);

    return id;
  }

  close(id: string): void {
    const wasActive =
      this.windows()
        .find(window => window.id === id)
        ?.active ?? false;

    this.windows.update(windows =>
      windows.filter(window => window.id !== id)
    );

    if (wasActive) {
      this.activateHighestVisibleWindow();
    }
  }

  focus(id: string): void {
    const target =
      this.windows()
        .find(window => window.id === id);

    if (!target) {
      return;
    }

    this.zCounter++;

    this.windows.update(windows =>
      windows.map(window => {
        if (window.id === id) {
          return {
            ...window,
            active: true,
            minimized: false,
            zIndex: this.zCounter
          };
        }

        return {
          ...window,
          active: false
        };
      })
    );
  }

  minimize(id: string): void {
    const target =
      this.windows()
        .find(window => window.id === id);

    if (!target) {
      return;
    }

    const wasActive = target.active;

    this.windows.update(windows =>
      windows.map(window => {
        if (window.id !== id) {
          return window;
        }

        return {
          ...window,
          minimized: true,
          active: false
        };
      })
    );

    if (wasActive) {
      this.activateHighestVisibleWindow();
    }
  }

  restore(id: string): void {
    this.focus(id);
  }

  toggleFromTaskbar(id: string): void {
    const window =
      this.windows()
        .find(item => item.id === id);

    if (!window) {
      return;
    }

    if (window.minimized) {
      this.restore(id);
      return;
    }

    if (window.active) {
      this.minimize(id);
      return;
    }

    this.focus(id);
  }

  navigate(
    id: string,
    app: NavigableWindowApplication
  ): void {
    const definition =
      WINDOW_DEFINITIONS[app];

    this.windows.update(windows =>
      windows.map(window => {
        if (window.id !== id) {
          return window;
        }

        return {
          ...window,

          app,

          title:
            definition.title,

          translateTitle:
            definition.translateTitle,

          icon:
            definition.icon,

          minimized: false
        };
      })
    );

    this.focus(id);
  }

  getWindow(
    id: string
  ): ManagedWindow | undefined {
    return this.windows()
      .find(window => window.id === id);
  }

  updateGeometry(
    id: string,
    data: {
      bounds?: WindowBounds;
      restoreBounds?: WindowBounds;
      maximized?: boolean;
    }
  ): void {
    this.windows.update(windows =>
      windows.map(window => {
        if (window.id !== id) {
          return window;
        }

        return {
          ...window,
          ...data
        };
      })
    );
  }

  private activateHighestVisibleWindow(): void {
    const candidate =
      this.windows()
        .filter(window => !window.minimized)
        .sort(
          (a, b) =>
            b.zIndex - a.zIndex
        )[0];

    if (!candidate) {
      this.windows.update(windows =>
        windows.map(window => ({
          ...window,
          active: false
        }))
      );

      return;
    }

    this.windows.update(windows =>
      windows.map(window => ({
        ...window,
        active:
          window.id === candidate.id
      }))
    );
  }
}