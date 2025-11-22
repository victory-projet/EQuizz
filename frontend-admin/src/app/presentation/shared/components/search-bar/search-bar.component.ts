// src/app/presentation/shared/components/search-bar/search-bar.component.ts
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../svg-icon/svg-icon';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconComponent],
  template: `
    <div class="search-bar">
      <div class="search-icon">
        <app-svg-icon name="Search" size="sm" />
      </div>
      <input
        type="text"
        class="search-input"
        [(ngModel)]="searchValue"
        (ngModelChange)="onSearchChange($event)"
        [placeholder]="placeholder"
        [disabled]="disabled"
      />
      @if (searchValue) {
        <button
          type="button"
          class="clear-button"
          (click)="clearSearch()"
          aria-label="Effacer la recherche"
        >
          <app-svg-icon name="X" size="sm" />
        </button>
      }
    </div>
  `,
  styles: [`
    @import '../../../../../styles.scss';

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 600px;
    }

    .search-icon {
      position: absolute;
      left: $spacing-3;
      display: flex;
      align-items: center;
      color: $text-tertiary;
      pointer-events: none;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: $spacing-3 $spacing-10 $spacing-3 $spacing-10;
      font-size: $text-sm;
      color: $text-primary;
      background: $bg-secondary;
      border: $border-width solid transparent;
      border-radius: $radius-full;
      transition: all $transition-fast;

      &::placeholder {
        color: $text-tertiary;
      }

      &:hover:not(:disabled) {
        background: $bg-tertiary;
      }

      &:focus {
        outline: none;
        background: $bg-primary;
        border-color: $primary-500;
        box-shadow: 0 0 0 3px rgba($primary-500, 0.1);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .clear-button {
      position: absolute;
      right: $spacing-2;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: $radius-full;
      cursor: pointer;
      color: $text-tertiary;
      transition: all $transition-fast;

      &:hover {
        background: $neutral-200;
        color: $text-primary;
      }

      &:active {
        transform: scale(0.95);
      }
    }
  `]
})
export class SearchBarComponent {
  @Input() placeholder = 'Rechercher...';
  @Input() disabled = false;
  @Output() search = new EventEmitter<string>();

  searchValue = '';

  onSearchChange(value: string): void {
    this.search.emit(value);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.search.emit('');
  }
}
