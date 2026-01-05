import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { UserUseCase } from '../../../core/usecases/user.usecase';
import { Cours, Classe, Semestre, AnneeAcademique } from '../../../core/domain/entities/academic.entity';
import { Enseignant } from '../../../core/domain/entities/user.entity';

interface Association {
  cours: Cours;
  enseignant?: {
    id: string | number;
    Utilisateur?: {
      nom: string;
      prenom: string;
      email: string;
    };
  };
  classes: Classe[];
  semestre?: Semestre;
  anneeAcademique?: AnneeAcademique;
}

@Component({
  selector: 'app-associations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './associations.component.html',
  styleUrls: ['./associations.component.scss']
})
export class AssociationsComponent implements OnInit {
  // Données
  cours = signal<Cours[]>([]);
  enseignants = signal<Enseignant[]>([]);
  classes = signal<Classe[]>([]);
  semestres = signal<Semestre[]>([]);
  anneesAcademiques = signal<AnneeAcademique[]>([]);
  associations = signal<Association[]>([]);

  // UI State
  isLoading = signal(false);
  showModal = signal(false);
  currentStep = signal(1);
  
  // Form Data
  formData = {
    coursId: '',
    enseignantId: '',
    selectedClasses: [] as string[],
    semestreId: '',
    anneeAcademiqueId: ''
  };

  errorMessage = signal('');
  successMessage = signal('');

  // Computed
  selectedCours = computed(() => {
    const id = this.formData.coursId;
    return this.cours().find(c => c.id.toString() === id);
  });

  selectedEnseignant = computed(() => {
    const id = this.formData.enseignantId;
    return this.enseignants().find(e => e.id.toString() === id);
  });

  selectedSemestre = computed(() => {
    const id = this.formData.semestreId;
    return this.semestres().find(s => s.id.toString() === id);
  });

  filteredSemestres = computed(() => {
    if (!this.formData.anneeAcademiqueId) {
      console.log('⚠️ Pas d\'année académique sélectionnée');
      return [];
    }
    
    // Afficher les détails des semestres pour déboguer
    console.log('🔍 Détails des semestres:', this.semestres().map(s => ({
      id: s.id,
      libelle: s.libelle,
      anneeAcademiqueId: s.anneeAcademiqueId,
      annee_academique_id: (s as any).annee_academique_id,
      AnneeAcademiqueId: (s as any).AnneeAcademiqueId,
      tousLesChamps: s
    })));
    
    const filtered = this.semestres().filter(s => {
      // Essayer différentes variantes du champ
      const semestreAnneeId = s.anneeAcademiqueId || 
                              (s as any).annee_academique_id || 
                              (s as any).AnneeAcademiqueId;
      return semestreAnneeId?.toString() === this.formData.anneeAcademiqueId.toString();
    });
    
    console.log('📅 Semestres filtrés:', {
      anneeId: this.formData.anneeAcademiqueId,
      totalSemestres: this.semestres().length,
      semestresFiltrés: filtered.length,
      semestres: filtered
    });
    return filtered;
  });

  constructor(
    private academicUseCase: AcademicUseCase,
    private userUseCase: UserUseCase
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadAssociations();
  }

  loadAssociations(): void {
    // Charger les cours avec leurs enseignants et classes
    this.academicUseCase.getCours().subscribe({
      next: (cours) => {
        // Ensure cours is always an array
        const coursArray = Array.isArray(cours) ? cours : [];
        const associations: Association[] = coursArray
          .filter(c => c.Enseignant) // Seulement les cours avec enseignant
          .map(c => ({
            cours: c,
            enseignant: c.Enseignant,
            classes: [], // Les classes seront chargées séparément si nécessaire
            semestre: c as any, // Le semestre est inclus dans le cours
            anneeAcademique: c as any // L'année académique est incluse dans le cours
          }));
        this.associations.set(associations);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des associations:', error);
        this.associations.set([]); // Set empty array on error
      }
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // Charger toutes les données nécessaires
    Promise.all([
      this.loadCours(),
      this.loadEnseignants(),
      this.loadClasses(),
      this.loadSemestres(),
      this.loadAnneesAcademiques()
    ]).then(() => {
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Erreur lors du chargement des données:', error);
      this.errorMessage.set('Erreur lors du chargement des données');
      this.isLoading.set(false);
    });
  }

  loadCours(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.academicUseCase.getCours().subscribe({
        next: (cours) => {
          // Ensure cours is always an array
          const coursArray = Array.isArray(cours) ? cours : [];
          this.cours.set(coursArray.filter(c => !c.estArchive));
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des cours:', error);
          this.cours.set([]); // Set empty array on error
          reject(error);
        }
      });
    });
  }

  loadEnseignants(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userUseCase.getAllUsers().subscribe({
        next: (users: any[]) => {
          const enseignants = users.filter(u => u.role === 'ENSEIGNANT') as Enseignant[];
          this.enseignants.set(enseignants.filter(e => e.estActif));
          resolve();
        },
        error: reject
      });
    });
  }

  loadClasses(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.academicUseCase.getAllClasses().subscribe({
        next: (classes) => {
          // Now we get the classes array directly
          this.classes.set(classes);
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des classes:', error);
          this.classes.set([]); // Set empty array on error
          reject(error);
        }
      });
    });
  }

  loadSemestres(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Charger tous les semestres de toutes les années
      this.academicUseCase.getAnneesAcademiques().subscribe({
        next: (annees) => {
          console.log('📚 Années académiques pour semestres:', annees);
          const promises = annees.map(annee => 
            new Promise<Semestre[]>((res) => {
              this.academicUseCase.getSemestresByAnnee(annee.id).subscribe({
                next: (semestres) => {
                  console.log(`📅 Semestres pour année ${annee.libelle}:`, semestres);
                  res(semestres);
                },
                error: (err) => {
                  console.error(`❌ Erreur chargement semestres pour ${annee.libelle}:`, err);
                  res([]);
                }
              });
            })
          );
          
          Promise.all(promises).then(results => {
            const allSemestres = results.flat();
            console.log('✅ Tous les semestres chargés:', allSemestres);
            this.semestres.set(allSemestres);
            resolve();
          });
        },
        error: reject
      });
    });
  }

  loadAnneesAcademiques(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.academicUseCase.getAnneesAcademiques().subscribe({
        next: (annees) => {
          this.anneesAcademiques.set(annees);
          resolve();
        },
        error: reject
      });
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.currentStep.set(1);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
    this.errorMessage.set('');
  }

  resetForm(): void {
    this.formData = {
      coursId: '',
      enseignantId: '',
      selectedClasses: [],
      semestreId: '',
      anneeAcademiqueId: ''
    };
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep.set(this.currentStep() + 1);
      this.errorMessage.set('');
    }
  }

  previousStep(): void {
    this.currentStep.set(this.currentStep() - 1);
    this.errorMessage.set('');
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep()) {
      case 1:
        if (!this.formData.anneeAcademiqueId) {
          this.errorMessage.set('Veuillez sélectionner une année académique');
          return false;
        }
        if (!this.formData.semestreId) {
          this.errorMessage.set('Veuillez sélectionner un semestre');
          return false;
        }
        return true;
      
      case 2:
        if (!this.formData.coursId) {
          this.errorMessage.set('Veuillez sélectionner un cours');
          return false;
        }
        return true;
      
      case 3:
        if (!this.formData.enseignantId) {
          this.errorMessage.set('Veuillez sélectionner un enseignant');
          return false;
        }
        return true;
      
      case 4:
        if (this.formData.selectedClasses.length === 0) {
          this.errorMessage.set('Veuillez sélectionner au moins une classe');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  }

  toggleClassSelection(classeId: string): void {
    const index = this.formData.selectedClasses.indexOf(classeId);
    if (index > -1) {
      this.formData.selectedClasses.splice(index, 1);
    } else {
      this.formData.selectedClasses.push(classeId);
    }
  }

  isClassSelected(classeId: string): boolean {
    return this.formData.selectedClasses.includes(classeId);
  }

  onSubmit(): void {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // D'abord, mettre à jour le cours avec l'enseignant et le semestre
    const coursData = {
      enseignant_id: this.formData.enseignantId,
      semestre_id: this.formData.semestreId,
      annee_academique_id: this.formData.anneeAcademiqueId
    };

    this.academicUseCase.updateCours(this.formData.coursId, coursData as any).subscribe({
      next: () => {
        // Ensuite, créer les associations pour chaque classe sélectionnée
        const promises = this.formData.selectedClasses.map(classeId => {
          return new Promise<void>((resolve, reject) => {
            this.academicUseCase.addCoursToClasse(
              classeId,
              this.formData.coursId
            ).subscribe({
              next: () => resolve(),
              error: reject
            });
          });
        });

        Promise.all(promises).then(() => {
          this.successMessage.set('Associations créées avec succès');
          this.closeModal();
          this.loadAssociations(); // Recharger la liste des associations
          setTimeout(() => this.successMessage.set(''), 3000);
          this.isLoading.set(false);
        }).catch(error => {
          console.error('Erreur lors de la création des associations:', error);
          this.errorMessage.set('Erreur lors de la création des associations');
          this.isLoading.set(false);
        });
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du cours:', error);
        this.errorMessage.set('Erreur lors de la mise à jour du cours');
        this.isLoading.set(false);
      }
    });
  }

  getClasseNom(classeId: string | number): string {
    const classe = this.classes().find(c => c.id.toString() === classeId.toString());
    return classe ? classe.nom : '';
  }

  getAnneeNom(anneeId: string | number): string {
    const annee = this.anneesAcademiques().find(a => a.id.toString() === anneeId.toString());
    return annee ? annee.libelle : '';
  }

  getSemestreLibelle(semestre: Semestre | any): string {
    return semestre?.libelle || semestre?.nom || '';
  }

  getCoursEnseignant(cours: Cours): string {
    const enseignant = (cours as any).Enseignant;
    if (enseignant?.Utilisateur) {
      return `${enseignant.Utilisateur.prenom} ${enseignant.Utilisateur.nom}`;
    }
    return 'Non assigné';
  }

  getCoursSemestre(cours: Cours): any {
    return (cours as any).Semestre;
  }

  getCoursAnneeAcademique(cours: Cours): any {
    return (cours as any).AnneeAcademique;
  }
}
