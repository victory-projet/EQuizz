// src/app/features/class-management/class-management.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { ClassFormComponent } from '../../components/class-form/class-form.component';
import { ClassDetailsComponent } from '../../components/class-details/class-details.component';

import { trigger, transition, style, animate } from '@angular/animations';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';

interface Class {
  id: string;
  name: string;
  level: string;
  studentCount: number;
  academicYear: string;
  createdAt: Date;
}

@Component({
  selector: 'app-class-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    SvgIconComponent,
    ConfirmationModalComponent,
    ClassFormComponent,
    ClassDetailsComponent
  ],
  templateUrl: './class-management.component.html',
  styleUrl: './class-management.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ClassManagementComponent implements OnInit {
  classes = signal<Class[]>([]);
  filteredClasses = signal<Class[]>([]);
  searchTerm = signal('');

  // Stats
  totalClasses = signal(0);
  totalStudents = signal(0);
  currentYear = signal('2024-2025');
  fillRate = signal(0);

  // Modals
  showFormModal = signal(false);
  showDetailsModal = signal(false);
  showDeleteModal = signal(false);
  selectedClass = signal<Class | null>(null);

  // Form
  formData: Partial<Class> = {
    name: '',
    level: '',
    studentCount: 0,
    academicYear: '2024-2025'
  };

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    const mock: Class[] = [
      { id: '1', name: 'L1 Info A', level: 'Licence 1', studentCount: 45, academicYear: '2024-2025', createdAt: new Date('2024-09-01') },
      { id: '2', name: 'L1 Info B', level: 'Licence 1', studentCount: 42, academicYear: '2024-2025', createdAt: new Date('2024-09-01') },
      { id: '3', name: 'L2 Info', level: 'Licence 2', studentCount: 38, academicYear: '2024-2025', createdAt: new Date('2024-09-01') }
    ];
    this.classes.set(mock);
    this.filteredClasses.set(mock);
    this.updateStats();
  }

  updateStats(): void {
    const total = this.classes().length;
    const students = this.classes().reduce((sum, c) => sum + c.studentCount, 0);
    const avgFill = total > 0 ? Math.round(students / (total * 50) * 100) : 0;

    this.totalClasses.set(total);
    this.totalStudents.set(students);
    this.fillRate.set(avgFill);
  }

  onSearchChange(): void {
    const term = this.searchTerm().toLowerCase();
    const filtered = term
      ? this.classes().filter(c =>
          c.name.toLowerCase().includes(term) ||
          c.level.toLowerCase().includes(term) ||
          c.academicYear.includes(term)
        )
      : this.classes();
    this.filteredClasses.set(filtered);
  }

  addClass(): void {
    this.resetForm();
    this.showFormModal.set(true);
  }

  editClass(cls: Class): void {
    this.selectedClass.set(cls);
    this.formData = { ...cls };
    this.showFormModal.set(true);
  }

  viewDetails(cls: Class): void {
    this.selectedClass.set(cls);
    this.showDetailsModal.set(true);
  }

  deleteClass(cls: Class): void {
    this.selectedClass.set(cls);
    this.showDeleteModal.set(true);
  }

  saveClass(): void {
    if (this.selectedClass()) {
      // Edit
      this.classes.update(c =>
        c.map(item => item.id === this.selectedClass()!.id ? { ...item, ...this.formData } : item)
      );
    } else {
      // Add
      const newClass: Class = {
        id: Date.now().toString(),
        createdAt: new Date(),
        ...this.formData as Omit<Class, 'id' | 'createdAt'>
      };
      this.classes.update(c => [...c, newClass]);
    }
    this.filteredClasses.set(this.classes());
    this.updateStats();
    this.closeModal();
  }

  confirmDelete(): void {
    if (this.selectedClass()) {
      this.classes.update(c => c.filter(item => item.id !== this.selectedClass()!.id));
      this.filteredClasses.set(this.classes());
      this.updateStats();
      this.closeModal();
    }
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.showDetailsModal.set(false);
    this.showDeleteModal.set(false);
    this.selectedClass.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      name: '',
      level: '',
      studentCount: 0,
      academicYear: '2024-2025'
    };
  }
}