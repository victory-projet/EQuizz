// Infrastructure - Teacher Repository Implementation
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeacherRepositoryInterface } from '../../core/domain/repositories/teacher.repository.interface';
import { Teacher } from '../../core/domain/entities/teacher.entity';
import { ApiService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherRepository implements TeacherRepositoryInterface {
  constructor(private api: ApiService) {}

  getTeachers(): Observable<Teacher[]> {
    return this.api.get<any[]>('/academic/enseignants').pipe(
      map((teachers: any[]) => teachers.map(t => this.mapTeacherFromBackend(t)))
    );
  }

  getTeacher(id: string | number): Observable<Teacher> {
    return this.api.get<any>(`/academic/enseignants/${id}`).pipe(
      map((data: any) => this.mapTeacherFromBackend(data))
    );
  }

  createTeacher(teacher: Partial<Teacher>): Observable<Teacher> {
    return this.api.post<any>('/academic/enseignants', teacher).pipe(
      map((data: any) => this.mapTeacherFromBackend(data))
    );
  }

  updateTeacher(id: string | number, teacher: Partial<Teacher>): Observable<Teacher> {
    return this.api.put<any>(`/academic/enseignants/${id}`, teacher).pipe(
      map((data: any) => this.mapTeacherFromBackend(data))
    );
  }

  deleteTeacher(id: string | number): Observable<void> {
    return this.api.delete<void>(`/academic/enseignants/${id}`);
  }

  private mapTeacherFromBackend(data: any): Teacher {
    return {
      id: data.id,
      specialite: data.specialite,
      utilisateurId: data.id,
      nom: data.Utilisateur?.nom || data.nom,
      prenom: data.Utilisateur?.prenom || data.prenom,
      email: data.Utilisateur?.email || data.email,
      estActif: data.Utilisateur?.estActif ?? data.estActif,
      dateCreation: data.createdAt,
      dateModification: data.updatedAt
    };
  }
}
