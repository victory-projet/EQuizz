// src/app/core/infrastructure/repositories/class.repository.ts
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, map } from 'rxjs';
import { Class, Student } from '../../core/domain/entities/class.entity';
import { IClassRepository, IStudentRepository } from '../../core/domain/repositories/class.repository.interface';
import { ApiService } from '../http/api.service';
import { AcademicMapper } from '../mappers/academic.mapper';
import { BackendClasse } from '../http/interfaces/backend.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClassRepository implements IClassRepository {
  private apiService = inject(ApiService);

  getAll(): Observable<Class[]> {
    return this.apiService.get<BackendClasse[]>('/academic/classes').pipe(
      map(backendClasses => backendClasses.map(c => AcademicMapper.toClass(c)))
    );
  }

  getById(id: string): Observable<Class> {
    return this.apiService.get<BackendClasse>(`/academic/classes/${id}`).pipe(
      map(backendClass => AcademicMapper.toClass(backendClass))
    );
  }

  getByAcademicYear(yearId: string): Observable<Class[]> {
    return this.getAll().pipe(
      map(classes => classes.filter(c => c.academicYearId === yearId))
    );
  }

  create(classEntity: Class): Observable<Class> {
    const request = AcademicMapper.toBackendClasseRequest(classEntity);
    
    return this.apiService.post<BackendClasse>('/academic/classes', request).pipe(
      map(backendClass => AcademicMapper.toClass(backendClass))
    );
  }

  update(id: string, updates: Partial<Class>): Observable<Class> {
    // Créer un objet temporaire pour la conversion
    const tempClass = new Class(
      id,
      updates.name || '',
      updates.level || '',
      updates.academicYearId || '',
      updates.studentIds || [],
      updates.courseIds || [],
      updates.createdAt || new Date()
    );
    
    const request = AcademicMapper.toBackendClasseRequest(tempClass);
    
    return this.apiService.put<BackendClasse>(`/academic/classes/${id}`, request).pipe(
      map(backendClass => AcademicMapper.toClass(backendClass))
    );
  }

  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`/academic/classes/${id}`);
  }

  addStudent(classId: string, studentId: string): Observable<void> {
    // TODO: Endpoint pour ajouter un étudiant à une classe
    // Peut-être via PUT /academic/classes/:id avec la liste des étudiants
    return throwError(() => new Error('Fonctionnalité non implémentée'));
  }

  removeStudent(classId: string, studentId: string): Observable<void> {
    // TODO: Endpoint pour retirer un étudiant d'une classe
    return throwError(() => new Error('Fonctionnalité non implémentée'));
  }

  getStudents(classId: string): Observable<Student[]> {
    // TODO: Endpoint GET /api/classes/:id/students non disponible
    // Pour l'instant, retourner un tableau vide
    return throwError(() => new Error('Endpoint GET /api/classes/:id/students non disponible'));
  }
}

@Injectable({
  providedIn: 'root'
})
export class StudentRepository implements IStudentRepository {
  private apiService = inject(ApiService);

  getAll(): Observable<Student[]> {
    // TODO: Endpoint GET /api/students non disponible dans le backend
    return throwError(() => new Error('Endpoint GET /api/students non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  getById(id: string): Observable<Student> {
    // TODO: Endpoint GET /api/students/:id non disponible dans le backend
    return throwError(() => new Error('Endpoint GET /api/students/:id non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  getByClass(classId: string): Observable<Student[]> {
    // TODO: Endpoint GET /api/classes/:id/students non disponible dans le backend
    return throwError(() => new Error('Endpoint GET /api/classes/:id/students non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  create(student: Student): Observable<Student> {
    // TODO: Endpoint POST /api/students non disponible dans le backend
    return throwError(() => new Error('Endpoint POST /api/students non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  update(id: string, updates: Partial<Student>): Observable<Student> {
    // TODO: Endpoint PUT /api/students/:id non disponible dans le backend
    return throwError(() => new Error('Endpoint PUT /api/students/:id non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  delete(id: string): Observable<void> {
    // TODO: Endpoint DELETE /api/students/:id non disponible dans le backend
    return throwError(() => new Error('Endpoint DELETE /api/students/:id non disponible. Fonctionnalité à implémenter dans le backend.'));
  }
}
