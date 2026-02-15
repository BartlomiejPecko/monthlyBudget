import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Lang = 'en' | 'pl';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly STORAGE_KEY = 'budget_lang';

  lang = signal<Lang>(this.getStoredLang());

  private translations = signal<Record<Lang, Record<string, string>>>({
    en: {},
    pl: {},
  });

  /** Quick boolean for templates */
  isPolish = computed(() => this.lang() === 'pl');
  isEnglish = computed(() => this.lang() === 'en');

  ready = signal(false);

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  toggle(): void {
    this.setLang(this.lang() === 'en' ? 'pl' : 'en');
  }

  t(key: string, params?: Record<string, string | number>): string {
    const all = this.translations();
    let value = all[this.lang()]?.[key] ?? all[this.otherLang()]?.[key] ?? key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
      });
    }

    return value;
  }


  private otherLang(): Lang {
    return this.lang() === 'en' ? 'pl' : 'en';
  }

  private getStoredLang(): Lang {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'en' || stored === 'pl') return stored;
    const browserLang = navigator.language?.substring(0, 2);
    return browserLang === 'pl' ? 'pl' : 'en';
  }

  private loadAll(): void {
    let loaded = 0;
    const check = () => {
      loaded++;
      if (loaded >= 2) this.ready.set(true);
    };

    this.http.get<Record<string, string>>('assets/i18n/en.json').subscribe({
      next: (data) => {
        this.translations.update((prev) => ({ ...prev, en: data }));
        check();
      },
      error: () => check(),
    });

    this.http.get<Record<string, string>>('assets/i18n/pl.json').subscribe({
      next: (data) => {
        this.translations.update((prev) => ({ ...prev, pl: data }));
        check();
      },
      error: () => check(),
    });
  }
}