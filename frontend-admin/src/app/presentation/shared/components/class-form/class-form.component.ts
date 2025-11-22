// src/app/shared/components/class-form/class-form.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../svg-icon/svg-icon';

export interface ClassData {
  id?: string;
  name: string;
  level: string;
  studentCount: number;
  academicYear: string;
}

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-form.component.html',
  styleUrl: './class-form.component.scss'
})
export class ClassFormComponent {
  @Input() classData: Partial<ClassData> = {
    name: '',
    level: '',
    studentCount: 0,
    academicYear: '2024-2025'
  };

  @Output() save = new EventEmitter<Partial<ClassData>>();
  @Output() cancel = new EventEmitter<void>();

  get isValid(): boolean {
    return !!this.classData.name && !!this.classData.level;
  }

  onSubmit(): void {
    if (this.isValid) {
      this.save.emit(this.classData);
    }
  }
}