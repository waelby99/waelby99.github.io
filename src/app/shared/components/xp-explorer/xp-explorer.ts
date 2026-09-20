import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-xp-explorer',
  standalone: true,
  imports: [],
  templateUrl: './xp-explorer.html',
  styleUrl: './xp-explorer.scss'
})
export class XpExplorer {
  @Input() title = 'Explorer';
  @Input() path = '';
  @Input() icon = '/assets/icons/desktop/folder.png';

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
}