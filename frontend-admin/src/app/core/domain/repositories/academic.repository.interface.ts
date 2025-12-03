// Repository Interface - Academic
import { Observable } from 'rxjs';
import { AnneeAcademique, Semestre, Cours, Classe, Ecole } from '../entities/academic.entity';

export abstract class AcademicRepositoryInterface {
  // Écoles
  abstract createEcole(ecole: Partial<Ecole>): Observable<Ecole>;
  abstract getEcoles(): Observable<Ecole[]>;
  abstract getEcole(id: string | number): Observable<Ecole>;
  abstract updateEcole(id: string | number, ecole: Partial<Ecole>): Observable<Ecole>;
  abstract deleteEcole(id: string | number): Observable<void>;

  // Années Académiques
  abstract createAnneeAcademique(annee: Partial<AnneeAcademique>): Observable<AnneeAcademique>;
  abstract getAnneesAcademiques(): Observable<AnneeAcademique[]>;
  abstract getAnneeAcademique(id: string | number): Observable<AnneeAcademique>;
  abstract updateAnneeAcademique(id: string | number, annee: Partial<AnneeAcademique>): Observable<AnneeAcademique>;
  abstract deleteAnneeAcademique(id: string | number): Observable<void>;

  // Semestres
  abstract createSemestre(semestre: Partial<Semestre>): Observable<Semestre>;
  abstract getSemestresByAnnee(anneeId: string | number): Observable<Semestre[]>;
  abstract getSemestre(id: string | number): Observable<Semestre>;
  abstract updateSemestre(id: string | number, semestre: Partial<Semestre>): Observable<Semestre>;
  abstract deleteSemestre(id: string | number): Observable<void>;

  // Cours
  abstract createCours(cours: Partial<Cours>): Observable<Cours>;
  abstract getCours(): Observable<Cours[]>;
  abstract getCoursById(id: string | number): Observable<Cours>;
  abstract updateCours(id: string | number, cours: Partial<Cours>): Observable<Cours>;
  abstract deleteCours(id: string | number): Observable<void>;

  // Classes
  abstract createClasse(classe: Partial<Classe>): Observable<Classe>;
  abstract getClasses(): Observable<Classe[]>;
  abstract getClasse(id: string | number): Observable<Classe>;
  abstract updateClasse(id: string | number, classe: Partial<Classe>): Observable<Classe>;
  abstract deleteClasse(id: string | number): Observable<void>;
  abstract addCoursToClasse(classeId: string | number, coursId: string | number): Observable<void>;
  abstract removeCoursFromClasse(classeId: string | number, coursId: string | number): Observable<void>;
  abstract addEtudiantToClasse(classeId: string | number, etudiantId: string | number): Observable<void>;
  abstract removeEtudiantFromClasse(classeId: string | number, etudiantId: string | number): Observable<void>;
}
