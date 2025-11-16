import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard' },
    { label: 'Gestion des Quiz', icon: 'assignment', route: '/quiz-management' },
    { label: 'Cours & UE', icon: 'book', route: '/courses' },
    { label: 'Classes', icon: 'groups', route: '/classes' },
    { label: 'Année académique', icon: 'calendar_today', route: '/academic-year' },
    { label: 'Rapport', icon: 'bar_chart', route: '/analytics' },
    { label: 'Paramètres', icon: 'settings', route: '/settings' }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    console.log('Logout');
    // Implémenter la logique de déconnexion
  }
}
