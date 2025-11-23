import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from '../http/api.service';
import { BackendCours, BackendCoursRequest } from '../http/interfaces/backend.interfaces';
import { SimpleCourse } from '../../core/models/simplified.interfaces';
import { BackendMapper } from '../mappers/backend.mapper';

@Injectable({
  providedIn: 'root'
})
export class CourseRepository {
  private readonly baseUrl = '/academic/cours';

  constructor(private api: ApiService) {}

  findAll(): Observable<SimpleCourse[]> {
    return this.api.get<BackendCours[]>(this.baseUrl)
      .pipe(
        map(response => BackendMapper.toCourses(response))
      );
  }

  findById(id: string): Observable<SimpleCourse> {
    return this.api.get<BackendCours>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => BackendMapper.toCourse(response))
      );
  }

  findByTeacher(teacherId: string): Observable<SimpleCourse[]> {
    return this.api.get<BackendCours[]>(`${this.baseUrl}/teacher/${teacherId}`)
      .pipe(
        map(response => BackendMapper.toCourses(response))
      );
  }

  findByAcademicYear(academicYearId: string): Observable<SimpleCourse[]> {
    return this.api.get<BackendCours[]>(`${this.baseUrl}/academic-year/${academicYearId}`)
      .pipe(
        map(response => BackendMapper.toCourses(response))
      );
  }

  findBySemester(semesterId: string): Observable<SimpleCourse[]> {
    return this.api.get<BackendCours[]>(`${this.baseUrl}/semester/${semesterId}`)
      .pipe(
        map(response => BackendMapper.toCourses(response))
      );
  }

  create(data: Partial<SimpleCourse>): Observable<SimpleCourse> {
    const request: BackendCoursRequest = {
      code: data.code!,
      nom: data.name!,
      estArchive: data.isArchived || false,
      enseignantId: data.teacherId,
      anneeAcademiqueId: data.academicYearId!,
      semestreId: data.semesterId
    };

    return this.api.post<BackendCours>(this.baseUrl, request)
      .pipe(
        map(response => BackendMapper.toCourse(response))
      );
  }

  update(id: string, data: Partial<SimpleCourse>): Observable<SimpleCourse> {
    const request: Partial<BackendCoursRequest> = {};
    
    if (data.code) request.code = data.code;
    if (data.name) request.nom = data.name;
    if (data.isArchived !== undefined) request.estArchive = data.isArchived;
    if (data.teacherId) request.enseignantId = data.teacherId;
    if (data.academicYearId) request.anneeAcademiqueId = data.academicYearId;
    if (data.semesterId) request.semestreId = data.semesterId;

    return this.api.put<BackendCours>(`${this.baseUrl}/${id}`, request)
      .pipe(
        map(response => BackendMapper.toCourse(response))
      );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.baseUrl}/${id}`);
  }

  archive(id: string): Observable<SimpleCourse> {
    return this.update(id, { isArchived: true });
  }

  unarchive(id: string): Observable<SimpleCourse> {
    return this.update(id, { isArchived: false });
  }

  findActive(): Observable<SimpleCourse[]> {
    return this.findAll().pipe(
      map(courses => courses.filter(c => !c.isArchived))
    );
  }

  findArchived(): Observable<SimpleCourse[]> {
    return this.findAll().pipe(
      map(courses => courses.filter(c => c.isArchived))
    );
  }
}
