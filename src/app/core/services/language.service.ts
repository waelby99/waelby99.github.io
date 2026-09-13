import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'fr' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private readonly translateService = inject(TranslateService);

  private readonly storageKey = 'wael-xp-language';

  readonly currentLanguage = signal<Language>(
    this.getSavedLanguage()
  );

  readonly isRtl = computed(
    () => this.currentLanguage() === 'ar'
  );

  constructor() {
    this.setLanguage(this.currentLanguage());
  }

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);

    this.translateService.use(language);

    localStorage.setItem(this.storageKey, language);

    document.documentElement.lang = language;
    document.documentElement.dir =
      language === 'ar' ? 'rtl' : 'ltr';
  }

  private getSavedLanguage(): Language {
    const savedLanguage =
      localStorage.getItem(this.storageKey) as Language | null;

    if (
      savedLanguage === 'en' ||
      savedLanguage === 'fr' ||
      savedLanguage === 'ar'
    ) {
      return savedLanguage;
    }

    return 'en';
  }
}