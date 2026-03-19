import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserUseCase } from '../../../core/usecases/user.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { User, Etudiant } from '../../../core/domain/entities/user.entity';
import { Classe, Ecole } from '../../../core/domain/entities/academic.entity';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { UserCacheService } from '../../../core/services/user-cache.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExcelUploadComponent, ExcelUploadResult } from '../../shared/components/excel-upload/excel-upload.component';
import { ApiService } from '../../../infrastructure/http/api.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, ExcelUploadComponent],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit, OnDestroy {
  students = signal<Etudiant[]>([]);
  filteredStudents = signal<Etudiant[]>([]);
  classes = signal<Classe[]>([]);
  ecoles = signal<Ecole[]>([]);

  isLoading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  selectedStudent = signal<Etudiant | null>(null);

  // Cache management
  cacheEnabled = signal(true);
  lastRefresh = signal<Date | null>(null);

  private confirmationService = inject(ConfirmationService);
  private userCacheService = inject(UserCacheService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  isSuperAdmin(): boolean {
    return this.authService.currentUser()?.role === 'SUPER-ADMIN';
  }

  // Destruction subject for cleanup
  private destroy$ = new Subject<void>();

  searchQuery = signal('');
  filterEcole = signal<string>('ALL');
  filterClasse = signal<string>('ALL');
  filterStatus = signal<string>('ALL');
  showArchived = signal(false);
  showImportDialog = signal(false);
  showActionsMenu = signal(false);

  toggleActionsMenu(): void {
    this.showActionsMenu.update(v => !v);
  }

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

  // Computed signal pour filtrer les classes par école sélectionnée
  filteredClasses = computed(() => {
    try {
      const ecoleId = this.filterEcole();
      const allClasses = this.classes();

      if (!allClasses || !Array.isArray(allClasses)) {
        return [];
      }

      if (!ecoleId || ecoleId === 'ALL') {
        return allClasses;
      }

      return allClasses.filter(c => {
        return c && c.ecoleId && c.ecoleId.toString() === ecoleId.toString();
      });
    } catch (error) {
      console.error('Erreur dans filteredClasses:', error);
      const allClasses = this.classes();
      return Array.isArray(allClasses) ? allClasses : [];
    }
  });

  constructor(
    private userUseCase: UserUseCase,
    private academicUseCase: AcademicUseCase
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadClasses();
    this.loadEcoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupCacheObservation(): void {
    // Désactivé — chaque action (create/update/delete) gère son propre refresh
  }

  loadStudents(): void {
    this.isLoading.set(true);

    if (this.cacheEnabled()) {
      this.userCacheService.getStudents({
        ttl: 10 * 60 * 1000,
        persistToStorage: true
      }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (students) => {
          this.students.set(students as Etudiant[]);
          this.applyFilters();
          this.isLoading.set(false);
          this.lastRefresh.set(new Date());
        },
        error: () => {
          this.isLoading.set(false);
          this.loadStudentsDirectly();
        }
      });
    } else {
      this.loadStudentsDirectly();
    }
  }

  loadStudentsDirectly(): void {
    this.userUseCase.getAllUsers(true).subscribe({
      next: (users: User[]) => {
        const students = users.filter((u: User) => u.role === 'ETUDIANT') as Etudiant[];
        this.students.set(students);
        this.applyFilters();
        this.isLoading.set(false);
        this.lastRefresh.set(new Date());
      },
      error: (error: any) => {
        this.errorMessage.set('Erreur lors du chargement des étudiants');
        this.isLoading.set(false);
      }
    });
  }

  loadClasses(): void {
    this.academicUseCase.getClasses().subscribe({
      next: (classes) => {
        const classesActives = classes.filter(c => !c.estArchive);
        this.classes.set(classesActives);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
      }
    });
  }

  loadEcoles(): void {
    this.academicUseCase.getEcoles().subscribe({
      next: (ecoles) => {
        this.ecoles.set(ecoles);
      },
      error: (error) => {
        if (error.status && error.status !== 401) {
          console.warn('Impossible de charger les écoles.');
        }
      }
    });
  }

  applyFilters(): void {
    try {
      let filtered = this.students();

      if (!this.showArchived()) {
        filtered = filtered.filter(s => !s.estArchive);
      } else {
        filtered = filtered.filter(s => s.estArchive);
      }

      const ecoleFilter = this.filterEcole();
      if (ecoleFilter && ecoleFilter !== 'ALL') {
        const classesInEcole = this.classes()
          .filter(c => c.ecoleId && c.ecoleId.toString() === ecoleFilter.toString())
          .map(c => c.id.toString());

        if (classesInEcole.length > 0) {
          filtered = filtered.filter(s =>
            s.classeId && classesInEcole.includes(s.classeId.toString())
          );
        }
      }

      const classeFilter = this.filterClasse();
      if (classeFilter && classeFilter !== 'ALL') {
        filtered = filtered.filter(s => s.classeId?.toString() === classeFilter);
      }

      const statusFilter = this.filterStatus();
      if (statusFilter && statusFilter !== 'ALL') {
        const isActive = statusFilter === 'ACTIVE';
        filtered = filtered.filter(s => s.estActif === isActive);
      }

      const searchQuery = this.searchQuery();
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(s =>
          s.nom.toLowerCase().includes(query) ||
          s.prenom.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          (s.matricule && s.matricule.toLowerCase().includes(query))
        );
      }

      this.filteredStudents.set(filtered);
    } catch (error) {
      this.filteredStudents.set(this.students().filter(s => !s.estArchive));
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  onFilterEcole(ecoleId: string): void {
    this.filterEcole.set(ecoleId);
    this.filterClasse.set('ALL');
    this.applyFilters();
  }

  onToggleArchived(showArchived: boolean): void {
    this.showArchived.set(showArchived);
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
      next: () => {
        this.successMessage.set('Étudiant créé avec succès');
        this.closeModal();
        this.userCacheService.invalidateAndRefresh().subscribe(users => {
          const students = users.filter(u => u.role === 'ETUDIANT') as Etudiant[];
          this.students.set(students);
          this.applyFilters();
          this.isLoading.set(false);
        });
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
      next: () => {
        this.successMessage.set('Étudiant mis à jour avec succès');
        this.closeModal();
        this.userCacheService.invalidateAndRefresh().subscribe(users => {
          const students = users.filter(u => u.role === 'ETUDIANT') as Etudiant[];
          this.students.set(students);
          this.applyFilters();
          this.isLoading.set(false);
        });
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
        this.userCacheService.invalidateAndRefresh().subscribe(users => {
          const students = users.filter(u => u.role === 'ETUDIANT') as Etudiant[];
          this.students.set(students);
          this.applyFilters();
          this.isLoading.set(false);
        });
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  async toggleStatus(student: Etudiant): Promise<void> {
    const newStatus = !student.estActif;
    const action = student.estActif ? 'désactiver' : 'activer';
    const confirmed = await this.confirmationService.confirm({
      title: `Confirmer ${action === 'désactiver' ? 'la désactivation' : "l'activation"}`,
      message: `Êtes-vous sûr de vouloir ${action} l'étudiant "${student.prenom} ${student.nom}" ?`,
      confirmText: action === 'désactiver' ? 'Désactiver' : 'Activer',
      cancelText: 'Annuler',
      type: action === 'désactiver' ? 'warning' : 'success',
      icon: action === 'désactiver' ? 'person_off' : 'person'
    });

    if (!confirmed) return;

    this.userUseCase.updateUser(student.id.toString(), { estActif: newStatus }).subscribe({
      next: () => {
        this.successMessage.set(`Étudiant ${newStatus ? 'activé' : 'désactivé'} avec succès`);
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

  toggleCache(): void {
    this.cacheEnabled.set(!this.cacheEnabled());
    if (this.cacheEnabled()) {
      this.loadStudents();
    } else {
      this.userCacheService.invalidateAllUsers();
      this.loadStudentsDirectly();
    }
  }

  refreshData(): void {
    if (this.cacheEnabled()) {
      this.userCacheService.refreshByRole('ETUDIANT');
    } else {
      this.loadStudentsDirectly();
    }
  }

  clearCache(): void {
    this.userCacheService.refreshByRole('ETUDIANT');
    this.lastRefresh.set(null);
    this.successMessage.set('Cache des étudiants vidé avec succès');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  isDataFresh(): boolean {
    const lastRefresh = this.lastRefresh();
    if (!lastRefresh) return false;
    const diffMinutes = (new Date().getTime() - lastRefresh.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }

  getCacheStatus(): string {
    if (!this.cacheEnabled()) return 'Désactivé';
    if (this.isDataFresh()) return 'Actuel';
    return 'Expiré';
  }

  getCacheStatusClass(): string {
    if (!this.cacheEnabled()) return 'cache-disabled';
    if (this.isDataFresh()) return 'cache-fresh';
    return 'cache-expired';
  }

  // === MÉTHODES D'IMPORT/EXPORT ===

  openImportDialog(): void {
    this.showImportDialog.set(true);
  }

  closeImportDialog(): void {
    this.showImportDialog.set(false);
  }

  async onExcelFileUploaded(result: ExcelUploadResult): Promise<void> {
    this.isLoading.set(true);
    try {
      const formData = new FormData();
      formData.append('file', result.file);

      const response = await new Promise<any>((resolve, reject) => {
        this.apiService.upload<any>('/data/import/etudiants', formData).subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err)
        });
      });

      this.successMessage.set(
        `Import réussi: ${response.data?.created?.length || 0} créés, ${response.data?.updated?.length || 0} mis à jour`
      );
      this.closeImportDialog();
      this.refreshData();
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch (error: any) {
      this.errorMessage.set(error.error?.message || "Erreur lors de l'import");
      setTimeout(() => this.errorMessage.set(''), 5000);
    } finally {
      this.isLoading.set(false);
    }
  }

  exportStudents(): void {
    const params: any = {};
    if (this.filterClasse() !== 'ALL') {
      params['classeId'] = this.filterClasse();
    }

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/data/export/etudiants${queryString ? '?' + queryString : ''}`;

    this.apiService.get<Blob>(endpoint, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `etudiants_${Date.now()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.errorMessage.set("Erreur lors de l'export")
    });
  }

  downloadTemplate(): void {
    this.apiService.get<Blob>('/data/templates/etudiants', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_etudiants.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.errorMessage.set('Erreur lors du téléchargement du template')
    });
  }
}
