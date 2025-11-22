// src/app/presentation/shared/components/header/header.component.ts
import { Component, ElementRef, HostListener, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { SvgIconComponent } from '../svg-icon/svg-icon';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, SvgIconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private elementRef = inject(ElementRef);

  toggleSidebar = output<void>();

  // Utiliser le signal du service d'authentification
  currentUser = this.authService.currentUser;
  
  notificationCount = computed(() => 3); // À remplacer par un vrai service de notifications
  showUserMenu = computed(() => false);
  private _showUserMenu = false;

  toggleUserMenu(): void {
    this._showUserMenu = !this._showUserMenu;
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';

    const fullName = user.getFullName();
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  getUserName(): string {
    const user = this.currentUser();
    return user ? user.getFullName() : 'Utilisateur';
  }

  getUserEmail(): string {
    const user = this.currentUser();
    return user ? user.email : '';
  }

  getUserRole(): string {
    const user = this.currentUser();
    if (!user) return '';
    
    const roleLabels: { [key: string]: string } = {
      'admin': 'Administrateur',
      'teacher': 'Enseignant',
      'student': 'Étudiant'
    };
    
    return roleLabels[user.role] || user.role;
  }

  isUserMenuOpen(): boolean {
    return this._showUserMenu;
  }

  onProfile(): void {
    this._showUserMenu = false;
    // Navigation vers le profil
  }

  onSettings(): void {
    this._showUserMenu = false;
    // Navigation vers les paramètres
  }

  onLogout(): void {
    this._showUserMenu = false;
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this._showUserMenu = false;
    }
  }
}