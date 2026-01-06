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
    return this.api.get<any>('/academic/annees-academiques').pipe(
      map((response: any) => {
        // Le backend peut renvoyer { success: true, data: [...] } ou directement un tableau
        let annees = response;
        
        if (response && response.data && Array.isArray(response.data)) {
          annees = response.data;
        } else if (response && response.anneesAcademiques && Array.isArray(response.anneesAcademiques)) {
          annees = response.anneesAcademiques;
        } else if (!Array.isArray(response)) {
          console.error('❌ Repository - La réponse des années académiques n\'est pas un tableau:', response);
          return [];
        }
        
        return Array.isArray(annees) ? annees : [];
      })
    );
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
    return this.api.post<any>('/academic/semestres', semestre).pipe(
      map((data: any) => this.mapSemestreFromBackend(data))
    );
  }

  getSemestresByAnnee(anneeId: string | number): Observable<Semestre[]> {
    return this.api.get<any>(`/academic/annees-academiques/${anneeId}/semestres`).pipe(
      map((response: any) => {
        // Le backend peut renvoyer { success: true, data: [...] } ou directement un tableau
        let semestres = response;
        
        if (response && response.data && Array.isArray(response.data)) {
          semestres = response.data;
        } else if (response && response.semestres && Array.isArray(response.semestres)) {
          semestres = response.semestres;
        } else if (!Array.isArray(response)) {
          console.error('❌ Repository - La réponse des semestres n\'est pas un tableau:', response);
          return [];
        }
        
        return Array.isArray(semestres) ? semestres.map(s => this.mapSemestreFromBackend(s)) : [];
      })
    );
  }

  getSemestre(id: string | number): Observable<Semestre> {
    return this.api.get<any>(`/academic/semestres/${id}`).pipe(
      map((data: any) => this.mapSemestreFromBackend(data))
    );
  }

  updateSemestre(id: string | number, semestre: Partial<Semestre>): Observable<Semestre> {
    return this.api.put<any>(`/academic/semestres/${id}`, semestre).pipe(
      map((data: any) => this.mapSemestreFromBackend(data))
    );
  }

  deleteSemestre(id: string | number): Observable<void> {
    return this.api.delete<void>(`/academic/semestres/${id}`);
  }

  // Cours
  createCours(cours: Partial<Cours>): Observable<Cours> {
    return this.api.post<Cours>('/academic/cours', cours);
  }

  getCours(): Observable<Cours[]> {
    return this.api.get<any>('/academic/cours').pipe(
      map((response: any) => {
        // Handle the paginated response structure
        if (response && response.cours && Array.isArray(response.cours)) {
          return response.cours;
        }
        // Fallback for direct array response
        if (Array.isArray(response)) {
          return response;
        }
        console.warn('Invalid cours response structure:', response);
        return [];
      })
    );
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

  getClasses(page: number = 1, limit: number = 10, search?: string): Observable<{classes: Classe[], pagination: any}> {
    let params = `?page=${page}&limit=${limit}`;
    if (search) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    
    return this.api.get<any>(`/academic/classes${params}`).pipe(
      map((response: any) => {
        // Ensure response has the expected structure
        if (!response || typeof response !== 'object') {
          console.warn('Invalid response structure from /academic/classes:', response);
          return { classes: [], pagination: {} };
        }
        
        // Handle case where classes might be undefined or not an array
        const classes = Array.isArray(response.classes) ? response.classes : [];
        
        return {
          classes: classes.map((c: any) => this.mapClasseFromBackend(c)),
          pagination: response.pagination || {}
        };
      })
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

  private mapSemestreFromBackend(data: any): Semestre {
    const mapped = {
      id: data.id,
      libelle: data.nom || data.libelle, // Backend uses 'nom', frontend expects 'libelle'
      numero: data.numero,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      anneeAcademiqueId: data.annee_academique_id,
      dateCreation: data.createdAt,
      dateModification: data.updatedAt
    };
    
    return mapped;
  }
}
