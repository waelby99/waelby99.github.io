import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  signal
} from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from '../../core/services/language.service';
import { XpExplorer } from '../../shared/components/xp-explorer/xp-explorer';

import {
  PortfolioSection,
  XpOtherPlaces
} from '../../shared/components/xp-other-places/xp-other-places';

interface LocalizedText {
  en: string;
  fr: string;
  ar: string;
}

interface LocalizedList {
  en: string[];
  fr: string[];
  ar: string[];
}

export interface EducationEntry {
  id: string;
  institution: LocalizedText;
  degree: LocalizedText;
  field: LocalizedText;
  location: LocalizedText;
  period: string;
  average: string;
  estimatedGpa: string;
  description: LocalizedText;
  coursework: LocalizedList;
  icon?: string;
}

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [
    TranslatePipe,
    XpExplorer,
    XpOtherPlaces
  ],
  templateUrl: './education.html',
  styleUrl: './education.scss'
})
export class Education implements OnInit {
  readonly languageService =
    inject(LanguageService);

  @Output()
  closed =
    new EventEmitter<void>();

  @Output()
  navigate =
    new EventEmitter<PortfolioSection>();

  readonly education =
    signal<EducationEntry[]>([]);

  readonly selectedEducation =
    signal<EducationEntry | null>(null);

  readonly loading =
    signal(true);

  readonly educationTasksOpen =
    signal(true);

  readonly otherPlacesOpen =
    signal(true);

  readonly detailsOpen =
    signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadEducation();
  }

  private async loadEducation(): Promise<void> {
    try {
      const response =
        await fetch('/data/education.json');

      if (!response.ok) {
        throw new Error(
          `Failed to load education.json: ${response.status}`
        );
      }

      const data =
        await response.json() as EducationEntry[];

      this.education.set(data);

      if (data.length > 0) {
        this.selectedEducation.set(
          data[0]
        );
      }
    } catch (error) {
      console.error(
        'Could not load education:',
        error
      );
    } finally {
      this.loading.set(false);
    }
  }

  selectEducation(
    entry: EducationEntry
  ): void {
    this.selectedEducation.set(
      entry
    );
  }

  text(
    value: LocalizedText
  ): string {
    const language =
      this.languageService.currentLanguage();

    return value[language] ??
      value.en;
  }

  list(
    value: LocalizedList
  ): string[] {
    const language =
      this.languageService.currentLanguage();

    return value[language] ??
      value.en;
  }

  toggleEducationTasks(): void {
    this.educationTasksOpen.update(
      open => !open
    );
  }

  toggleOtherPlaces(): void {
    this.otherPlacesOpen.update(
      open => !open
    );
  }

  toggleDetails(): void {
    this.detailsOpen.update(
      open => !open
    );
  }

  navigateTo(
    section: PortfolioSection
  ): void {
    this.navigate.emit(section);
  }

  close(): void {
    this.closed.emit();
  }
}