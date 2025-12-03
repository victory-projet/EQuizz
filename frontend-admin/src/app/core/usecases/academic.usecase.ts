// Use Case - Academic
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AcademicRepositoryInterface } from '../domain/repositories/academic.repository.interface';
import { AnneeAcademique, Semestre, Cours, Classe, Ecole } from '../domain/entities/academic.entity';

@Injectable({
  providedIn: 'root'
})
export class AcademicUseCase {
  constructor(private academicRepository: AcademicRepositoryInterface) {}

  // Écoles
  createEcole(ecole: Partial<Ecole>): Observable<Ecole> {
    return this.academicRepository.createEcole(ecole);
  }

  getEcoles(): Observable<Ecole[]> {
    return this.academicRepository.getEcoles();
  }

  getEcole(id: string | number): Observable<Ecole> {
    return this.academicRepository.getEcole(id);
  }

  updateEcole(id: string | number, ecole: Partial<Ecole>): Observable<Ecole> {
    return this.academicRepository.updateEcole(id, ecole);
  }

  deleteEcole(id: string | number): Observable<void> {
    return this.academicRepository.deleteEcole(id);
  }

  // Années Académiques
  createAnneeAcademique(annee: Partial<AnneeAcademique>): Observable<AnneeAcademique> {
    return this.academicRepository.createAnneeAcademique(annee);
  }

  getAnneesAcademiques(): Observable<AnneeAcademique[]> {
    return this.academicRepository.getAnneesAcademiques();
  }

  getAnneeAcademique(id: string | number): Observable<AnneeAcademique> {
    return this.academicRepository.getAnneeAcademique(id);
  }

  updateAnneeAcademique(id: string | number, annee: Partial<AnneeAcademique>): Observable<AnneeAcademique> {
    return this.academicRepository.updateAnneeAcademique(id, annee);
  }

  deleteAnneeAcademique(id: string | number): Observable<void> {
    return this.academicRepository.deleteAnneeAcademique(id);
  }

  // Semestres
  createSemestre(semestre: Partial<Semestre>): Observable<Semestre> {
    return this.academicRepository.createSemestre(semestre);
  }

  getSemestresByAnnee(anneeId: string | number): Observable<Semestre[]> {
    return this.academicRepository.getSemestresByAnnee(anneeId);
  }

  getSemestre(id: string | number): Observable<Semestre> {
    return this.academicRepository.getSemestre(id);
  }

  updateSemestre(id: string | number, semestre: Partial<Semestre>): Observable<Semestre> {
    return this.academicRepository.updateSemestre(id, semestre);
  }

  deleteSemestre(id: string | number): Observable<void> {
    return this.academicRepository.deleteSemestre(id);
  }

  // Cours
  createCours(cours: Partial<Cours>): Observable<Cours> {
    return this.academicRepository.createCours(cours);
  }

  getCours(): Observable<Cours[]> {
    return this.academicRepository.getCours();
  }

  getCoursById(id: string | number): Observable<Cours> {
    return this.academicRepository.getCoursById(id);
  }

  updateCours(id: string | number, cours: Partial<Cours>): Observable<Cours> {
    return this.academicRepository.updateCours(id, cours);
  }

  deleteCours(id: string | number): Observable<void> {
    return this.academicRepository.deleteCours(id);
  }

  // Classes
  createClasse(classe: Partial<Classe>): Observable<Classe> {
    return this.academicRepository.createClasse(classe);
  }

  getClasses(): Observable<Classe[]> {
    return this.academicRepository.getClasses();
  }

  getClasse(id: string | number): Observable<Classe> {
    return this.academicRepository.getClasse(id);
  }

  updateClasse(id: string | number, classe: Partial<Classe>): Observable<Classe> {
    return this.academicRepository.updateClasse(id, classe);
  }

  deleteClasse(id: string | number): Observable<void> {
    return this.academicRepository.deleteClasse(id);
  }

  addCoursToClasse(classeId: string | number, coursId: string | number): Observable<void> {
    return this.academicRepository.addCoursToClasse(classeId, coursId);
  }

  removeCoursFromClasse(classeId: string | number, coursId: string | number): Observable<void> {
    return this.academicRepository.removeCoursFromClasse(classeId, coursId);
  }

  addEtudiantToClasse(classeId: string | number, etudiantId: string | number): Observable<void> {
    return this.academicRepository.addEtudiantToClasse(classeId, etudiantId);
  }

  removeEtudiantFromClasse(classeId: string | number, etudiantId: string | number): Observable<void> {
    return this.academicRepository.removeEtudiantFromClasse(classeId, etudiantId);
  }
}
