import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input 
        type="text" 
        placeholder="Rechercher..."
        [(ngModel)]="searchTerm"
        (ngModelChange)="onSearchChange()"
        (focus)="onFocus()"
        (blur)="onBlur()"
      />
      @if (searchTerm()) {
        <button class="clear-btn" (click)="clearSearch()">✕</button>
      }
    </div>
  `,
  styles: [`
    .search-bar {
      position: relative;
      width: 100%;

      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.25rem;
        color: #666;
      }

      input {
        width: 100%;
        padding: 0.75rem 3rem 0.75rem 3rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.2s;

        &:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        &::placeholder {
          color: #9ca3af;
        }
      }

      .clear-btn {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        font-size: 1.25rem;
        padding: 0.25rem;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          background: #f3f4f6;
          color: #1a1a1a;
        }
      }
    }
  `]
})
export class SearchBarComponent {
  searchChange = output<string>();
  
  searchTerm = signal('');

  onSearchChange(): void {
    this.searchChange.emit(this.searchTerm());
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.searchChange.emit('');
  }

  onFocus(): void {
    // Handle focus
  }

  onBlur(): void {
    // Handle blur
  }
}
