import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-quiz-filters',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  templateUrl: './quiz-filters.html',
  styleUrls: ['./quiz-filters.scss']
})
export class QuizFiltersComponent {
  @Input() filters: any[] = [];
  @Input() activeFilter: string = '';
  @Output() filterChange = new EventEmitter<string>();

  onFilterSelect(filterValue: string): void {
    this.filterChange.emit(filterValue);
  }
}
