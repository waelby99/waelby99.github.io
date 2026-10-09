import {
  Component,
  inject
} from '@angular/core';

import {
  TranslatePipe
} from '@ngx-translate/core';

import {
  WindowManagerService
} from '../../core/services/window-manager';

import {
  SystemTray
} from '../system-tray/system-tray';

@Component({
  selector: 'app-taskbar',
  standalone: true,

  imports: [
    TranslatePipe,
    SystemTray
  ],

  templateUrl: './taskbar.html',
  styleUrl: './taskbar.scss'
})
export class Taskbar {
  readonly windowManager =
    inject(WindowManagerService);
}