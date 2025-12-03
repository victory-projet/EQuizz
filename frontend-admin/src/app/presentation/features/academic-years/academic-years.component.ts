import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { AnneeAcademique, Semestre } from '../../../core/domain/entities/academic.entity';

@Component({
  selector: 'app-academic-years',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './academic-years.component.html',
  styleUrls: ['./academic-years.component.scss']
})
export class AcademicYearsComponent implements OnInit {
  anneesAcademiques = signal<AnneeAcademique[]>([]);
  semestres = signal<Map<string, Semestre[]>>(new Map());
  isLoading = signal(false);
  showYearModal = signal(false);
  showSemestreModal = signal(false);
  showDeleteModal = signal(false);
  selectedAnnee = signal<AnneeAcademique | null>(null);
  selectedSemestre = signal<Semestre | null>(null);

  yearFormData = {
    libelle: '',
    dateDebut: '',
    dateFin: '',
    estCourante: false
  };

  semestreFormData: {
    libelle: string;
    numero: number;
    dateDebut: string;
    dateFin: string;
    anneeAcademiqueId: string | number;
  } = {
    libelle: '',
    numero: 1,
    dateDebut: '',
    dateFin: '',
    anneeAcademiqueId: ''
  };

  errorMessage = signal('');
  successMessage = signal('');

  constructor(private academicUseCase: AcademicUseCase) {}

  ngOnInit(): void {
    this.loadAnneesAcademiques();
  }

  loadAnneesAcademiques(): void {
    this.isLoading.set(true);
    this.academicUseCase.getAnneesAcademiques().subscribe({
      next: (annees) => {
        this.anneesAcademiques.set(annees);
        // Charger les semestres pour chaque année
        annees.forEach(annee => this.loadSemestres(annee.id));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des années académiques:', error);
        this.errorMessage.set('Erreur lors du chargement des années académiques');
        this.isLoading.set(false);
      }
    });
  }

  loadSemestres(anneeId: string | number): void {
    this.academicUseCase.getSemestresByAnnee(anneeId).subscribe({
      next: (semestres) => {
        const currentMap = new Map(this.semestres());
        currentMap.set(anneeId.toString(), semestres);
        this.semestres.set(currentMap);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des semestres:', error);
      }
    });
  }

  getSemestresForAnnee(anneeId: string | number): Semestre[] {
    return this.semestres().get(anneeId.toString()) || [];
  }

  openCreateYearModal(): void {
    this.selectedAnnee.set(null);
    this.resetYearForm();
    this.showYearModal.set(true);
  }

  openEditYearModal(annee: AnneeAcademique): void {
    this.selectedAnnee.set(annee);
    this.yearFormData = {
      libelle: annee.libelle,
      dateDebut: annee.dateDebut.toString().split('T')[0],
      dateFin: annee.dateFin.toString().split('T')[0],
      estCourante: annee.estCourante
    };
    this.showYearModal.set(true);
  }

  openCreateSemestreModal(annee: AnneeAcademique): void {
    this.selectedAnnee.set(annee);
    this.selectedSemestre.set(null);
    this.resetSemestreForm();
    this.semestreFormData.anneeAcademiqueId = annee.id;
    this.showSemestreModal.set(true);
  }

  openEditSemestreModal(annee: AnneeAcademique, semestre: Semestre): void {
    this.selectedAnnee.set(annee);
    this.selectedSemestre.set(semestre);
    this.semestreFormData = {
      libelle: semestre.libelle,
      numero: semestre.numero,
      dateDebut: semestre.dateDebut.toString().split('T')[0],
      dateFin: semestre.dateFin.toString().split('T')[0],
      anneeAcademiqueId: annee.id
    };
    this.showSemestreModal.set(true);
  }

  openDeleteModal(annee: AnneeAcademique): void {
    this.selectedAnnee.set(annee);
    this.showDeleteModal.set(true);
  }

  closeModal(): void {
    this.showYearModal.set(false);
    this.showSemestreModal.set(false);
    this.showDeleteModal.set(false);
    this.errorMessage.set('');
  }

  resetYearForm(): void {
    this.yearFormData = {
      libelle: '',
      dateDebut: '',
      dateFin: '',
      estCourante: false
    };
  }

  resetSemestreForm(): void {
    this.semestreFormData = {
      libelle: '',
      numero: 1,
      dateDebut: '',
      dateFin: '',
      anneeAcademiqueId: 0
    };
  }

  onSubmitYear(): void {
    this.errorMessage.set('');
    
    if (this.selectedAnnee()) {
      this.updateYear();
    } else {
      this.createYear();
    }
  }

  createYear(): void {
    this.isLoading.set(true);
    const data = {
      ...this.yearFormData,
      dateDebut: new Date(this.yearFormData.dateDebut),
      dateFin: new Date(this.yearFormData.dateFin)
    };
    this.academicUseCase.createAnneeAcademique(data).subscribe({
      next: () => {
        this.successMessage.set('Année académique créée avec succès');
        this.closeModal();
        this.loadAnneesAcademiques();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la création');
        this.isLoading.set(false);
      }
    });
  }

  updateYear(): void {
    const annee = this.selectedAnnee();
    if (!annee) return;

    this.isLoading.set(true);
    const data = {
      ...this.yearFormData,
      dateDebut: new Date(this.yearFormData.dateDebut),
      dateFin: new Date(this.yearFormData.dateFin)
    };
    this.academicUseCase.updateAnneeAcademique(annee.id, data).subscribe({
      next: () => {
        this.successMessage.set('Année académique mise à jour avec succès');
        this.closeModal();
        this.loadAnneesAcademiques();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
    });
  }

  deleteYear(): void {
    const annee = this.selectedAnnee();
    if (!annee) return;

    this.isLoading.set(true);
    this.academicUseCase.deleteAnneeAcademique(annee.id).subscribe({
      next: () => {
        this.successMessage.set('Année académique supprimée avec succès');
        this.closeModal();
        this.loadAnneesAcademiques();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  onSubmitSemestre(): void {
    this.errorMessage.set('');
    
    if (this.selectedSemestre()) {
      this.updateSemestre();
    } else {
      this.createSemestre();
    }
  }

  createSemestre(): void {
    this.isLoading.set(true);
    const data = {
      ...this.semestreFormData,
      dateDebut: new Date(this.semestreFormData.dateDebut),
      dateFin: new Date(this.semestreFormData.dateFin)
    };
    this.academicUseCase.createSemestre(data).subscribe({
      next: () => {
        this.successMessage.set('Semestre créé avec succès');
        this.closeModal();
        const annee = this.selectedAnnee();
        if (annee) {
          this.loadSemestres(annee.id);
        }
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la création');
        this.isLoading.set(false);
      }
    });
  }

  updateSemestre(): void {
    const semestre = this.selectedSemestre();
    if (!semestre) return;

    this.isLoading.set(true);
    const data = {
      ...this.semestreFormData,
      dateDebut: new Date(this.semestreFormData.dateDebut),
      dateFin: new Date(this.semestreFormData.dateFin)
    };
    this.academicUseCase.updateSemestre(semestre.id, data).subscribe({
      next: () => {
        this.successMessage.set('Semestre mis à jour avec succès');
        this.closeModal();
        const annee = this.selectedAnnee();
        if (annee) {
          this.loadSemestres(annee.id);
        }
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
    });
  }

  deleteSemestre(semestre: Semestre): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le ${semestre.libelle} ?`)) {
      return;
    }

    this.academicUseCase.deleteSemestre(semestre.id).subscribe({
      next: () => {
        this.successMessage.set('Semestre supprimé avec succès');
        const annee = this.selectedAnnee();
        if (annee) {
          this.loadSemestres(annee.id);
        }
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
      }
    });
  }

  toggleYearStatus(annee: AnneeAcademique): void {
    this.academicUseCase.updateAnneeAcademique(annee.id, {
      estCourante: !annee.estCourante
    }).subscribe({
      next: () => {
        this.successMessage.set(`Année ${annee.estCourante ? 'désactivée' : 'activée'} avec succès`);
        this.loadAnneesAcademiques();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la modification');
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
