import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AcademicYear, Subject } from '../models/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class AcademicService {
  private http = inject(HttpClient);
  private apiUrl = '/api';

  getAcademicYears(): Observable<AcademicYear[]> {
    return this.http.get<AcademicYear[]>(`${this.apiUrl}/academic-years`);
  }

  getAcademicYearById(id: string): Observable<AcademicYear> {
    return this.http.get<AcademicYear>(`${this.apiUrl}/academic-years/${id}`);
  }

  createAcademicYear(year: Partial<AcademicYear>): Observable<AcademicYear> {
    return this.http.post<AcademicYear>(`${this.apiUrl}/academic-years`, year);
  }

  updateAcademicYear(id: string, year: Partial<AcademicYear>): Observable<AcademicYear> {
    return this.http.put<AcademicYear>(`${this.apiUrl}/academic-years/${id}`, year);
  }

  deleteAcademicYear(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/academic-years/${id}`);
  }

  getSubjects(academicYearId?: string): Observable<Subject[]> {
    const url = academicYearId 
      ? `${this.apiUrl}/subjects?academicYearId=${academicYearId}`
      : `${this.apiUrl}/subjects`;
    return this.http.get<Subject[]>(url);
  }

  getSubjectById(id: string): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/subjects/${id}`);
  }

  createSubject(subject: Partial<Subject>): Observable<Subject> {
    return this.http.post<Subject>(`${this.apiUrl}/subjects`, subject);
  }

  updateSubject(id: string, subject: Partial<Subject>): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/subjects/${id}`, subject);
  }

  deleteSubject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subjects/${id}`);
  }
}
