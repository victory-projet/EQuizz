import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'equizz-theme';

  public currentTheme = signal<'light' | 'dark'>('light');
  public isAutoTheme = signal<boolean>(false);
  private _selectedTheme: Theme = 'light';

  constructor() {
    this._selectedTheme = this.getStoredTheme();
    this.applyTheme(this._selectedTheme);
    this.setupSystemThemeListener();
  }

  private getStoredTheme(): Theme {
    try {
      const stored = localStorage.getItem(this.THEME_KEY) as Theme;
      return (stored === 'light' || stored === 'dark' || stored === 'auto') ? stored : 'light';
    } catch {
      return 'light';
    }
  }

  private setupSystemThemeListener(): void {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this._selectedTheme === 'auto') {
          this.applyTheme('auto');
        }
      });
    } catch { /* ignore */ }
  }

  private applyTheme(theme: Theme): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved: 'light' | 'dark' = theme === 'auto'
      ? (prefersDark ? 'dark' : 'light')
      : theme;

    this.isAutoTheme.set(theme === 'auto');
    this.currentTheme.set(resolved);

    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${resolved}-theme`);
  }

  setTheme(theme: Theme): void {
    this._selectedTheme = theme;
    try { localStorage.setItem(this.THEME_KEY, theme); } catch { /* ignore */ }
    this.applyTheme(theme);
  }

  getSelectedTheme(): Theme {
    return this._selectedTheme;
  }

  toggleTheme(): void {
    const next: Theme = this._selectedTheme === 'light' ? 'dark'
      : this._selectedTheme === 'dark' ? 'auto' : 'light';
    this.setTheme(next);
  }

  getThemeIcon(): string {
    return this._selectedTheme === 'light' ? 'light_mode'
      : this._selectedTheme === 'dark' ? 'dark_mode' : 'brightness_auto';
  }

  getThemeLabel(): string {
    return this._selectedTheme === 'light' ? 'Thème clair'
      : this._selectedTheme === 'dark' ? 'Thème sombre' : 'Thème automatique';
  }
}
