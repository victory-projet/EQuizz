// src/app/presentation/shared/components/class-details/class-details.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassData } from '../class-form/class-form.component';
import { SvgIconComponent } from '../svg-icon/svg-icon';

@Component({
  selector: 'app-class-details',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './class-details.component.html',
  styleUrl: './class-details.component.scss'
})
export class ClassDetailsComponent {
  @Input() cls!: ClassData;
  @Output() edit = new EventEmitter<ClassData>();
  @Output() close = new EventEmitter<void>();
}