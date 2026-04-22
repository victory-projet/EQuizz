import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserUseCase } from '../../../core/usecases/user.usecase';
import { Enseignant } from '../../../core/domain/entities/user.entity';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { ExcelUploadComponent, ExcelUploadResult } from '../../shared/components/excel-upload/excel-upload.component';
import { ApiService } from '../../../infrastructure/http/api.service';
import { AuthService } from '../../shared/services/auth.service';
import { SchoolService, School } from '../../../core/services/school.service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule, ExcelUploadComponent],
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss']
})
export class TeachersComponent implements OnInit {
  teachers = signal<Enseignant[]>([]);
  filteredTeachers = signal<Enseignant[]>([]);
  
  isLoading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  selectedTeacher = signal<Enseignant | null>(null);
  
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private schoolService = inject(SchoolService);
  private apiService = inject(ApiService);

  isSuperAdmin = computed(() => this.authService.currentUser()?.role === 'SUPER-ADMIN');
  schools = signal<School[]>([]);

  searchQuery = signal('');
  filterStatus = signal<string>('ALL');
  filterEcole = signal<string>('ALL');
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
    specialite: ''
  };

  errorMessage = signal('');
  successMessage = signal('');

  totalTeachers = computed(() => this.teachers().length);
  activeTeachers = computed(() => this.teachers().filter(t => t.estActif && !t.estArchive).length);
  inactiveTeachers = computed(() => this.teachers().filter(t => !t.estActif && !t.estArchive).length);
  archivedTeachers = computed(() => this.teachers().filter(t => t.estArchive).length);

  constructor(private userUseCase: UserUseCase) {}

  ngOnInit(): void {
    this.loadTeachers();
    if (this.isSuperAdmin()) {
      this.loadSchools();
    }
  }

  loadSchools(): void {
    this.schoolService.getAllSchools().subscribe({
      next: (schools) => this.schools.set(schools),
      error: () => {}
    });
  }

  loadTeachers(): void {
    this.isLoading.set(true);
    this.userUseCase.getAllUsers(true).subscribe({
      next: (users: any[]) => {
        const teachers = users.filter((u: any) => u.role === 'ENSEIGNANT') as Enseignant[];
        this.teachers.set(teachers);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  applyFilters(): void {
    let filtered = this.teachers();

    // Filtrage par archivage (par défaut, afficher uniquement les actifs)
    if (!this.showArchived()) {
      filtered = filtered.filter(t => !t.estArchive);
    } else {
      filtered = filtered.filter(t => t.estArchive);
    }

    if (this.filterStatus() !== 'ALL') {
      const isActive = this.filterStatus() === 'ACTIVE';
      filtered = filtered.filter(t => t.estActif === isActive);
    }

    const ecoleFilter = this.filterEcole();
    if (ecoleFilter && ecoleFilter !== 'ALL') {
      filtered = filtered.filter(t => (t as any).ecoleId?.toString() === ecoleFilter);
    }

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(t =>
        t.nom.toLowerCase().includes(query) ||
        t.prenom.toLowerCase().includes(query) ||
        t.email.toLowerCase().includes(query) ||
        (t.specialite && t.specialite.toLowerCase().includes(query))
      );
    }

    this.filteredTeachers.set(filtered);
  }

  onFilterEcole(ecoleId: string): void {
    this.filterEcole.set(ecoleId);
    this.applyFilters();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  onFilterStatus(status: string): void {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  onToggleArchived(showArchived: boolean): void {
    this.showArchived.set(showArchived);
    this.applyFilters();
  }

  openCreateModal(): void {
    this.selectedTeacher.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(teacher: Enseignant): void {
    this.selectedTeacher.set(teacher);
    this.formData = {
      nom: teacher.nom,
      prenom: teacher.prenom,
      email: teacher.email,
      specialite: teacher.specialite || ''
    };
    this.showModal.set(true);
  }

  openDeleteModal(teacher: Enseignant): void {
    this.selectedTeacher.set(teacher);
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
      specialite: ''
    };
  }

  onSubmit(): void {
    this.errorMessage.set('');
    
    if (this.selectedTeacher()) {
      this.updateTeacher();
    } else {
      this.createTeacher();
    }
  }

  createTeacher(): void {
    this.isLoading.set(true);
    const data = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email,
      role: 'ENSEIGNANT' as const,
      specialite: this.formData.specialite || undefined
    };

    this.userUseCase.createUser(data).subscribe({
      next: () => {
        this.successMessage.set('Enseignant créé avec succès');
        this.closeModal();
        this.loadTeachers();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  updateTeacher(): void {
    const teacher = this.selectedTeacher();
    if (!teacher) return;

    this.isLoading.set(true);
    const data = {
      nom: this.formData.nom,
      prenom: this.formData.prenom,
      email: this.formData.email,
      specialite: this.formData.specialite || undefined
    };

    this.userUseCase.updateUser(teacher.id.toString(), data).subscribe({
      next: () => {
        this.successMessage.set('Enseignant mis à jour avec succès');
        this.closeModal();
        this.loadTeachers();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  deleteTeacher(): void {
    const teacher = this.selectedTeacher();
    if (!teacher) return;

    this.isLoading.set(true);
    this.userUseCase.deleteUser(teacher.id.toString()).subscribe({
      next: () => {
        this.successMessage.set('Enseignant supprimé avec succès');
        this.closeModal();
        this.loadTeachers();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  toggleStatus(teacher: Enseignant): void {
    const newStatus = !teacher.estActif;
    this.userUseCase.updateUser(teacher.id.toString(), { estActif: newStatus }).subscribe({
      next: () => {
        this.successMessage.set(`Enseignant ${newStatus ? 'activé' : 'désactivé'} avec succès`);
        this.loadTeachers();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {}
    });
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
        this.apiService.upload<any>('/data/import/enseignants', formData).subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err)
        });
      });

      this.successMessage.set(
        `Import réussi: ${response.data?.created?.length || 0} créés, ${response.data?.updated?.length || 0} mis à jour`
      );
      this.closeImportDialog();
      this.loadTeachers();
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch (error: any) {
      this.errorMessage.set(error.error?.message || "Erreur lors de l'import");
      setTimeout(() => this.errorMessage.set(''), 5000);
    } finally {
      this.isLoading.set(false);
    }
  }

  exportTeachers(): void {
    this.apiService.get<Blob>('/data/export/enseignants', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enseignants_${Date.now()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.errorMessage.set("Erreur lors de l'export")
    });
  }

  downloadTemplate(): void {
    this.apiService.get<Blob>('/data/templates/enseignants', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_enseignants.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.errorMessage.set('Erreur lors du téléchargement du template')
    });
  }
}
