import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { Classe, AnneeAcademique } from '../../../core/domain/entities/academic.entity';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit {
  classes = signal<Classe[]>([]);
  filteredClasses = signal<Classe[]>([]);
  anneesAcademiques = signal<AnneeAcademique[]>([]);

  isLoading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  selectedClasse = signal<Classe | null>(null);

  searchQuery = signal('');
  filterAnnee = signal<string>('ALL');

  formData = {
    nom: '',
    niveau: '',
    anneeAcademiqueId: ''
  };

  errorMessage = signal('');
  successMessage = signal('');

  // Computed statistics
  totalClasses = computed(() => this.classes().length);

  constructor(private academicUseCase: AcademicUseCase) { }

  ngOnInit(): void {
    this.loadClasses();
    this.loadAnneesAcademiques();
  }

  loadClasses(): void {
    this.isLoading.set(true);
    this.academicUseCase.getClasses().subscribe({
      next: (classes) => {
        this.classes.set(classes);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
        this.errorMessage.set('Erreur lors du chargement des classes');
        this.isLoading.set(false);
      }
    });
  }

  loadAnneesAcademiques(): void {
    this.academicUseCase.getAnneesAcademiques().subscribe({
      next: (annees) => {
        this.anneesAcademiques.set(annees);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des années académiques:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.classes();

    // Filter by année académique
    if (this.filterAnnee() !== 'ALL') {
      filtered = filtered.filter(c => c.anneeAcademiqueId?.toString() === this.filterAnnee());
    }

    // Filter by search query
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(c =>
        c.nom.toLowerCase().includes(query) ||
        (c.niveau && c.niveau.toLowerCase().includes(query))
      );
    }

    this.filteredClasses.set(filtered);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  onFilterAnnee(anneeId: string | number): void {
    this.filterAnnee.set(anneeId.toString());
    this.applyFilters();
  }

  openCreateModal(): void {
    this.selectedClasse.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEditModal(classe: Classe): void {
    this.selectedClasse.set(classe);
    this.formData = {
      nom: classe.nom,
      niveau: classe.niveau || '',
      anneeAcademiqueId: classe.anneeAcademiqueId?.toString() || ''
    };
    this.showModal.set(true);
  }

  openDeleteModal(classe: Classe): void {
    this.selectedClasse.set(classe);
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
      niveau: '',
      anneeAcademiqueId: ''
    };
  }

  onSubmit(): void {
    this.errorMessage.set('');

    if (this.selectedClasse()) {
      this.updateClasse();
    } else {
      this.createClasse();
    }
  }

  createClasse(): void {
    this.isLoading.set(true);
    const data = {
      nom: this.formData.nom,
      niveau: this.formData.niveau,
      anneeAcademiqueId: this.formData.anneeAcademiqueId || undefined
    };

    this.academicUseCase.createClasse(data).subscribe({
      next: () => {
        this.successMessage.set('Classe créée avec succès');
        this.closeModal();
        this.loadClasses();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la création');
        this.isLoading.set(false);
      }
    });
  }

  updateClasse(): void {
    const classe = this.selectedClasse();
    if (!classe) return;

    this.isLoading.set(true);
    const data = {
      nom: this.formData.nom,
      niveau: this.formData.niveau,
      anneeAcademiqueId: this.formData.anneeAcademiqueId || undefined
    };

    this.academicUseCase.updateClasse(classe.id, data).subscribe({
      next: () => {
        this.successMessage.set('Classe mise à jour avec succès');
        this.closeModal();
        this.loadClasses();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
    });
  }

  deleteClasse(): void {
    const classe = this.selectedClasse();
    if (!classe) return;

    this.isLoading.set(true);
    this.academicUseCase.deleteClasse(classe.id).subscribe({
      next: () => {
        this.successMessage.set('Classe archivée avec succès');
        this.closeModal();
        this.loadClasses();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  getAnneeLibelle(anneeId?: number | string): string {
    if (!anneeId) {
      return 'Non assignée';
    }
    // Pour les UUIDs, on compare directement en string
    const id = anneeId.toString();
    const annee = this.anneesAcademiques().find(a => a.id.toString() === id);
    return annee ? annee.libelle : 'Non assignée';
  }

  getClassesByAnnee(anneeId: string | number): number {
    return this.classes().filter(c => c.anneeAcademiqueId?.toString() === anneeId.toString()).length;
  }
}
