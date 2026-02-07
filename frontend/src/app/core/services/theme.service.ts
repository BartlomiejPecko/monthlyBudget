import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'budget_theme';

  private _isDark = signal(this.loadTheme());
  isDark = this._isDark.asReadonly();

  toggle(): void {
    const next = !this._isDark();
    this._isDark.set(next);
    localStorage.setItem(this.THEME_KEY, next ? 'dark' : 'light');
    this.applyTheme(next);
  }

  init(): void {
    this.applyTheme(this._isDark());
  }

  private loadTheme(): boolean {
    const saved = localStorage.getItem(this.THEME_KEY);
    return saved ? saved === 'dark' : true; // default dark
  }

  private applyTheme(dark: boolean): void {
    document.body.classList.toggle('light-theme', !dark);
  }
}