// Infrastructure - Academic Repository Implementation
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AcademicRepositoryInterface } from '../../core/domain/repositories/academic.repository.interface';
import { AnneeAcademique, Semestre, Cours, Classe, Ecole } from '../../core/domain/entities/academic.entity';
import { ApiService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class AcademicRepository implements AcademicRepositoryInterface {
  constructor(private api: ApiService) {}

  // Écoles
  createEcole(ecole: Partial<Ecole>): Observable<Ecole> {
    return this.api.post<Ecole>('/academic/ecoles', ecole);
  }

  getEcoles(): Observable<Ecole[]> {
    return this.api.get<Ecole[]>('/academic/ecoles');
  }

  getEcole(id: string | number): Observable<Ecole> {
    return this.api.get<Ecole>(`/academic/ecoles/${id}`);
  }

  updateEcole(id: string | number, ecole: Partial<Ecole>): Observable<Ecole> {
    return this.api.put<Ecole>(`/academic/ecoles/${id}`, ecole);
  }

  deleteEcole(id: string | number): Observable<void> {
    return this.api.delete<void>(`/academic/ecoles/${id}`);
  }

  // Années Académiques
  createAnneeAcademique(annee: Partial<AnneeAcademique>): Observable<AnneeAcademique> {
    return this.api.post<AnneeAcademique>('/academic/annees-academiques', annee);
  }

  getAnneesAcademiques(): Observable<AnneeAcademique[]> {
    return this.api.get<AnneeAcademique[]>('/academic/annees-academiques');
  }

  getAnneeAcademique(id: string | number): Observable<AnneeAcademique> {
    return this.api.get<AnneeAcademique>(`/academic/annees-academiques/${id}`);
  }

  updateAnneeAcademique(id: string | number, annee: Partial<AnneeAcademique>): Observable<AnneeAcademique> {
    return this.api.put<AnneeAcademique>(`/academic/annees-academiques/${id}`, annee);
  }

  deleteAnneeAcademique(id: string | number): Observable<void> {
    return this.api.delete<void>(`/academic/annees-academiques/${id}`);
  }

  // Semestres
  createSemestre(semestre: Partial<Semestre>): Observable<Semestre> {
    return this.api.post<Semestre>('/academic/semestres', semestre);
  }

  getSemestresByAnnee(anneeId: string | number): Observable<Semestre[]> {
    return this.api.get<Semestre[]>(`/academic/annees-academiques/${anneeId}/semestres`);
  }

  getSemestre(id: string | number): Observable<Semestre> {
    return this.api.get<Semestre>(`/academic/semestres/${id}`);
  }

  updateSemestre(id: string | number, semestre: Partial<Semestre>): Observable<Semestre> {
    return this.api.put<Semestre>(`/academic/semestres/${id}`, semestre);
  }

  deleteSemestre(id: string | number): Observable<void> {
    return this.api.delete<void>(`/academic/semestres/${id}`);
  }

  // Cours
  createCours(cours: Partial<Cours>): Observable<Cours> {
    return this.api.post<Cours>('/academic/cours', cours);
  }

  getCours(): Observable<Cours[]> {
    return this.api.get<Cours[]>('/academic/cours');
  }

  getCoursById(id: string | number): Observable<Cours> {
    return this.api.get<Cours>(`/academic/cours/${id}`);
  }

  updateCours(id: string | number, cours: Partial<Cours>): Observable<Cours> {
    return this.api.put<Cours>(`/academic/cours/${id}`, cours);
  }

  deleteCours(id: string | number): Observable<void> {
    return this.api.delete<void>(`/academic/cours/${id}`);
  }

  // Classes
  createClasse(classe: Partial<Classe>): Observable<Classe> {
    return this.api.post<any>('/academic/classes', classe).pipe(
      map((data: any) => this.mapClasseFromBackend(data))
    );
  }

  getClasses(): Observable<Classe[]> {
    return this.api.get<any[]>('/academic/classes').pipe(
      map((classes: any[]) => classes.map(c => this.mapClasseFromBackend(c)))
    );
  }

  getClasse(id: string | number): Observable<Classe> {
    return this.api.get<any>(`/academic/classes/${id}`).pipe(
      map((data: any) => this.mapClasseFromBackend(data))
    );
  }

  updateClasse(id: string | number, classe: Partial<Classe>): Observable<Classe> {
    return this.api.put<any>(`/academic/classes/${id}`, classe).pipe(
      map((data: any) => this.mapClasseFromBackend(data))
    );
  }

  deleteClasse(id: string | number): Observable<void> {
    return this.api.delete<void>(`/academic/classes/${id}`);
  }

  addCoursToClasse(classeId: string | number, coursId: string | number): Observable<void> {
    return this.api.post<void>(`/academic/classes/${classeId}/cours/${coursId}`, {});
  }

  removeCoursFromClasse(classeId: string | number, coursId: string | number): Observable<void> {
    return this.api.delete<void>(`/academic/classes/${classeId}/cours/${coursId}`);
  }

  addEtudiantToClasse(classeId: string | number, etudiantId: string | number): Observable<void> {
    return this.api.post<void>(`/academic/classes/${classeId}/etudiants/${etudiantId}`, {});
  }

  removeEtudiantFromClasse(classeId: string | number, etudiantId: string | number): Observable<void> {
    return this.api.delete<void>(`/academic/classes/${classeId}/etudiants/${etudiantId}`);
  }

  private mapClasseFromBackend(data: any): Classe {
    // Gérer le cas où anneeAcademiqueId est null (typeof null === 'object')
    const anneeId = (data.anneeAcademiqueId !== null && data.anneeAcademiqueId !== undefined) 
      ? data.anneeAcademiqueId 
      : data.annee_academique_id;
    
    const mapped = {
      id: data.id,
      nom: data.nom,
      niveau: data.niveau,
      anneeAcademiqueId: anneeId,
      anneeAcademique: data.AnneeAcademique ? {
        id: data.AnneeAcademique.id,
        libelle: data.AnneeAcademique.libelle,
        dateDebut: data.AnneeAcademique.dateDebut || data.AnneeAcademique.date_debut,
        dateFin: data.AnneeAcademique.dateFin || data.AnneeAcademique.date_fin,
        estCourante: data.AnneeAcademique.estCourante || data.AnneeAcademique.est_courante,
        dateCreation: data.AnneeAcademique.createdAt,
        dateModification: data.AnneeAcademique.updatedAt
      } : undefined,
      cours: data.Cours || [],
      etudiants: data.Etudiants || [],
      dateCreation: data.createdAt,
      dateModification: data.updatedAt
    };
    
    return mapped;
  }
}
