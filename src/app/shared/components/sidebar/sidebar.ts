import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatListModule],
  template: `
    <aside class="sidebar">
      <div class="logo-section">
        <div class="logo">EQ</div>
        <span class="app-name">EQizz</span>
      </div>

      <nav class="navigation">
        <ul>
          <li *ngFor="let item of navItems" 
              [class.active]="isActive(item.route)"
              (click)="navigate(item.route)">
            <span class="icon">{{ item.icon }}</span>
            <a [routerLink]="item.route">{{ item.label }}</a>
          </li>
        </ul>
      </nav>

      <div class="logout-section" (click)="logout()">
        <span class="icon">🚪</span>
        <a>Déconnexion</a>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      background: #2c3e50;
      height: 100vh;
      position: sticky;
      top: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    }

    .logo-section {
      display: flex;
      align-items: center;
      padding: 20px;
      background: #1a252f;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      width: 40px;
      height: 40px;
      background-color: #3498db;
      border-radius: 4px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #fff;
      font-size: 1.2em;
    }

    .app-name {
      font-size: 1.4em;
      font-weight: 700;
      color: #fff;
    }

    .navigation {
      flex-grow: 1;
      margin-top: 20px;
      padding: 0 15px;
    }

    .navigation ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .navigation li {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      margin: 2px 0;
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 4px;
      color: #b8c7ce;
    }

    .navigation li:hover {
      background-color: #1a252f;
      color: #fff;
    }

    .navigation li.active {
      background-color: #3498db;
      color: #fff;
      font-weight: 500;
    }

    .navigation li.active a {
      color: #fff;
    }

    .navigation a {
      text-decoration: none;
      color: inherit;
      margin-left: 10px;
      flex: 1;
      font-size: 0.95em;
    }

    .icon {
      font-size: 1.1em;
      width: 20px;
      text-align: center;
    }

    .logout-section {
      padding: 15px 20px;
      margin: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #e74c3c;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .logout-section:hover {
      background-color: rgba(231, 76, 60, 0.1);
    }

    .logout-section a {
      color: inherit;
      text-decoration: none;
      margin-left: 10px;
    }
  `]
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: '🏠', route: '/dashboard' },
    { label: 'Evaluation', icon: '📋', route: '/evaluation' },
    { label: 'Cours & UE', icon: '📚', route: '/courses' },
    { label: 'Classes', icon: '🧑‍🎓', route: '/classes' },
    { label: 'Année académique', icon: '📅', route: '/academic-year' },
    { label: 'Rapport', icon: '📊', route: '/reports' },
    { label: 'Paramètres', icon: '⚙️', route: '/settings' }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    console.log('Déconnexion');
    // Implémentez la logique de déconnexion ici
    this.router.navigate(['/login']);
  }
}
