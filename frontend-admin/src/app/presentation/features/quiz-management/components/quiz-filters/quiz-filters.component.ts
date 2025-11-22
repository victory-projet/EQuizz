import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-container">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Rechercher un quiz..."
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchChange()"
        />
      </div>

      <div class="filter-group">
        <select [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>

        <button class="btn-secondary" (click)="resetFilters()">
          Réinitialiser
        </button>
      </div>
    </div>
  `,
  styles: [`
    .filters-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-box {
      flex: 1;
      min-width: 300px;
      position: relative;

      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.25rem;
      }

      input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 3rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: #4f46e5;
        }
      }
    }

    .filter-group {
      display: flex;
      gap: 1rem;

      select {
        padding: 0.75rem 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: #4f46e5;
        }
      }
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: white;
      color: #4f46e5;
      border: 1px solid #4f46e5;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #4f46e5;
        color: white;
      }
    }
  `]
})
export class QuizFiltersComponent {
  filterChange = output<any>();
  
  searchTerm = signal('');
  statusFilter = signal('');

  onSearchChange(): void {
    this.emitFilters();
  }

  onFilterChange(): void {
    this.emitFilters();
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filterChange.emit({
      search: this.searchTerm(),
      status: this.statusFilter()
    });
  }
}
