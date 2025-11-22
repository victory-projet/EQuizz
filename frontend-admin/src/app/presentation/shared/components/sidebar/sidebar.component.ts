// src/app/presentation/shared/components/sidebar/sidebar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon';

import { icons } from 'lucide-angular';

interface MenuItem {
  label: string;
  icon: keyof typeof icons;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SvgIconComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { label: 'Tableau de bord', icon: 'LayoutDashboard', route: '/dashboard' },
    { label: 'Gestion des Quiz', icon: 'FileText', route: '/quiz-management' },
    { label: 'Cours & UE', icon: 'BookOpen', route: '/courses' },
    { label: 'Classes', icon: 'Users', route: '/classes' },
    { label: 'Utilisateurs', icon: 'UserCog', route: '/users' },
    { label: 'Années académiques', icon: 'Calendar', route: '/academic-year' },
    { label: 'Analytiques', icon: 'Activity', route: '/analytics' },
    { label: 'Notifications', icon: 'Bell', route: '/notifications' },
    { label: 'Paramètres', icon: 'Settings', route: '/settings' },
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  onNavigate(): void {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      this.closeSidebar();
    }
  }

  closeSidebar(): void {
    this.close.emit();
  }
}
