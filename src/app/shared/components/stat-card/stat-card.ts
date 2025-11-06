// src/app/shared/components/stat-card/stat-card.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './stat-card.html',
  styleUrls: ['./stat-card.scss']
})
export class StatCard {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() trend: string = '';
  @Input() trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
  @Input() icon: string = 'analytics';
  @Input() color: 'primary' | 'success' | 'warning' | 'info' = 'primary';

  get trendIcon(): string {
    return this.trendDirection === 'up' ? 'arrow_upward' :
           this.trendDirection === 'down' ? 'arrow_downward' : 'minimize';
  }

  get trendColor(): string {
    return this.trendDirection === 'up' ? '#4caf50' :
           this.trendDirection === 'down' ? '#f44336' : '#9e9e9e';
  }
}
