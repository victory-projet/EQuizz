import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserUseCase } from '../../../core/usecases/user.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { User, Etudiant } from '../../../core/domain/entities/user.entity';
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

  formData = {
    nom: '',
    prenom: '',
    email: '',
    matricule: '',
    classeId: '',
    numeroCarteEtudiant: ''
  };

  errorMessage = signal('');
  successMessage = signal('');

  totalStudents = computed(() => this.students().length);
  activeStudents = computed(() => this.students().filter(s => s.estActif).length);
  inactiveStudents = computed(() => this.students().filter(s => !s.estActif).length);

  constructor(
    private userUseCase: UserUseCase,
    private academicUseCase: AcademicUseCase
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadClasses();
    this.setupCacheObservation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupCacheObservation(): void {
    // Observer les changements des étudiants en temps réel
    this.userCacheService.observeStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(students => {
        if (students.length > 0) {
          this.students.set(students as Etudiant[]);
          this.applyFilters();
          this.lastRefresh.set(new Date());
        }
      });
  }

  loadStudents(): void {
    this.isLoading.set(true);
    
    if (this.cacheEnabled()) {
      // Utiliser le cache service
      this.userCacheService.getStudents({
        ttl: 10 * 60 * 1000, // 10 minutes
        persistToStorage: true
      }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (students) => {
          this.students.set(students as Etudiant[]);
          this.applyFilters();
          this.isLoading.set(false);
          this.lastRefresh.set(new Date());
        },
        error: (error) => {
          console.error('Erreur lors du chargement des étudiants:', error);
          this.errorMessage.set('Erreur lors du chargement des étudiants');
          this.isLoading.set(false);
          // Fallback vers l'API directe
          this.loadStudentsDirectly();
        }
      });
    } else {
      this.loadStudentsDirectly();
    }
  }

  loadStudentsDirectly(): void {
    this.userUseCase.getAllUsers().subscribe({
      next: (users: User[]) => {
        const students = users.filter((u: User) => u.role === 'ETUDIANT') as Etudiant[];
        console.log('📚 Étudiants chargés:', students);
        this.students.set(students);
        this.applyFilters();
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

  loadClasses(): void {
    this.academicUseCase.getClasses().subscribe({
      next: (classes) => {
        this.classes.set(classes);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.students();

    if (this.filterClasse() !== 'ALL') {
      filtered = filtered.filter(s => s.classeId?.toString() === this.filterClasse());
    }

    if (this.filterStatus() !== 'ALL') {
      const isActive = this.filterStatus() === 'ACTIVE';
      filtered = filtered.filter(s => s.estActif === isActive);
    }

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(s =>
        s.nom.toLowerCase().includes(query) ||
        s.prenom.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        (s.matricule && s.matricule.toLowerCase().includes(query))
      );
    }

    this.filteredStudents.set(filtered);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  onFilterClasse(classeId: string): void {
    this.filterClasse.set(classeId);
    this.applyFilters();
  }

  onFilterStatus(status: string): void {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  openCreateModal(): void {
    this.selectedStudent.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(student: Etudiant): void {
    this.selectedStudent.set(student);
    this.formData = {
      nom: student.nom,
      prenom: student.prenom,
      email: student.email,
      matricule: student.matricule || '',
      classeId: student.classeId?.toString() || '',
      numeroCarteEtudiant: student.numeroCarteEtudiant || ''
    };
    this.showModal.set(true);
  }

  openDeleteModal(student: Etudiant): void {
    this.selectedStudent.set(student);
    this.showDeleteModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.showDeleteModal.set(false);
    this.errorMessage.set('');
  }

  resetForm(): void {
    this.formData = {
      nom: '',
      prenom: '',
      email: '',
      matricule: '',
      classeId: '',
      numeroCarteEtudiant: ''
    };
  }

  onSubmit(): void {
    this.errorMessage.set('');
    
    if (this.selectedStudent()) {
      this.updateStudent();
    } else {
      this.createStudent();
    }
  }

  createStudent(): void {
    this.isLoading.set(true);
    const data = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email,
      role: 'ETUDIANT' as const,
      matricule: this.formData.matricule || undefined
    };

    this.userUseCase.createUser(data).subscribe({
      next: (newStudent) => {
        this.successMessage.set('Étudiant créé avec succès');
        this.closeModal();
        
        // Mettre à jour le cache
        if (this.cacheEnabled()) {
          this.userCacheService.updateCacheAfterOperation('create', newStudent);
        } else {
          this.loadStudents();
        }
        
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la création');
        this.isLoading.set(false);
      }
    });
  }

  updateStudent(): void {
    const student = this.selectedStudent();
    if (!student) return;

    this.isLoading.set(true);
    const data = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email
    };

    this.userUseCase.updateUser(student.id.toString(), data).subscribe({
      next: (updatedStudent) => {
        this.successMessage.set('Étudiant mis à jour avec succès');
        this.closeModal();
        
        // Mettre à jour le cache
        if (this.cacheEnabled()) {
          this.userCacheService.updateCacheAfterOperation('update', updatedStudent);
        } else {
          this.loadStudents();
        }
        
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
    });
  }

  async deleteStudent(student: Etudiant): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete(`${student.prenom} ${student.nom}`);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.userUseCase.deleteUser(student.id.toString()).subscribe({
      next: () => {
        this.successMessage.set('Étudiant supprimé avec succès');
        this.loadStudents();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  async toggleStatus(student: Etudiant): Promise<void> {
    const action = student.estActif ? 'désactiver' : 'activer';
    const confirmed = await this.confirmationService.confirm({
      title: `Confirmer ${action === 'désactiver' ? 'la désactivation' : 'l\'activation'}`,
      message: `Êtes-vous sûr de vouloir ${action} l'étudiant "${student.prenom} ${student.nom}" ?`,
      confirmText: action === 'désactiver' ? 'Désactiver' : 'Activer',
      cancelText: 'Annuler',
      type: action === 'désactiver' ? 'warning' : 'success',
      icon: action === 'désactiver' ? 'person_off' : 'person'
    });
    
    if (!confirmed) return;

    this.userUseCase.updateUser(student.id.toString(), { estActif: !student.estActif }).subscribe({
      next: () => {
        this.successMessage.set(`Étudiant ${student.estActif ? 'désactivé' : 'activé'} avec succès`);
        this.loadStudents();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors du changement de statut');
      }
    });
  }

  getClasseNom(classeId?: number | string): string {
    if (!classeId) return 'Non assignée';
    const classe = this.classes().find(c => c.id.toString() === classeId.toString());
    return classe ? classe.nom : 'Non assignée';
  }

  // === MÉTHODES DE GESTION DU CACHE ===

  /**
   * Active ou désactive le cache
   */
  toggleCache(): void {
    this.cacheEnabled.set(!this.cacheEnabled());
    if (this.cacheEnabled()) {
      this.loadStudents();
    } else {
      this.userCacheService.invalidateAllUsers();
      this.loadStudentsDirectly();
    }
  }

  /**
   * Actualise manuellement les données
   */
  refreshData(): void {
    if (this.cacheEnabled()) {
      this.userCacheService.refreshByRole('ETUDIANT');
    } else {
      this.loadStudentsDirectly();
    }
  }

  /**
   * Vide le cache des étudiants
   */
  clearCache(): void {
    this.userCacheService.refreshByRole('ETUDIANT');
    this.lastRefresh.set(null);
    this.successMessage.set('Cache des étudiants vidé avec succès');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  /**
   * Vérifie si les données sont récentes
   */
  isDataFresh(): boolean {
    const lastRefresh = this.lastRefresh();
    if (!lastRefresh) return false;
    
    const now = new Date();
    const diffMinutes = (now.getTime() - lastRefresh.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Considéré comme frais si moins de 5 minutes
  }

  /**
   * Obtient le statut du cache pour l'affichage
   */
  getCacheStatus(): string {
    if (!this.cacheEnabled()) return 'Désactivé';
    if (this.isDataFresh()) return 'Actuel';
    return 'Expiré';
  }

  /**
   * Obtient la classe CSS pour le statut du cache
   */
  getCacheStatusClass(): string {
    if (!this.cacheEnabled()) return 'cache-disabled';
    if (this.isDataFresh()) return 'cache-fresh';
    return 'cache-expired';
  }
}
