import {
  Component,
  HostListener,
  inject
} from '@angular/core';

import {
  BootScreen
} from './layout/boot-screen/boot-screen';

import {
  LoginScreen
} from './layout/login-screen/login-screen';

import {
  WelcomeScreen
} from './layout/welcome-screen/welcome-screen';

import {
  Desktop
} from './layout/desktop/desktop';

import {
  SystemStateService
} from './core/services/system-state';


@Component({
  selector:
    'app-root',

  standalone:
    true,

  imports: [
    BootScreen,
    LoginScreen,
    WelcomeScreen,
    Desktop
  ],

  templateUrl:
    './app.html',

  styleUrl:
    './app.scss'
})
export class App {

  readonly systemStateService =
    inject(
      SystemStateService
    );


  @HostListener(
    'document:contextmenu',
    ['$event']
  )
  disableNativeContextMenu(
    event: MouseEvent
  ): void {

    event.preventDefault();
  }
}