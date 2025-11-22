// src/app/features/academic-year/components/semester-form-modal/semester-form-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

export interface SemesterFormData {
  id?: string;
  name: string;
  type: 'semester' | 'trimester';
  startDate: string;
  endDate: string;
  academicYearId: string;
}

@Component({
  selector: 'app-semester-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './semester-form-modal.component.html',
  styleUrl: './semester-form-modal.component.scss'
})
export class SemesterFormModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() academicYearId = '';
  @Input() academicYearName = '';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<SemesterFormData>();

  form!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['semester', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  onClose(): void {
    this.form.reset();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formData: SemesterFormData = {
        ...this.form.value,
        academicYearId: this.academicYearId
      };

      this.save.emit(formData);
      
      setTimeout(() => {
        this.isSubmitting = false;
        this.form.reset({ type: 'semester' });
      }, 500);
    } else {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }
}
