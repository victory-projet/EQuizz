import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  searchQuery = signal('');
  isMobile = signal(false);

  private pageTitles: { [key: string]: string } = {
    '/dashboard': 'Tableau de bord',
    '/evaluations': 'Évaluations',
    '/courses': 'Cours & UE',
    '/classes': 'Classes',
    '/associations': 'Associations',
    '/academic-years': 'Année académique',
    '/rapports': 'Rapports',
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
    '/rapports': 'Rapports et statistiques d\'évaluation',
    '/users': 'Gestion des comptes administrateurs',
    '/students': 'Gestion des comptes étudiants',
    '/teachers': 'Gestion des comptes enseignants',
    '/notifications': 'Centre de notifications système',
    '/profile': 'Espace compte administrateur',
    '/messages': 'Centre de messages et notifications'
  };

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.checkScreenSize();
    
    // Fermer le menu mobile lors de la navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });
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
    this.searchQuery.set(input.value);
  }

  getPageTitle(): string {
    const url = this.router.url.split('?')[0];
    return this.pageTitles[url] || 'EQuizz Admin';
  }

  logout(): void {
    this.authService.logout();
  }
}
