import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from '../http/api.service';
import { BackendClasse, BackendClasseRequest } from '../http/interfaces/backend.interfaces';
import { SimpleClass } from '../../core/models/simplified.interfaces';
import { BackendMapper } from '../mappers/backend.mapper';

@Injectable({
  providedIn: 'root'
})
export class ClassRepository {
  private readonly baseUrl = '/academic/classes';

  constructor(private api: ApiService) {}

  findAll(): Observable<SimpleClass[]> {
    return this.api.get<BackendClasse[]>(this.baseUrl)
      .pipe(
        map(response => BackendMapper.toClasses(response))
      );
  }

  findById(id: string): Observable<SimpleClass> {
    return this.api.get<BackendClasse>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => BackendMapper.toClass(response))
      );
  }

  findByAcademicYear(academicYearId: string): Observable<SimpleClass[]> {
    return this.api.get<BackendClasse[]>(`${this.baseUrl}/academic-year/${academicYearId}`)
      .pipe(
        map(response => BackendMapper.toClasses(response))
      );
  }

  create(data: Partial<SimpleClass>): Observable<SimpleClass> {
    const request: BackendClasseRequest = {
      nom: data.name!,
      niveau: data.level!,
      anneeAcademiqueId: data.academicYearId!,
      ecoleId: data.schoolId
    };

    return this.api.post<BackendClasse>(this.baseUrl, request)
      .pipe(
        map(response => BackendMapper.toClass(response))
      );
  }

  update(id: string, data: Partial<SimpleClass>): Observable<SimpleClass> {
    const request: Partial<BackendClasseRequest> = {};
    
    if (data.name) request.nom = data.name;
    if (data.level) request.niveau = data.level;
    if (data.academicYearId) request.anneeAcademiqueId = data.academicYearId;
    if (data.schoolId) request.ecoleId = data.schoolId;

    return this.api.put<BackendClasse>(`${this.baseUrl}/${id}`, request)
      .pipe(
        map(response => BackendMapper.toClass(response))
      );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.baseUrl}/${id}`);
  }

  addStudent(classId: string, studentId: string): Observable<SimpleClass> {
    return this.api.post<BackendClasse>(`${this.baseUrl}/${classId}/etudiants/${studentId}`, {})
      .pipe(
        map(response => BackendMapper.toClass(response))
      );
  }

  removeStudent(classId: string, studentId: string): Observable<SimpleClass> {
    return this.api.delete<BackendClasse>(`${this.baseUrl}/${classId}/etudiants/${studentId}`)
      .pipe(
        map(response => BackendMapper.toClass(response))
      );
  }

  addCourse(classId: string, courseId: string): Observable<SimpleClass> {
    return this.api.post<BackendClasse>(`${this.baseUrl}/${classId}/cours/${courseId}`, {})
      .pipe(
        map(response => BackendMapper.toClass(response))
      );
  }

  removeCourse(classId: string, courseId: string): Observable<SimpleClass> {
    return this.api.delete<BackendClasse>(`${this.baseUrl}/${classId}/cours/${courseId}`)
      .pipe(
        map(response => BackendMapper.toClass(response))
      );
  }
}
