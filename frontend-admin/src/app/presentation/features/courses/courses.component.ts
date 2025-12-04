import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { TeacherUseCase } from '../../../core/usecases/teacher.usecase';
import { Cours, AnneeAcademique, Semestre } from '../../../core/domain/entities/academic.entity';
import { Teacher } from '../../../core/domain/entities/teacher.entity';

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
  enseignants = signal<any[]>([]);

  isLoading = signal(false);
  showModal = signal(false);

  selectedCours = signal<Cours | null>(null);

  searchQuery = signal('');
  filterStatus = signal<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  filterSemestre = signal<string>('ALL');

  formData = {
    code: '',
    nom: '',
    description: '',
    semestre_id: '',
    enseignant_id: ''
  };

  errorMessage = signal('');
  successMessage = signal('');

  // Computed statistics
  totalCours = computed(() => this.cours().length);
  coursActifs = computed(() => this.cours().filter(c => !c.estArchive).length);
  coursArchives = computed(() => this.cours().filter(c => c.estArchive).length);

  constructor(
    private academicUseCase: AcademicUseCase,
    private teacherUseCase: TeacherUseCase
  ) { }

  ngOnInit(): void {
    this.loadCours();
    this.loadAnneesAcademiques();
    this.loadEnseignants();
  }

  loadEnseignants(): void {
    this.teacherUseCase.getTeachers().subscribe({
      next: (enseignants) => {
        this.enseignants.set(enseignants);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignants:', error);
        this.errorMessage.set('Erreur lors du chargement des enseignants');
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

  loadCours(): void {
    this.isLoading.set(true);
    this.academicUseCase.getCours().subscribe({
      next: (cours) => {
        console.log('📚 Cours chargés:', cours);
        cours.forEach(c => {
          console.log(`Cours ${c.nom}:`, {
            id: c.id,
            code: c.code,
            enseignantId: c.enseignantId,
            enseignant: c.enseignant,
            objetComplet: c
          });
        });
        this.cours.set(cours);
        this.applyFilters();
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

  applyFilters(): void {
    let filtered = this.cours();

    // Filter by status
    if (this.filterStatus() === 'ACTIVE') {
      filtered = filtered.filter(c => !c.estArchive);
    } else if (this.filterStatus() === 'ARCHIVED') {
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
      semestre_id: '',
      enseignant_id: ''
    };
    this.showModal.set(true);
  }



  closeModal(): void {
    this.showModal.set(false);
    this.errorMessage.set('');
  }

  resetForm(): void {
    this.formData = {
      code: '',
      nom: '',
      description: '',
      semestre_id: '',
      enseignant_id: ''
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
    if (!this.formData.semestre_id || !this.formData.enseignant_id) {
      this.errorMessage.set('Le semestre et l\'enseignant sont requis');
      return;
    }

    this.isLoading.set(true);
    const data = {
      code: this.formData.code,
      nom: this.formData.nom,
      description: this.formData.description,
      semestre_id: this.formData.semestre_id,
      enseignant_id: this.formData.enseignant_id,
      estArchive: false
    };

    this.academicUseCase.createCours(data).subscribe({
      next: () => {
        this.successMessage.set('Cours créé avec succès');
        this.closeModal();
        this.loadCours();
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
      description: this.formData.description
    };

    this.academicUseCase.updateCours(cours.id, data).subscribe({
      next: () => {
        this.successMessage.set('Cours mis à jour avec succès');
        this.closeModal();
        this.loadCours();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
    });
  }



  toggleArchiveStatus(cours: Cours): void {
    this.academicUseCase.updateCours(cours.id, {
      estArchive: !cours.estArchive
    }).subscribe({
      next: () => {
        this.successMessage.set(`Cours ${cours.estArchive ? 'désarchivé' : 'archivé'} avec succès`);
        this.loadCours();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la modification');
      }
    });
  }
}
