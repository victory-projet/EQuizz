// src/app/presentation/features/class-management/class-management.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';
import { ToastService } from '../../../core/services/toast.service';

// Clean Architecture - Use Cases
import { GetAllClassesUseCase } from '../../../core/application/use-cases/class/get-all-classes.use-case';
import { CreateClassUseCase, CreateClassDto } from '../../../core/application/use-cases/class/create-class.use-case';
import { UpdateClassUseCase, UpdateClassDto } from '../../../core/application/use-cases/class/update-class.use-case';
import { DeleteClassUseCase } from '../../../core/application/use-cases/class/delete-class.use-case';
import { Class } from '../../../core/domain/entities/class.entity';

// Interface pour les données de classe (UI)
export interface ClassData {
  id: string;
  name: string;
  level: string;
  studentCount: number;
  academicYear: string;
}

// Mapper pour convertir Class entity vers ClassData (UI)
function mapClassToData(cls: Class): ClassData {
  return {
    id: cls.id,
    name: cls.name,
    level: cls.level,
    studentCount: cls.getStudentCount(),
    academicYear: cls.academicYearId
  };
}

@Component({
  selector: 'app-class-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    SvgIconComponent
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
  // Clean Architecture - Inject Use Cases
  private getAllClassesUseCase = inject(GetAllClassesUseCase);
  private createClassUseCase = inject(CreateClassUseCase);
  private updateClassUseCase = inject(UpdateClassUseCase);
  private deleteClassUseCase = inject(DeleteClassUseCase);
  private toastService = inject(ToastService);

  classes = signal<ClassData[]>([]);
  filteredClasses = signal<ClassData[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);

  // Stats
  totalClasses = signal(0);
  totalStudents = signal(0);
  currentYear = signal('2024-2025');
  fillRate = signal(0);

  // Modals
  showFormModal = signal(false);
  showDetailsModal = signal(false);
  showDeleteModal = signal(false);
  selectedClass = signal<ClassData | null>(null);

  // Form
  formData: Partial<CreateClassDto> = {
    name: '',
    level: '',
    academicYearId: 'year-1'
  };

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.isLoading.set(true);
    this.getAllClassesUseCase.execute().subscribe({
      next: (classes) => {
        const classData = classes.map(mapClassToData);
        this.classes.set(classData);
        this.filteredClasses.set(classData);
        this.updateStats();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Erreur lors du chargement des classes');
        console.error('Error loading classes:', error);
        this.isLoading.set(false);
      }
    });
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
          c.level.toLowerCase().includes(term)
        )
      : this.classes();
    this.filteredClasses.set(filtered);
  }

  addClass(): void {
    this.resetForm();
    this.selectedClass.set(null);
    this.showFormModal.set(true);
  }

  editClass(cls: ClassData): void {
    this.selectedClass.set(cls);
    this.formData = {
      name: cls.name,
      level: cls.level,
      academicYearId: cls.academicYear
    };
    this.showFormModal.set(true);
  }

  viewDetails(cls: ClassData): void {
    this.selectedClass.set(cls);
    this.showDetailsModal.set(true);
  }

  deleteClass(cls: ClassData): void {
    this.selectedClass.set(cls);
    this.showDeleteModal.set(true);
  }

  saveClass(): void {
    const selected = this.selectedClass();
    
    if (selected && selected.id) {
      // Update existing class
      const dto: UpdateClassDto = {
        id: selected.id,
        name: this.formData.name!,
        level: this.formData.level!
      };

      this.updateClassUseCase.execute(dto).subscribe({
        next: () => {
          this.toastService.success('Classe modifiée avec succès');
          this.closeModal();
          this.loadClasses();
          // Rester sur la page des classes (pas de navigation)
        },
        error: (error) => {
          this.toastService.error(error.message || 'Erreur lors de la modification');
        }
      });
    } else {
      // Create new class
      const dto: CreateClassDto = {
        name: this.formData.name!,
        level: this.formData.level!,
        academicYearId: this.formData.academicYearId!
      };

      this.createClassUseCase.execute(dto).subscribe({
        next: () => {
          this.toastService.success('Classe créée avec succès');
          this.closeModal();
          this.loadClasses();
          // Rester sur la page des classes (pas de navigation)
        },
        error: (error) => {
          this.toastService.error(error.message || 'Erreur lors de la création');
        }
      });
    }
  }

  confirmDelete(): void {
    const selected = this.selectedClass();
    if (selected && selected.id) {
      this.deleteClassUseCase.execute(selected.id).subscribe({
        next: () => {
          this.toastService.success('Classe supprimée avec succès');
          this.closeModal();
          this.loadClasses();
          // Rester sur la page des classes (pas de navigation)
        },
        error: (error) => {
          this.toastService.error(error.message || 'Erreur lors de la suppression');
        }
      });
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
      academicYearId: 'year-1'
    };
  }
}
