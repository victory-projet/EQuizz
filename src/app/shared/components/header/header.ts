import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <header class="main-header">
      <div class="header-title">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble du système d'évaluation des enseignements</p>
      </div>
      
      <div class="header-actions">
        <div class="search-bar">
          <span class="icon">🔍</span>
          <input type="text" placeholder="Rechercher...">
        </div>
        
        <span class="notification-icon">🔔</span>
        
        <div class="user-profile">
          <div class="user-info">
            <span class="username">Admin</span>
            <span class="role">Administrateur</span>
          </div>
          <div class="avatar">A</div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.scss']
})
export class HeaderComponent {}
