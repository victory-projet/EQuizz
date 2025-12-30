import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'equizz-theme';
  
  // Signal pour le thème sélectionné par l'utilisateur
  private selectedTheme = signal<Theme>(this.getStoredTheme());
  
  // Signal pour le thème effectivement appliqué (résolu si 'auto')
  public currentTheme = signal<'light' | 'dark'>('light');
  
  // Signal pour savoir si on suit le thème système
  public isAutoTheme = signal<boolean>(false);

  constructor() {
    // Écouter les changements de thème système
    this.setupSystemThemeListener();
    
    // Effect pour appliquer le thème quand il change
    effect(() => {
      this.applyTheme();
    });
    
    // Initialiser le thème
    this.updateCurrentTheme();
  }

  /**
   * Obtient le thème stocké ou 'auto' par défaut
   */
  private getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'auto';
    
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    return stored || 'auto';
  }

  /**
   * Configure l'écoute des changements de thème système
   */
  private setupSystemThemeListener(): void {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', () => {
      if (this.selectedTheme() === 'auto') {
        this.updateCurrentTheme();
      }
    });
  }

  /**
   * Met à jour le thème actuel basé sur la sélection
   */
  private updateCurrentTheme(): void {
    const selected = this.selectedTheme();
    
    if (selected === 'auto') {
      this.isAutoTheme.set(true);
      const prefersDark = typeof window !== 'undefined' 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
      this.currentTheme.set(prefersDark ? 'dark' : 'light');
    } else {
      this.isAutoTheme.set(false);
      this.currentTheme.set(selected);
    }
  }

  /**
   * Applique le thème au DOM
   */
  private applyTheme(): void {
    if (typeof document === 'undefined') return;
    
    const theme = this.currentTheme();
    const body = document.body;
    
    // Supprimer les classes de thème existantes
    body.classList.remove('light-theme', 'dark-theme');
    
    // Ajouter la nouvelle classe de thème
    body.classList.add(`${theme}-theme`);
    
    // Mettre à jour la meta theme-color pour les navigateurs mobiles
    this.updateThemeColor(theme);
  }

  /**
   * Met à jour la couleur de thème pour les navigateurs mobiles
   */
  private updateThemeColor(theme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return;
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  }

  /**
   * Définit le thème sélectionné
   */
  setTheme(theme: Theme): void {
    this.selectedTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.updateCurrentTheme();
  }

  /**
   * Obtient le thème sélectionné
   */
  getSelectedTheme(): Theme {
    return this.selectedTheme();
  }

  /**
   * Bascule entre les thèmes (light -> dark -> auto -> light)
   */
  toggleTheme(): void {
    const current = this.selectedTheme();
    let next: Theme;
    
    switch (current) {
      case 'light':
        next = 'dark';
        break;
      case 'dark':
        next = 'auto';
        break;
      case 'auto':
        next = 'light';
        break;
      default:
        next = 'light';
    }
    
    this.setTheme(next);
  }

  /**
   * Obtient l'icône appropriée pour le thème actuel
   */
  getThemeIcon(): string {
    const selected = this.selectedTheme();
    
    switch (selected) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      case 'auto':
        return 'brightness_auto';
      default:
        return 'brightness_auto';
    }
  }

  /**
   * Obtient le label du thème actuel
   */
  getThemeLabel(): string {
    const selected = this.selectedTheme();
    
    switch (selected) {
      case 'light':
        return 'Thème clair';
      case 'dark':
        return 'Thème sombre';
      case 'auto':
        return 'Thème automatique';
      default:
        return 'Thème automatique';
    }
  }
}