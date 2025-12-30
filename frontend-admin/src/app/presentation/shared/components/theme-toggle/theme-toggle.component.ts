import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeService, Theme } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule
  ],
  template: `
    <button 
      mat-icon-button 
      [matTooltip]="tooltipText()"
      [matMenuTriggerFor]="themeMenu"
      class="theme-toggle-button"
      aria-label="Changer le thème">
      <mat-icon>{{ currentIcon() }}</mat-icon>
    </button>

    <mat-menu #themeMenu="matMenu" class="theme-menu">
      <button 
        mat-menu-item 
        (click)="setTheme('light')"
        [class.active]="selectedTheme() === 'light'">
        <mat-icon>light_mode</mat-icon>
        <span>Thème clair</span>
        @if (selectedTheme() === 'light') {
          <mat-icon class="check-icon">check</mat-icon>
        }
      </button>
      
      <button 
        mat-menu-item 
        (click)="setTheme('dark')"
        [class.active]="selectedTheme() === 'dark'">
        <mat-icon>dark_mode</mat-icon>
        <span>Thème sombre</span>
        @if (selectedTheme() === 'dark') {
          <mat-icon class="check-icon">check</mat-icon>
        }
      </button>
      
      <button 
        mat-menu-item 
        (click)="setTheme('auto')"
        [class.active]="selectedTheme() === 'auto'">
        <mat-icon>brightness_auto</mat-icon>
        <span>Automatique</span>
        @if (selectedTheme() === 'auto') {
          <mat-icon class="check-icon">check</mat-icon>
        }
      </button>
    </mat-menu>
  `,
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent {
  selectedTheme = computed(() => this.themeService.getSelectedTheme());
  currentIcon = computed(() => this.themeService.getThemeIcon());
  tooltipText = computed(() => this.themeService.getThemeLabel());

  constructor(private themeService: ThemeService) {}

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}