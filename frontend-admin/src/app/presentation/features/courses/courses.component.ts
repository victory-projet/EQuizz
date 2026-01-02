import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursService, Enseignant } from '../../../core/services/cours.service';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { AnneeAcademique, Semestre, Cours } from '../../../core/domain/entities/academic.entity';
import { UserCacheService } from '../../../core/services/user-cache.service';
import { User } from '../../../core/domain/entities/user.entity';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  cours = signal<Cours[]>([]);
  filteredCours = signal<Cours[]>([]);
  anneesAcademiques = signal<AnneeAcademique[]>([]);
  semestres = signal<Semestre[]>([]);
  enseignants = signal<User[]>([]);
  availableEnseignants = signal<Enseignant[]>([]);
  
  isLoading = signal(false);
  showModal = signal(false);
  showDeleteModal = signal(false);
  selectedCours = signal<Cours | null>(null);
  
  searchQuery = signal('');
  filterStatus = signal<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  filterSemestre = signal<string>('ALL');

  // Pagination
  pagination = signal({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  formData = {
    code: '',
    nom: '',
    description: '',
    semestre_id: '',
    enseignantIds: [] as string[]
  };

  errorMessage = signal('');
  successMessage = signal('');

  // Computed statistics
  totalCours = computed(() => this.pagination().totalItems);
  coursActifs = computed(() => this.cours().filter(c => !c.estArchive).length);
  coursArchives = computed(() => this.cours().filter(c => c.estArchive).length);

  constructor(
    private coursService: CoursService,
    private academicUseCase: AcademicUseCase,
    private userCacheService: UserCacheService
  ) {}

  ngOnInit(): void {
    this.loadCours();
    this.loadAnneesAcademiques();
    this.loadEnseignants();
  }

  loadEnseignants(): void {
    this.userCacheService.getTeachers().subscribe({
      next: (teachers) => {
        this.enseignants.set(teachers);
        // Convertir en format Enseignant pour la compatibilité
        const enseignantsFormatted = teachers.map(teacher => ({
          id: teacher.id.toString(), // Convert to string to match Enseignant type
          Utilisateur: {
            nom: teacher.nom,
            prenom: teacher.prenom,
            email: teacher.email
          }
        }));
        this.availableEnseignants.set(enseignantsFormatted);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignants:', error);
      }
    });
  }

  onAnneeChange(anneeId: string): void {
    if (anneeId) {
      this.loadSemestres(Number(anneeId));
    } else {
      this.semestres.set([]);
    }
  }

  loadCours(page: number = 1, search: string = ''): void {
    this.isLoading.set(true);
    this.coursService.getCours({ page, limit: 10, search }).subscribe({
      next: (response) => {
        console.log('📚 Cours chargés:', response);
        
        if ('pagination' in response) {
          // Réponse paginée
          this.cours.set(response['cours'] as Cours[]); // Cast to entity type
          this.pagination.set(response.pagination);
        } else {
          // Réponse simple (fallback)
          this.cours.set(response as Cours[]); // Cast to entity type
          this.pagination.set({
            currentPage: 1,
            totalPages: 1,
            totalItems: response.length,
            itemsPerPage: response.length,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
        
        this.applyStatusFilter();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours:', error);
        this.errorMessage.set('Erreur lors du chargement des cours');
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

  loadSemestres(anneeId: number): void {
    this.academicUseCase.getSemestresByAnnee(anneeId).subscribe({
      next: (semestres) => {
        this.semestres.set(semestres);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des semestres:', error);
      }
    });
  }

  applyStatusFilter(): void {
    let filtered = this.cours();

    // Filter by status
    if (this.filterStatus() === 'ACTIVE') {
      filtered = filtered.filter(c => !c.estArchive);
    } else if (this.filterStatus() === 'ARCHIVED') {
      filtered = filtered.filter(c => c.estArchive);
    }

    this.filteredCours.set(filtered);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.loadCours(1, input.value); // Recharger avec recherche
  }

  onFilterStatus(status: 'ALL' | 'ACTIVE' | 'ARCHIVED'): void {
    this.filterStatus.set(status);
    this.applyStatusFilter();
  }

  onPageChange(page: number): void {
    this.loadCours(page, this.searchQuery());
  }

  // Gestion de la sélection multiple d'enseignants
  onEnseignantToggle(enseignantId: string): void {
    const current = this.formData.enseignantIds;
    if (current.includes(enseignantId)) {
      this.formData.enseignantIds = current.filter(id => id !== enseignantId);
    } else {
      this.formData.enseignantIds = [...current, enseignantId];
    }
  }

  isEnseignantSelected(enseignantId: string): boolean {
    return this.formData.enseignantIds.includes(enseignantId);
  }

  getSelectedEnseignantsNames(): string {
    const selected = this.formData.enseignantIds;
    const enseignants = this.availableEnseignants();
    
    return selected
      .map(id => {
        const enseignant = enseignants.find(e => e.id === id);
        return enseignant ? `${enseignant.Utilisateur.prenom} ${enseignant.Utilisateur.nom}` : '';
      })
      .filter(name => name)
      .join(', ');
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
      semestre_id: '',
      enseignantIds: cours.Enseignants?.map(e => e.id.toString()) || [] // Convert to string
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
      semestre_id: '',
      enseignantIds: []
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
    const data = {
      code: this.formData.code,
      nom: this.formData.nom,
      description: this.formData.description,
      enseignantIds: this.formData.enseignantIds,
      estArchive: false
    };

    this.coursService.createCours(data).subscribe({
      next: () => {
        this.successMessage.set('Cours créé avec succès');
        this.closeModal();
        this.loadCours(this.pagination().currentPage, this.searchQuery());
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la création');
        this.isLoading.set(false);
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
      description: this.formData.description,
      enseignantIds: this.formData.enseignantIds
    };

    this.coursService.updateCours(cours.id.toString(), data).subscribe({
      next: () => {
        this.successMessage.set('Cours mis à jour avec succès');
        this.closeModal();
        this.loadCours(this.pagination().currentPage, this.searchQuery());
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
    });
  }

  deleteCours(): void {
    const cours = this.selectedCours();
    if (!cours) return;

    this.isLoading.set(true);
    this.coursService.deleteCours(cours.id.toString()).subscribe({
      next: () => {
        this.successMessage.set('Cours supprimé avec succès');
        this.closeModal();
        this.loadCours(this.pagination().currentPage, this.searchQuery());
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  toggleArchiveStatus(cours: Cours): void {
    this.coursService.updateCours(cours.id.toString(), {
      estArchive: !cours.estArchive
    }).subscribe({
      next: () => {
        this.successMessage.set(`Cours ${cours.estArchive ? 'désarchivé' : 'archivé'} avec succès`);
        this.loadCours(this.pagination().currentPage, this.searchQuery());
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la modification');
      }
    });
  }

  // Expose Array for template
  Array = Array;
}
