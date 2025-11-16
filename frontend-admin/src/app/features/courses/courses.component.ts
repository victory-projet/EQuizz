import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../core/services/toast.service';

// Clean Architecture - Use Cases
import { GetAllCoursesUseCase } from '../../core/domain/use-cases/course/get-all-courses.use-case';
import { CreateCourseUseCase, CreateCourseDto } from '../../core/domain/use-cases/course/create-course.use-case';
import { UpdateCourseUseCase, UpdateCourseDto } from '../../core/domain/use-cases/course/update-course.use-case';
import { DeleteCourseUseCase } from '../../core/domain/use-cases/course/delete-course.use-case';
import { Course } from '../../core/domain/entities/course.entity';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {
  // Clean Architecture - Inject Use Cases
  private getAllCoursesUseCase = inject(GetAllCoursesUseCase);
  private createCourseUseCase = inject(CreateCourseUseCase);
  private updateCourseUseCase = inject(UpdateCourseUseCase);
  private deleteCourseUseCase = inject(DeleteCourseUseCase);
  private toastService = inject(ToastService);
  private router = inject(Router);

  courses = signal<Course[]>([]);
  filteredCourses = signal<Course[]>([]);
  searchTerm = '';
  
  totalCourses = signal(0);
  activeCourses = signal(0);
  totalStudents = signal(0);

  showAddModal = false;
  showEditModal = false;
  showViewModal = false;
  showDeleteModal = false;
  selectedCourse = signal<Course | null>(null);

  formData: Partial<CreateCourseDto> = {};

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.getAllCoursesUseCase.execute().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.filteredCourses.set(courses);
        this.updateStats();
      },
      error: (error) => {
        this.toastService.error('Erreur lors du chargement des cours');
        console.error('Error loading courses:', error);
      }
    });
  }

  updateStats(): void {
    const courses = this.courses();
    this.totalCourses.set(courses.length);
    this.activeCourses.set(courses.length); // All courses are active in mock
    this.totalStudents.set(courses.length * 40); // Mock calculation
  }

  onSearchChange(): void {
    const search = this.searchTerm.toLowerCase();
    if (search) {
      const filtered = this.courses().filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.code.toLowerCase().includes(search)
      );
      this.filteredCourses.set(filtered);
    } else {
      this.filteredCourses.set(this.courses());
    }
  }

  addCourse(): void {
    this.formData = {
      code: '',
      name: '',
      description: '',
      teacherId: 'teacher-1',
      academicYearId: 'year-1',
      semesterId: 'semester-1'
    };
    this.selectedCourse.set(null);
    this.showAddModal = true;
  }

  saveNewCourse(): void {
    const dto: CreateCourseDto = {
      code: this.formData.code!,
      name: this.formData.name!,
      description: this.formData.description || '',
      teacherId: this.formData.teacherId!,
      academicYearId: this.formData.academicYearId!,
      semesterId: this.formData.semesterId!
    };

    this.createCourseUseCase.execute(dto).subscribe({
      next: () => {
        this.toastService.success('Cours créé avec succès');
        this.showAddModal = false;
        this.loadCourses();
        // Rester sur la page des cours (pas de navigation)
      },
      error: (error) => {
        this.toastService.error(error.message || 'Erreur lors de la création');
      }
    });
  }

  editCourse(course: Course): void {
    this.selectedCourse.set(course);
    this.formData = {
      code: course.code,
      name: course.name,
      description: course.description,
      teacherId: course.teacherId,
      academicYearId: course.academicYearId,
      semesterId: course.semesterId
    };
    this.showEditModal = true;
  }

  saveEditCourse(): void {
    const selected = this.selectedCourse();
    if (selected) {
      const dto: UpdateCourseDto = {
        name: this.formData.name!,
        description: this.formData.description,
        teacherId: this.formData.teacherId!,
        academicYearId: this.formData.academicYearId!,
        semesterId: this.formData.semesterId!
      };

      this.updateCourseUseCase.execute(selected.id, dto).subscribe({
        next: () => {
          this.toastService.success('Cours modifié avec succès');
          this.showEditModal = false;
          this.selectedCourse.set(null);
          this.loadCourses();
          // Rester sur la page des cours (pas de navigation)
        },
        error: (error) => {
          this.toastService.error(error.message || 'Erreur lors de la modification');
        }
      });
    }
  }

  deleteCourse(course: Course): void {
    this.selectedCourse.set(course);
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    const selected = this.selectedCourse();
    if (selected) {
      this.deleteCourseUseCase.execute(selected.id).subscribe({
        next: () => {
          this.toastService.success('Cours supprimé avec succès');
          this.closeModal();
          this.loadCourses();
          // Rester sur la page des cours (pas de navigation)
        },
        error: (error) => {
          this.toastService.error(error.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  viewDetails(course: Course): void {
    this.selectedCourse.set(course);
    this.showViewModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showViewModal = false;
    this.showDeleteModal = false;
    this.selectedCourse.set(null);
  }

  // Menu management
  showMenu: string | null = null;

  toggleMenu(courseId: string): void {
    this.showMenu = this.showMenu === courseId ? null : courseId;
  }

  closeMenu(): void {
    this.showMenu = null;
  }
}
