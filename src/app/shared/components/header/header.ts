import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatBadgeModule],
  template: `
    <header class="main-header">
      <div class="header-content">
        <div class="search-container">
          <mat-icon class="search-icon">search</mat-icon>
          <input type="text" placeholder="Rechercher un quiz, une UE, une classe..." class="search-input">
        </div>
        
        <div class="header-actions">
          <button mat-icon-button class="notification-btn">
            <mat-icon [matBadge]="3" matBadgeColor="warn" matBadgeSize="small">notifications</mat-icon>
          </button>
          
          <div class="user-profile">
            <div class="user-info">
              <span class="username">Administrateur</span>
              <span class="role">Enseignant</span>
            </div>
            <div class="avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.scss']
})
export class HeaderComponent {}
