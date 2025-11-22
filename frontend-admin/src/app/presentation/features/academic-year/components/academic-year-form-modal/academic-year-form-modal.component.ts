// src/app/features/academic-year/components/academic-year-form-modal/academic-year-form-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

export interface AcademicYearFormData {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

@Component({
  selector: 'app-academic-year-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './academic-year-form-modal.component.html',
  styleUrl: './academic-year-form-modal.component.scss'
})
export class AcademicYearFormModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() academicYear: AcademicYearFormData | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AcademicYearFormData>();

  form!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: [this.academicYear?.name || '', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
      startDate: [this.academicYear?.startDate || '', Validators.required],
      endDate: [this.academicYear?.endDate || '', Validators.required],
      isActive: [this.academicYear?.isActive ?? false]
    });
  }

  onClose(): void {
    this.form.reset();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formData: AcademicYearFormData = {
        ...this.form.value,
        id: this.academicYear?.id
      };

      this.save.emit(formData);
      
      setTimeout(() => {
        this.isSubmitting = false;
        this.form.reset();
      }, 500);
    } else {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  getTitle(): string {
    return this.mode === 'create' ? 'Nouvelle Année Académique' : 'Modifier l\'Année Académique';
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }
}
