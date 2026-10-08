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


interface SocialLink {
  id: string;
  name: string;
  icon: string;
  url: string;
  description: LocalizedText;
  note?: LocalizedText;
}


interface Skill {
  name: string;
  icon: string;
}


interface SkillGroup {
  title: LocalizedText;
  items: Skill[];
}


interface AboutMeData {
  name: string;
  title: LocalizedText;
  location: LocalizedText;
  currentWork: LocalizedText;
  about: LocalizedList;
  interests: LocalizedList;
  languages: LocalizedList;
  skills: SkillGroup[];
  socials: SocialLink[];
}


@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [
    TranslatePipe,
    XpExplorer,
    XpOtherPlaces
  ],
  templateUrl: './about-me.html',
  styleUrl: './about-me.scss'
})
export class AboutMe implements OnInit {
  readonly languageService =
    inject(LanguageService);

  @Output() closed =
    new EventEmitter<void>();

  @Output() navigate =
    new EventEmitter<PortfolioSection>();


  readonly profile =
    signal<AboutMeData | null>(null);

  readonly loading =
    signal(true);

  readonly loadError =
    signal(false);

  readonly aboutTasksOpen =
    signal(true);

  readonly otherPlacesOpen =
    signal(true);

  readonly detailsOpen =
    signal(true);


  ngOnInit(): void {
    this.loadProfile();
  }


  private async loadProfile(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);

    try {
      const response =
        await fetch('/data/about-me.json');

      if (!response.ok) {
        throw new Error(
          `Could not load About Me data: ${response.status}`
        );
      }

      const data =
        await response.json() as AboutMeData;

      this.profile.set(data);
    } catch (error) {
      console.error(
        'Failed to load About Me data:',
        error
      );

      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }


  text(
    value: LocalizedText
  ): string {
    const language =
      this.languageService.currentLanguage();

    return value[language] ?? value.en;
  }


  list(
    value: LocalizedList
  ): string[] {
    const language =
      this.languageService.currentLanguage();

    return value[language] ?? value.en;
  }


  toggleAboutTasks(): void {
    this.aboutTasksOpen.update(
      value => !value
    );
  }


  toggleOtherPlaces(): void {
    this.otherPlacesOpen.update(
      value => !value
    );
  }


  toggleDetails(): void {
    this.detailsOpen.update(
      value => !value
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