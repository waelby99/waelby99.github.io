import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
  signal
} from '@angular/core';

type ResizeDirection =
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw';

interface WindowBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-xp-explorer',
  standalone: true,
  imports: [],
  templateUrl: './xp-explorer.html',
  styleUrl: './xp-explorer.scss'
})
export class XpExplorer implements AfterViewInit {
  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() title = 'Explorer';
  @Input() path = '';
  @Input() icon = '/assets/icons/desktop/folder.png';

  @Output() closed = new EventEmitter<void>();

  readonly left = signal(60);
  readonly top = signal(35);
  readonly width = signal(900);
  readonly height = signal(560);

  readonly maximized = signal(false);
  readonly minimized = signal(false);

  private previousBounds?: WindowBounds;

  private dragging = false;

  private dragStartX = 0;
  private dragStartY = 0;

  private dragStartLeft = 0;
  private dragStartTop = 0;

  private resizeDirection:
    ResizeDirection | null = null;

  private resizeStartX = 0;
  private resizeStartY = 0;

  private resizeStartBounds:
    WindowBounds | null = null;

  private activePointerElement:
    HTMLElement | null = null;

  private activePointerId:
    number | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setInitialBounds();
    });
  }

  private setInitialBounds(): void {
    const hostWidth =
      this.host.nativeElement.clientWidth;

    const hostHeight =
      this.host.nativeElement.clientHeight;

    if (
      hostWidth <= 0 ||
      hostHeight <= 0
    ) {
      return;
    }

    const horizontalMargin =
      hostWidth >= 800
        ? 60
        : 8;

    const verticalMargin =
      hostHeight >= 520
        ? 35
        : 8;

    const width = Math.min(
      960,
      Math.max(
        Math.min(500, hostWidth),
        hostWidth -
          horizontalMargin * 2
      )
    );

    const height = Math.min(
      620,
      Math.max(
        Math.min(320, hostHeight),
        hostHeight -
          verticalMargin * 2
      )
    );

    this.width.set(
      Math.min(width, hostWidth)
    );

    this.height.set(
      Math.min(height, hostHeight)
    );

    this.left.set(
      Math.max(
        0,
        Math.round(
          (
            hostWidth -
            this.width()
          ) / 2
        )
      )
    );

    this.top.set(
      Math.max(
        0,
        Math.round(
          (
            hostHeight -
            this.height()
          ) / 2
        )
      )
    );
  }

  close(
    event?: MouseEvent
  ): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.closed.emit();
  }

  minimize(
    event?: MouseEvent
  ): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.minimized.update(
      minimized => !minimized
    );
  }

  toggleMaximize(
    event?: MouseEvent
  ): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.minimized()) {
      this.minimized.set(false);
    }

    if (this.maximized()) {
      this.restoreWindow();
      return;
    }

    this.previousBounds = {
      left: this.left(),
      top: this.top(),
      width: this.width(),
      height: this.height()
    };

    this.maximizeWindow();
  }

  private maximizeWindow(): void {
    const hostWidth =
      this.host.nativeElement.clientWidth;

    const hostHeight =
      this.host.nativeElement.clientHeight;

    this.left.set(0);
    this.top.set(0);

    this.width.set(
      hostWidth
    );

    this.height.set(
      hostHeight
    );

    this.maximized.set(true);
  }

  private restoreWindow(): void {
    if (!this.previousBounds) {
      this.maximized.set(false);
      this.setInitialBounds();
      return;
    }

    this.left.set(
      this.previousBounds.left
    );

    this.top.set(
      this.previousBounds.top
    );

    this.width.set(
      this.previousBounds.width
    );

    this.height.set(
      this.previousBounds.height
    );

    this.maximized.set(false);

    this.clampWindowToHost();
  }

  startWindowDrag(
    event: PointerEvent
  ): void {
    if (
      event.button !== 0 ||
      this.maximized()
    ) {
      return;
    }

    const target =
      event.target;

    if (
      target instanceof Element &&
      target.closest(
        '.window-controls'
      )
    ) {
      return;
    }

    const titleBar =
      event.currentTarget;

    if (
      !(titleBar instanceof HTMLElement)
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.stopPointerInteraction();

    this.dragging =
      true;

    this.dragStartX =
      event.clientX;

    this.dragStartY =
      event.clientY;

    this.dragStartLeft =
      this.left();

    this.dragStartTop =
      this.top();

    this.activePointerElement =
      titleBar;

    this.activePointerId =
      event.pointerId;

    titleBar.setPointerCapture(
      event.pointerId
    );
  }

  startResize(
    event: PointerEvent,
    direction: ResizeDirection
  ): void {
    if (
      event.button !== 0 ||
      this.maximized() ||
      this.minimized()
    ) {
      return;
    }

    const handle =
      event.currentTarget;

    if (
      !(handle instanceof HTMLElement)
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.stopPointerInteraction();

    this.resizeDirection =
      direction;

    this.resizeStartX =
      event.clientX;

    this.resizeStartY =
      event.clientY;

    this.resizeStartBounds = {
      left: this.left(),
      top: this.top(),
      width: this.width(),
      height: this.height()
    };

    this.activePointerElement =
      handle;

    this.activePointerId =
      event.pointerId;

    handle.setPointerCapture(
      event.pointerId
    );
  }

  @HostListener(
    'document:pointermove',
    ['$event']
  )
  onPointerMove(
    event: PointerEvent
  ): void {
    if (this.dragging) {
      this.moveWindow(event);
      return;
    }

    if (
      this.resizeDirection &&
      this.resizeStartBounds
    ) {
      this.resizeWindow(event);
    }
  }

  private moveWindow(
    event: PointerEvent
  ): void {
    event.preventDefault();

    const hostWidth =
      this.host.nativeElement.clientWidth;

    const hostHeight =
      this.host.nativeElement.clientHeight;

    if (
      hostWidth <= 0 ||
      hostHeight <= 0
    ) {
      return;
    }

    const deltaX =
      event.clientX -
      this.dragStartX;

    const deltaY =
      event.clientY -
      this.dragStartY;

    let nextLeft =
      this.dragStartLeft +
      deltaX;

    let nextTop =
      this.dragStartTop +
      deltaY;

    /*
     * Like Windows XP:
     * window can move partially outside
     * the screen, but some title bar stays
     * reachable.
     */
    const visibleHorizontal =
      120;

    const visibleTitleBar =
      29;

    const minimumLeft =
      -this.width() +
      visibleHorizontal;

    const maximumLeft =
      hostWidth -
      visibleHorizontal;

    const minimumTop =
      0;

    const maximumTop =
      hostHeight -
      visibleTitleBar;

    nextLeft = Math.max(
      minimumLeft,
      Math.min(
        nextLeft,
        maximumLeft
      )
    );

    nextTop = Math.max(
      minimumTop,
      Math.min(
        nextTop,
        maximumTop
      )
    );

    this.left.set(
      Math.round(nextLeft)
    );

    this.top.set(
      Math.round(nextTop)
    );
  }

  private resizeWindow(
    event: PointerEvent
  ): void {
    if (
      !this.resizeDirection ||
      !this.resizeStartBounds
    ) {
      return;
    }

    event.preventDefault();

    const hostWidth =
      this.host.nativeElement.clientWidth;

    const hostHeight =
      this.host.nativeElement.clientHeight;

    const minimumWidth =
      Math.min(
        480,
        hostWidth
      );

    const minimumHeight =
      Math.min(
        320,
        hostHeight
      );

    const deltaX =
      event.clientX -
      this.resizeStartX;

    const deltaY =
      event.clientY -
      this.resizeStartY;

    const start =
      this.resizeStartBounds;

    let left =
      start.left;

    let top =
      start.top;

    let width =
      start.width;

    let height =
      start.height;

    if (
      this.resizeDirection.includes(
        'e'
      )
    ) {
      width = Math.max(
        minimumWidth,
        start.width +
          deltaX
      );

      width = Math.min(
        width,
        hostWidth -
          Math.max(
            0,
            start.left
          )
      );
    }

    if (
      this.resizeDirection.includes(
        's'
      )
    ) {
      height = Math.max(
        minimumHeight,
        start.height +
          deltaY
      );

      height = Math.min(
        height,
        hostHeight -
          Math.max(
            0,
            start.top
          )
      );
    }

    if (
      this.resizeDirection.includes(
        'w'
      )
    ) {
      const maximumWidth =
        start.left +
        start.width;

      width = Math.max(
        minimumWidth,
        start.width -
          deltaX
      );

      width = Math.min(
        width,
        maximumWidth
      );

      left =
        start.left +
        start.width -
        width;
    }

    if (
      this.resizeDirection.includes(
        'n'
      )
    ) {
      const maximumHeight =
        start.top +
        start.height;

      height = Math.max(
        minimumHeight,
        start.height -
          deltaY
      );

      height = Math.min(
        height,
        maximumHeight
      );

      top =
        start.top +
        start.height -
        height;
    }

    this.left.set(
      Math.round(
        Math.max(
          0,
          left
        )
      )
    );

    this.top.set(
      Math.round(
        Math.max(
          0,
          top
        )
      )
    );

    this.width.set(
      Math.round(width)
    );

    this.height.set(
      Math.round(height)
    );
  }

  @HostListener(
    'document:pointerup'
  )
  onPointerUp(): void {
    this.stopPointerInteraction();
  }

  @HostListener(
    'document:pointercancel'
  )
  onPointerCancel(): void {
    this.stopPointerInteraction();
  }

  private stopPointerInteraction(): void {
    if (
      this.activePointerElement &&
      this.activePointerId !== null
    ) {
      try {
        if (
          this.activePointerElement
            .hasPointerCapture(
              this.activePointerId
            )
        ) {
          this.activePointerElement
            .releasePointerCapture(
              this.activePointerId
            );
        }
      } catch {
        // Pointer already released.
      }
    }

    this.dragging =
      false;

    this.resizeDirection =
      null;

    this.resizeStartBounds =
      null;

    this.activePointerElement =
      null;

    this.activePointerId =
      null;
  }

  @HostListener(
    'window:resize'
  )
  onViewportResize(): void {
    if (this.maximized()) {
      this.maximizeWindow();
      return;
    }

    this.clampWindowToHost();
  }

  private clampWindowToHost(): void {
    const hostWidth =
      this.host.nativeElement.clientWidth;

    const hostHeight =
      this.host.nativeElement.clientHeight;

    if (
      hostWidth <= 0 ||
      hostHeight <= 0
    ) {
      return;
    }

    const width =
      Math.min(
        this.width(),
        hostWidth
      );

    const height =
      Math.min(
        this.height(),
        hostHeight
      );

    const visibleHorizontal =
      Math.min(
        120,
        width
      );

    const renderedHeight =
      this.minimized()
        ? 29
        : height;

    const left =
      Math.max(
        -width +
          visibleHorizontal,
        Math.min(
          this.left(),
          hostWidth -
            visibleHorizontal
        )
      );

    const top =
      Math.max(
        0,
        Math.min(
          this.top(),
          hostHeight -
            Math.min(
              29,
              renderedHeight
            )
        )
      );

    this.width.set(width);
    this.height.set(height);

    this.left.set(
      Math.round(left)
    );

    this.top.set(
      Math.round(top)
    );
  }
}