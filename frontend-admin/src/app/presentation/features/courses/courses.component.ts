import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../../core/services/toast.service';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

// Clean Architecture - Use Cases
import { GetAllCoursesUseCase } from '../../../core/application/use-cases/course/get-all-courses.use-case';
import { CreateCourseUseCase, CreateCourseDto } from '../../../core/application/use-cases/course/create-course.use-case';
import { UpdateCourseUseCase, UpdateCourseDto } from '../../../core/application/use-cases/course/update-course.use-case';
import { DeleteCourseUseCase } from '../../../core/application/use-cases/course/delete-course.use-case';
import { Course } from '../../../core/domain/entities/course.entity';
import { AcademicService } from '../../../core/services/academic.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ModalComponent, 
    SvgIconComponent, 
    LoadingSpinnerComponent,
    SearchBarComponent
  ],
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
  private academicService = inject(AcademicService);

  courses = signal<Course[]>([]);
  filteredCourses = signal<Course[]>([]);
  searchTerm = '';
  isLoading = signal(false);
  
  totalCourses = signal(0);
  activeCourses = signal(0);
  totalStudents = signal(0);

  showAddModal = false;
  showEditModal = false;
  showViewModal = false;
  showDeleteModal = false;
  selectedCourse = signal<Course | null>(null);

  formData: Partial<CreateCourseDto> = {};

  // Filter state
  activeFilter = signal<'all' | 'active' | 'semester1' | 'semester2'>('all');

  // Academic data
  academicYears = signal<any[]>([]);
  currentAcademicYearId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCourses();
    this.loadAcademicYears();
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.getAllCoursesUseCase.execute().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.applyFilters();
        this.updateStats();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Erreur lors du chargement des cours');
        console.error('Error loading courses:', error);
        this.isLoading.set(false);
      }
    });
  }

  updateStats(): void {
    const courses = this.courses();
    this.totalCourses.set(courses.length);
    this.activeCourses.set(courses.length); // All courses are active in mock
    this.totalStudents.set(courses.length * 40); // Mock calculation
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  setFilter(filter: 'all' | 'active' | 'semester1' | 'semester2'): void {
    this.activeFilter.set(filter);
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.courses()];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.code.toLowerCase().includes(search) ||
        (c.description && c.description.toLowerCase().includes(search))
      );
    }

    // Apply status/semester filter
    const filter = this.activeFilter();
    if (filter === 'semester1') {
      filtered = filtered.filter(c => 
        c.semesterId.toLowerCase().includes('1') || 
        c.semesterId.toLowerCase().includes('s1') ||
        c.semesterId.toLowerCase().includes('semester-1')
      );
    } else if (filter === 'semester2') {
      filtered = filtered.filter(c => 
        c.semesterId.toLowerCase().includes('2') || 
        c.semesterId.toLowerCase().includes('s2') ||
        c.semesterId.toLowerCase().includes('semester-2')
      );
    }
    // 'all' et 'active' ne filtrent pas (tous les cours sont actifs dans le mock)

    this.filteredCourses.set(filtered);
  }

  loadAcademicYears(): void {
    this.academicService.getAcademicYears().subscribe({
      next: (years) => {
        this.academicYears.set(years);
        // Trouver l'année active
        const activeYear = years.find(y => y.isActive);
        if (activeYear) {
          this.currentAcademicYearId.set(activeYear.id);
        }
      },
      error: (err) => console.error('Error loading academic years:', err)
    });
  }

  addCourse(): void {
    this.formData = {
      code: '',
      name: '',
      description: '',
      teacherId: 'teacher-1',
      academicYearId: this.currentAcademicYearId() || '',
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
