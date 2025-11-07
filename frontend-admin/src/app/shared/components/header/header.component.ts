// src/app/shared/components/header/header.component.ts
import { Component, ElementRef, HostListener, output, signal, inject } from '@angular/core'; // <-- Ajoute 'inject' ici
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  toggleSidebar = output<void>();

  currentUser = signal<User>({
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@equizz.com'
  });

  notificationCount = signal(3);
  showUserMenu = signal(false);

  // CORRECT : inject est maintenant importé
  private elementRef = inject(ElementRef);

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user.name) return '?';

    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }

  onProfile(): void {
    this.showUserMenu.set(false);
  }

  onSettings(): void {
    this.showUserMenu.set(false);
  }

  onLogout(): void {
    this.showUserMenu.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.showUserMenu.set(false);
    }
  }
}