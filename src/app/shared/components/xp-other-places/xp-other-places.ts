import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

export type PortfolioSection =
  | 'education'
  | 'projects'
  | 'certifications'
  | 'experience';

interface PortfolioPlace {
  id: PortfolioSection;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'app-xp-other-places',
  standalone: true,
  imports: [
    TranslatePipe
  ],
  templateUrl: './xp-other-places.html',
  styleUrl: './xp-other-places.scss'
})
export class XpOtherPlaces {
  @Input({ required: true })
  currentSection!: PortfolioSection;

  @Output()
  navigate =
    new EventEmitter<PortfolioSection>();

  readonly places: PortfolioPlace[] = [
    {
      id: 'education',
      labelKey: 'SYSTEM.EDUCATION',
      icon: '/assets/icons/desktop/education.png'
    },
    {
      id: 'projects',
      labelKey: 'SYSTEM.PROJECTS',
      icon: '/assets/icons/desktop/projects.png'
    },
    {
      id: 'certifications',
      labelKey: 'SYSTEM.CERTIFICATIONS',
      icon: '/assets/icons/desktop/certifications.png'
    },
    {
      id: 'experience',
      labelKey: 'SYSTEM.PROFESSIONAL_EXPERIENCE',
      icon: '/assets/icons/desktop/experience.png'
    }
  ];

  get visiblePlaces(): PortfolioPlace[] {
    return this.places.filter(
      place =>
        place.id !== this.currentSection
    );
  }

  open(
    place: PortfolioPlace
  ): void {
    this.navigate.emit(place.id);
  }
}