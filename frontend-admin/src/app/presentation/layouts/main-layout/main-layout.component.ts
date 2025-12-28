import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { MessagesService } from '../../shared/services/messages.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);

  searchQuery = signal('');
  isMobile = signal(false);

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

  constructor(
    public authService: AuthService,
    private router: Router,
    public messagesService: MessagesService
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
    this.closeUserMenu();
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userProfile = target.closest('.user-profile');
    
    if (!userProfile && this.isUserMenuOpen()) {
      this.closeUserMenu();
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(value => !value);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }
}
