import { Component, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { MessagesService } from '../../shared/services/messages.service';
import { GlobalSearchService, SearchConfig } from '../../shared/services/global-search.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);
  showSearchSuggestions = signal(false);

  searchQuery = signal('');
  searchPlaceholder = signal('Rechercher...');
  searchSuggestions = signal<string[]>([]);
  isMobile = signal(false);
  currentSearchConfig = signal<SearchConfig | null>(null);

  private pageTitles: { [key: string]: string } = {
    '/dashboard': 'Tableau de bord',
    '/evaluations': 'Évaluations',
    '/courses': 'Cours & UE',
    '/classes': 'Classes',
    '/associations': 'Associations',
    '/academic-years': 'Année académique',
    '/reports': 'Rapports',
    '/users': 'Utilisateurs',
    '/students': 'Étudiants',
    '/teachers': 'Enseignants',
    '/notifications': 'Notifications',
    '/profile': 'Mon Profil',
    '/messages': 'Messages'
  };

  private pageSubtitles: { [key: string]: string } = {
    '/dashboard': 'Vue d\'ensemble du système d\'évaluation des enseignements',
    '/evaluations': 'Gestion des évaluations et questionnaires',
    '/courses': 'Gestion des cours et unités d\'enseignement',
    '/classes': 'Gestion des classes et groupes d\'étudiants',
    '/associations': 'Gestion des associations cours-classes',
    '/academic-years': 'Gestion des années académiques et semestres',
    '/reports': 'Rapports et statistiques d\'évaluation',
    '/users': 'Gestion des comptes administrateurs',
    '/students': 'Gestion des comptes étudiants',
    '/teachers': 'Gestion des comptes enseignants',
    '/notifications': 'Centre de notifications système',
    '/profile': 'Espace compte administrateur',
    '/messages': 'Centre de messages et notifications'
  };

  constructor(
    public authService: AuthService,
    private router: Router,
    public messagesService: MessagesService,
    private globalSearchService: GlobalSearchService
  ) {
    this.checkScreenSize();
    
    // Fermer le menu mobile lors de la navigation
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.closeMobileMenu();
        this.updateSearchConfig(event.url);
      });
  }

  ngOnInit(): void {
    // Initialiser la configuration de recherche pour la route actuelle
    this.updateSearchConfig(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const isMobileView = window.innerWidth < 768;
    this.isMobile.set(isMobileView);
    
    // Fermer le menu mobile si on passe en desktop
    if (!isMobileView) {
      this.isMobileMenuOpen.set(false);
    }
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.toggleMobileMenu();
    } else {
      this.isSidebarCollapsed.update(value => !value);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onOverlayClick(): void {
    this.closeMobileMenu();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    this.searchQuery.set(query);
    
    // Afficher les suggestions si il y a du texte
    this.showSearchSuggestions.set(query.length > 0);
    
    // Exécuter la recherche via la configuration actuelle
    const config = this.currentSearchConfig();
    if (config && query.trim()) {
      config.onSearch(query);
    }
  }

  onSearchFocus(): void {
    if (this.searchQuery()) {
      this.showSearchSuggestions.set(true);
    }
  }

  onSearchBlur(): void {
    // Délai pour permettre le clic sur les suggestions
    setTimeout(() => {
      this.showSearchSuggestions.set(false);
    }, 200);
  }

  onSuggestionClick(suggestion: string): void {
    this.searchQuery.set(suggestion);
    this.showSearchSuggestions.set(false);
    
    const config = this.currentSearchConfig();
    if (config) {
      config.onSearch(suggestion);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.showSearchSuggestions.set(false);
    
    const config = this.currentSearchConfig();
    if (config?.onClear) {
      config.onClear();
    }
  }

  private updateSearchConfig(url: string): void {
    const route = url.split('?')[0];
    const config = this.globalSearchService.getConfigForRoute(route);
    
    this.currentSearchConfig.set(config);
    this.searchPlaceholder.set(config.placeholder);
    this.searchSuggestions.set(config.suggestions);
    
    // Réinitialiser la recherche lors du changement de page
    this.searchQuery.set('');
    this.showSearchSuggestions.set(false);
  }

  getPageTitle(): string {
    const url = this.router.url.split('?')[0];
    return this.pageTitles[url] || 'EQuizz Admin';
  }

  getPageSubtitle(): string {
    const url = this.router.url.split('?')[0];
    return this.pageSubtitles[url] || 'Vue d\'ensemble du système d\'évaluation des enseignements';
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userProfile = target.closest('.user-profile');
    const searchContainer = target.closest('.search-container');
    
    if (!userProfile && this.isUserMenuOpen()) {
      this.closeUserMenu();
    }
    
    if (!searchContainer && this.showSearchSuggestions()) {
      this.showSearchSuggestions.set(false);
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(value => !value);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }
}
