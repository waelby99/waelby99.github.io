import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './welcome-screen.html',
  styleUrl: './welcome-screen.scss'
})
export class WelcomeScreen {}