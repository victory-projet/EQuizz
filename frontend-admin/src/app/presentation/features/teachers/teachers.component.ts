import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserUseCase } from '../../../core/usecases/user.usecase';
import { Enseignant } from '../../../core/domain/entities/user.entity';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { ExcelUploadComponent } from '../../shared/components/excel-upload/excel-upload.component';
import { environment } from '../../../../environments/environment';

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
  
  searchQuery = signal('');
  filterStatus = signal<string>('ALL');
  showArchived = signal(false);
  showImportDialog = signal(false);

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
  }

  loadTeachers(): void {
    this.isLoading.set(true);
    // Charger TOUS les enseignants (y compris archivés)
    this.userUseCase.getAllUsers(true).subscribe({
      next: (users: any[]) => {
        const teachers = users.filter((u: any) => u.role === 'ENSEIGNANT') as Enseignant[];
        console.log('👨‍🏫 Enseignants chargés:', teachers);
        this.teachers.set(teachers);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des enseignants:', error);
        this.errorMessage.set('Erreur lors du chargement des enseignants');
        this.isLoading.set(false);
      }
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
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la création');
        this.isLoading.set(false);
      }
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
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
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
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isLoading.set(false);
      }
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
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors du changement de statut');
      }
    });
  }

  // === MÉTHODES D'IMPORT/EXPORT ===

  openImportDialog(): void {
    this.showImportDialog.set(true);
  }

  closeImportDialog(): void {
    this.showImportDialog.set(false);
  }

  onImportComplete(result: any): void {
    this.successMessage.set(`Import réussi: ${result.created || 0} créés, ${result.updated || 0} mis à jour`);
    this.closeImportDialog();
    this.loadTeachers();
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  onImportError(error: any): void {
    this.errorMessage.set(error.message || 'Erreur lors de l\'import');
    setTimeout(() => this.errorMessage.set(''), 5000);
  }

  exportTeachers(): void {
    const url = `${environment.apiUrl}/data/export/enseignants`;
    window.open(url, '_blank');
  }

  downloadTemplate(): void {
    const url = `${environment.apiUrl}/data/templates/enseignants`;
    window.open(url, '_blank');
  }
}
