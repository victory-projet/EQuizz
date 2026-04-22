import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { Cours } from '../../../core/domain/entities/academic.entity';
import { ArchiveToggleComponent } from '../../shared/components/archive-toggle/archive-toggle.component';
import { ExcelUploadComponent } from '../../shared/components/excel-upload/excel-upload.component';
import { AuthService } from '../../shared/services/auth.service';
import { SchoolService, School } from '../../../core/services/school.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, ArchiveToggleComponent, ExcelUploadComponent],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  cours = signal<Cours[]>([]);
  filteredCours = signal<Cours[]>([]);
  
  isLoading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  selectedCours = signal<Cours | null>(null);
  
  searchQuery = signal('');
  filterStatus = signal<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  showArchived = signal(false);
  showImportDialog = signal(false);
  showActionsMenu = signal(false);

  private authService = inject(AuthService);
  private schoolService = inject(SchoolService);

  isSuperAdmin = computed(() => this.authService.currentUser()?.role === 'SUPER-ADMIN');
  schools = signal<School[]>([]);

  formData = {
    code: '',
    nom: '',
    description: '',
    ecoleId: ''
  };

  errorMessage = signal('');
  successMessage = signal('');

  // Computed statistics
  totalCours = computed(() => this.cours().length);
  coursActifs = computed(() => this.cours().filter(c => !c.estArchive).length);
  coursArchives = computed(() => this.cours().filter(c => c.estArchive).length);

  constructor(private academicUseCase: AcademicUseCase) {}

  ngOnInit(): void {
    this.loadCours();
    if (this.isSuperAdmin()) {
      this.loadSchools();
    }
  }

  loadSchools(): void {
    this.schoolService.getAllSchools().subscribe({
      next: (schools) => this.schools.set(schools),
      error: (err) => console.error('Erreur chargement écoles:', err)
    });
  }

  loadCours(): void {
    this.isLoading.set(true);
    this.academicUseCase.getCours(true).subscribe({
      next: (cours) => {
        this.cours.set(cours);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  applyFilters(): void {
    let filtered = this.cours();

    // Filter by archive status (par défaut, afficher uniquement les actifs)
    if (!this.showArchived()) {
      filtered = filtered.filter(c => !c.estArchive);
    } else {
      filtered = filtered.filter(c => c.estArchive);
    }

    // Filter by search query
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(query) ||
        c.nom.toLowerCase().includes(query)
      );
    }

    this.filteredCours.set(filtered);
  }

  onToggleArchived(showArchived: boolean): void {
    this.showArchived.set(showArchived);
    this.applyFilters();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  onFilterStatus(status: 'ALL' | 'ACTIVE' | 'ARCHIVED'): void {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  openCreateModal(): void {
    this.selectedCours.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(cours: Cours): void {
    this.selectedCours.set(cours);
    this.formData = {
      code: cours.code,
      nom: cours.nom,
      description: cours.description || '',
      ecoleId: (cours as any).ecoleId || ''
    };
    this.showModal.set(true);
  }

  openDeleteModal(cours: Cours): void {
    this.selectedCours.set(cours);
    this.showDeleteModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.showDeleteModal.set(false);
    this.errorMessage.set('');
  }

  resetForm(): void {
    this.formData = {
      code: '',
      nom: '',
      description: '',
      ecoleId: ''
    };
  }

  onSubmit(): void {
    this.errorMessage.set('');
    
    if (this.selectedCours()) {
      this.updateCours();
    } else {
      this.createCours();
    }
  }

  createCours(): void {
    this.isLoading.set(true);
    const data: any = {
      code: this.formData.code,
      nom: this.formData.nom,
      description: this.formData.description,
      estArchive: false
    };
    // Pour le super-admin, inclure l'école sélectionnée
    if (this.isSuperAdmin() && this.formData.ecoleId) {
      data.ecoleId = this.formData.ecoleId;
    }

    this.academicUseCase.createCours(data).subscribe({
      next: () => {
        this.successMessage.set('Cours créé avec succès');
        this.closeModal();
        this.loadCours();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const msg = err?.error?.error?.message;
        this.errorMessage.set(msg || 'Erreur lors de la création du cours');
      }
    });
  }

  updateCours(): void {
    const cours = this.selectedCours();
    if (!cours) return;

    this.isLoading.set(true);
    const data = {
      code: this.formData.code,
      nom: this.formData.nom,
      description: this.formData.description
    };

    this.academicUseCase.updateCours(cours.id, data).subscribe({
      next: () => {
        this.successMessage.set('Cours mis à jour avec succès');
        this.closeModal();
        this.loadCours();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  deleteCours(): void {
    const cours = this.selectedCours();
    if (!cours) return;

    this.isLoading.set(true);
    this.academicUseCase.deleteCours(cours.id).subscribe({
      next: () => {
        this.successMessage.set('Cours supprimé avec succès');
        this.closeModal();
        this.loadCours();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  toggleArchiveStatus(cours: Cours): void {
    const newArchiveStatus = !cours.estArchive;
    this.academicUseCase.updateCours(cours.id, { estArchive: newArchiveStatus }).subscribe({
      next: () => {
        this.successMessage.set(`Cours ${newArchiveStatus ? 'archivé' : 'désarchivé'} avec succès`);
        this.loadCours();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {}
    });
  }

  // === MÉTHODES D'IMPORT/EXPORT ===

  toggleActionsMenu(): void {
    this.showActionsMenu.set(!this.showActionsMenu());
  }

  openImportDialog(): void {
    this.showImportDialog.set(true);
  }

  closeImportDialog(): void {
    this.showImportDialog.set(false);
  }

  onImportComplete(result: any): void {
    this.successMessage.set(`Import réussi: ${result.created || 0} créés, ${result.updated || 0} mis à jour`);
    this.closeImportDialog();
    this.loadCours();
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  onImportError(error: any): void {
    this.errorMessage.set(error.message || 'Erreur lors de l\'import');
    setTimeout(() => this.errorMessage.set(''), 5000);
  }

  exportCourses(): void {
    const url = `${environment.apiUrl}/data/export/cours`;
    window.open(url, '_blank');
  }

  downloadTemplate(): void {
    const url = `${environment.apiUrl}/data/templates/cours`;
    window.open(url, '_blank');
  }
}
