import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserUseCase } from '../../../core/usecases/user.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { Etudiant } from '../../../core/domain/entities/user.entity';
import { Classe } from '../../../core/domain/entities/academic.entity';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { UserCacheService } from '../../../core/services/user-cache.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit, OnDestroy {
  students = signal<Etudiant[]>([]);
  filteredStudents = signal<Etudiant[]>([]);
  classes = signal<Classe[]>([]);
  
  isLoading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  selectedStudent = signal<Etudiant | null>(null);
  errorMessage = signal('');
  successMessage = signal('');
  
  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = signal(0);
  hasNextPage = signal(false);
  hasPrevPage = signal(false);
  
  // Cache management
  cacheEnabled = signal(true);
  lastRefresh = signal<Date | null>(null);
  
  private confirmationService = inject(ConfirmationService);
  private userCacheService = inject(UserCacheService);
  
  // Destruction subject for cleanup
  private destroy$ = new Subject<void>();
  
  searchQuery = signal('');
  filterClasse = signal<string>('ALL');
  filterStatus = signal<string>('ALL');

  // Form data
  formData = {
    nom: '',
    prenom: '',
    email: '',
    numeroEtudiant: '',
    matricule: '', // Add matricule for template compatibility
    classeId: '',
    statut: 'ACTIF' as 'ACTIF' | 'INACTIF' | 'SUSPENDU'
  };

  constructor(
    private userUseCase: UserUseCase,
    private academicUseCase: AcademicUseCase
  ) {}

  ngOnInit(): void {
    this.loadClasses();
    this.loadStudents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudents(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const params = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery(),
      classeId: this.filterClasse() !== 'ALL' ? this.filterClasse() : undefined,
      statut: this.filterStatus() !== 'ALL' ? this.filterStatus() : undefined
    };

    // Load from server
    this.userUseCase.getStudentsPaginated(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: { students: Etudiant[]; pagination: any }) => {
        this.students.set(response.students);
        this.updatePagination(response.pagination);
        this.isLoading.set(false);
        this.lastRefresh.set(new Date());
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des étudiants:', error);
        this.errorMessage.set('Erreur lors du chargement des étudiants');
        this.isLoading.set(false);
      }
    });
  }

  private updatePagination(pagination: any): void {
    this.currentPage.set(pagination.currentPage);
    this.totalItems.set(pagination.totalItems);
    this.totalPages.set(pagination.totalPages);
    this.hasNextPage.set(pagination.hasNextPage);
    this.hasPrevPage.set(pagination.hasPrevPage);
  }

  loadClasses(): void {
    this.academicUseCase.getAllClasses().subscribe({
      next: (classes) => {
        if (Array.isArray(classes)) {
          this.classes.set(classes);
        } else {
          console.warn('Classes response is not an array:', classes);
          this.classes.set([]);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
        this.classes.set([]);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadStudents();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  onFilterClasse(classeId: string): void {
    this.filterClasse.set(classeId);
    this.applyFilters();
  }

  onFilterStatus(status: string): void {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadStudents();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  changePageSize(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    this.loadStudents();
  }

  openCreateModal(): void {
    this.selectedStudent.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(student: Etudiant): void {
    this.selectedStudent.set(student);
    this.formData.nom = student.nom;
    this.formData.prenom = student.prenom;
    this.formData.email = student.email;
    this.formData.numeroEtudiant = student.numeroEtudiant || '';
    this.formData.matricule = student.numeroEtudiant || ''; // Use numeroEtudiant as matricule
    this.formData.classeId = student.classeId?.toString() || '';
    this.formData.statut = student.statut as 'ACTIF' | 'INACTIF' | 'SUSPENDU' || 'ACTIF';
    this.showModal.set(true);
  }

  openDeleteModal(student: Etudiant): void {
    this.selectedStudent.set(student);
    this.showDeleteModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.showDeleteModal.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      nom: '',
      prenom: '',
      email: '',
      numeroEtudiant: '',
      matricule: '',
      classeId: '',
      statut: 'ACTIF'
    };
  }

  onSubmit(): void {
    if (this.selectedStudent()) {
      this.updateStudent();
    } else {
      this.createStudent();
    }
  }

  createStudent(): void {
    const data = {
      ...this.formData,
      classeId: this.formData.classeId ? parseInt(this.formData.classeId) : null
    };

    this.userUseCase.createStudent(data).subscribe({
      next: (newStudent: Etudiant) => {
        this.successMessage.set('Étudiant créé avec succès');
        this.closeModal();
        const currentStudents = this.students();
        this.students.set([...currentStudents, newStudent]);
      },
      error: (error: any) => {
        console.error('Erreur lors de la création:', error);
        this.errorMessage.set('Erreur lors de la création de l\'étudiant');
      }
    });
  }

  updateStudent(): void {
    const student = this.selectedStudent();
    if (!student) return;

    const data = {
      ...this.formData,
      classeId: this.formData.classeId ? parseInt(this.formData.classeId) : null
    };

    this.userUseCase.updateStudent(student.id, data).subscribe({
      next: (updatedStudent: Etudiant) => {
        this.successMessage.set('Étudiant modifié avec succès');
        this.closeModal();
        const currentStudents = this.students();
        const index = currentStudents.findIndex(s => s.id === student.id);
        if (index !== -1) {
          currentStudents[index] = updatedStudent;
          this.students.set([...currentStudents]);
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de la modification:', error);
        this.errorMessage.set('Erreur lors de la modification de l\'étudiant');
      }
    });
  }

  async deleteStudent(student: Etudiant): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer l\'étudiant',
      message: `Êtes-vous sûr de vouloir supprimer ${student.prenom} ${student.nom} ?`,
      type: 'danger'
    });

    if (confirmed) {
      this.userUseCase.deleteStudent(student.id).subscribe({
        next: () => {
          this.successMessage.set('Étudiant supprimé avec succès');
          this.closeModal();
          const currentStudents = this.students();
          this.students.set(currentStudents.filter(s => s.id !== student.id));
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          this.errorMessage.set('Erreur lors de la suppression de l\'étudiant');
        }
      });
    }
  }

  getClasseNom(classeId: number | string | undefined): string {
    if (!classeId) return 'Non assigné';
    const classe = this.classes().find(c => c.id.toString() === classeId.toString());
    return classe ? classe.nom : 'Classe inconnue';
  }

  toggleCache(): void {
    this.cacheEnabled.set(!this.cacheEnabled());
    if (!this.cacheEnabled()) {
      this.clearCache();
    } else {
      this.loadStudents();
    }
  }

  refreshData(): void {
    this.clearCache();
    this.loadStudents();
  }

  clearCache(): void {
    this.userCacheService.clearStudentsCache();
    setTimeout(() => {
      this.loadStudents();
    }, 100);
  }

  isDataFresh(): boolean {
    const lastRefresh = this.lastRefresh();
    if (!lastRefresh) return false;
    
    const now = new Date();
    const diffMinutes = (now.getTime() - lastRefresh.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }

  getCacheStatus(): string {
    if (!this.cacheEnabled()) return 'Désactivé';
    return this.isDataFresh() ? 'Frais' : 'Périmé';
  }

  getCacheStatusClass(): string {
    if (!this.cacheEnabled()) return 'cache-disabled';
    return this.isDataFresh() ? 'cache-fresh' : 'cache-stale';
  }

  totalStudents(): number {
    return this.totalItems();
  }

  activeStudents(): number {
    return this.students().filter(s => s.statut === 'ACTIF').length;
  }

  inactiveStudents(): number {
    return this.students().filter(s => s.statut === 'INACTIF' || s.statut === 'SUSPENDU').length;
  }

  toggleStatus(student: Etudiant): void {
    const newStatus = student.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    const data = { statut: newStatus };

    this.userUseCase.updateStudent(student.id, data).subscribe({
      next: (updatedStudent: Etudiant) => {
        this.successMessage.set(`Statut de l'étudiant modifié: ${newStatus}`);
        const currentStudents = this.students();
        const index = currentStudents.findIndex(s => s.id === student.id);
        if (index !== -1) {
          currentStudents[index] = updatedStudent;
          this.students.set([...currentStudents]);
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de la modification du statut:', error);
        this.errorMessage.set('Erreur lors de la modification du statut');
      }
    });
  }
}