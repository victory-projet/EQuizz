import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ExportFormat = 'excel' | 'pdf' | 'json';

export interface ExportConfig {
  formats: ExportFormat[];
  defaultFormat?: ExportFormat;
  showFormatSelector?: boolean;
  buttonText?: string;
  buttonColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="export-button-container">
      <!-- Bouton simple (un seul format) -->
      @if (!config.showFormatSelector && config.formats.length === 1) {
        <button 
          mat-raised-button 
          [color]="config.buttonColor || 'primary'"
          (click)="onExport(config.formats[0])"
          [disabled]="loading">
          
          @if (loading) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>{{ getFormatIcon(config.formats[0]) }}</mat-icon>
          }
          
          {{ config.buttonText || getFormatLabel(config.formats[0]) }}
        </button>
      }

      <!-- Bouton avec menu (plusieurs formats) -->
      @if (config.showFormatSelector || config.formats.length > 1) {
        <button 
          mat-raised-button 
          [color]="config.buttonColor || 'primary'"
          [matMenuTriggerFor]="exportMenu"
          [disabled]="loading">
          
          @if (loading) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>download</mat-icon>
          }
          
          {{ config.buttonText || 'Exporter' }}
          <mat-icon>arrow_drop_down</mat-icon>
        </button>

        <mat-menu #exportMenu="matMenu">
          @for (format of config.formats; track format) {
            <button mat-menu-item (click)="onExport(format)">
              <mat-icon>{{ getFormatIcon(format) }}</mat-icon>
              <span>{{ getFormatLabel(format) }}</span>
            </button>
          }
        </mat-menu>
      }
    </div>
  `,
  styles: [`
    .export-button-container {
      display: inline-block;
    }

    button mat-spinner {
      margin-right: 8px;
    }

    button mat-icon {
      margin-right: 4px;
    }

    mat-menu button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class ExportButtonComponent {
  @Input() config: ExportConfig = {
    formats: ['excel'],
    showFormatSelector: false
  };
  
  @Input() loading = false;
  
  @Output() export = new EventEmitter<ExportFormat>();

  onExport(format: ExportFormat): void {
    this.export.emit(format);
  }

  getFormatIcon(format: ExportFormat): string {
    switch (format) {
      case 'excel': return 'table_chart';
      case 'pdf': return 'picture_as_pdf';
      case 'json': return 'code';
      default: return 'download';
    }
  }

  getFormatLabel(format: ExportFormat): string {
    switch (format) {
      case 'excel': return 'Exporter Excel';
      case 'pdf': return 'Exporter PDF';
      case 'json': return 'Exporter JSON';
      default: return 'Exporter';
    }
  }
}