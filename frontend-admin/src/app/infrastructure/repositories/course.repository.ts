// src/app/core/infrastructure/repositories/course.repository.ts
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, map } from 'rxjs';
import { Course, Teacher } from '../../core/domain/entities/course.entity';
import { ICourseRepository, ITeacherRepository } from '../../core/domain/repositories/course.repository.interface';
import { ApiService } from '../http/api.service';
import { AcademicMapper } from '../mappers/academic.mapper';
import { BackendCours } from '../http/interfaces/backend.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CourseRepository implements ICourseRepository {
  private apiService = inject(ApiService);

  getAll(): Observable<Course[]> {
    return this.apiService.get<BackendCours[]>('/academic/cours').pipe(
      map(backendCours => backendCours.map(c => AcademicMapper.toCourse(c)))
    );
  }

  getById(id: string): Observable<Course> {
    return this.apiService.get<BackendCours>(`/academic/cours/${id}`).pipe(
      map(backendCours => AcademicMapper.toCourse(backendCours))
    );
  }

  getByAcademicYear(yearId: string): Observable<Course[]> {
    return this.getAll().pipe(
      map(courses => courses.filter(c => c.academicYearId === yearId))
    );
  }

  getBySemester(semesterId: string): Observable<Course[]> {
    return this.getAll().pipe(
      map(courses => courses.filter(c => c.semesterId === semesterId))
    );
  }

  getByTeacher(teacherId: string): Observable<Course[]> {
    return this.getAll().pipe(
      map(courses => courses.filter(c => c.teacherId === teacherId))
    );
  }

  create(course: Course): Observable<Course> {
    const request = AcademicMapper.toBackendCoursRequest(course);
    
    return this.apiService.post<BackendCours>('/academic/cours', request).pipe(
      map(backendCours => AcademicMapper.toCourse(backendCours))
    );
  }

  update(id: string, updates: Partial<Course>): Observable<Course> {
    // Créer un objet temporaire pour la conversion
    const tempCourse = new Course(
      id,
      updates.code || '',
      updates.name || '',
      updates.description || '',
      updates.teacherId || '',
      updates.academicYearId || '',
      updates.semesterId || '',
      updates.createdAt || new Date()
    );
    
    const request = AcademicMapper.toBackendCoursRequest(tempCourse);
    
    return this.apiService.put<BackendCours>(`/academic/cours/${id}`, request).pipe(
      map(backendCours => AcademicMapper.toCourse(backendCours))
    );
  }

  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`/academic/cours/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TeacherRepository implements ITeacherRepository {
  private apiService = inject(ApiService);

  getAll(): Observable<Teacher[]> {
    // TODO: Endpoint GET /api/teachers non disponible dans le backend
    return throwError(() => new Error('Endpoint GET /api/teachers non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  getById(id: string): Observable<Teacher> {
    // TODO: Endpoint GET /api/teachers/:id non disponible dans le backend
    return throwError(() => new Error('Endpoint GET /api/teachers/:id non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  getByDepartment(department: string): Observable<Teacher[]> {
    // TODO: Endpoint GET /api/teachers?department=... non disponible dans le backend
    return throwError(() => new Error('Endpoint GET /api/teachers?department=... non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  create(teacher: Teacher): Observable<Teacher> {
    // TODO: Endpoint POST /api/teachers non disponible dans le backend
    return throwError(() => new Error('Endpoint POST /api/teachers non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  update(id: string, updates: Partial<Teacher>): Observable<Teacher> {
    // TODO: Endpoint PUT /api/teachers/:id non disponible dans le backend
    return throwError(() => new Error('Endpoint PUT /api/teachers/:id non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  delete(id: string): Observable<void> {
    // TODO: Endpoint DELETE /api/teachers/:id non disponible dans le backend
    return throwError(() => new Error('Endpoint DELETE /api/teachers/:id non disponible. Fonctionnalité à implémenter dans le backend.'));
  }
}
