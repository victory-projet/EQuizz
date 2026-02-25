import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface School {
  id: string;
  nom: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  telephone?: string;
  email?: string;
  estActive?: boolean;
}

interface SchoolsResponse {
  count: number;
  rows: School[];
}

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private apiUrl = `${environment.apiUrl}/academic/ecoles`;

  constructor(private http: HttpClient) {}

  getAllSchools(): Observable<School[]> {
    return this.http.get<SchoolsResponse>(this.apiUrl).pipe(
      map(response => response.rows || [])
    );
  }

  getSchoolById(id: string): Observable<School> {
    return this.http.get<School>(`${this.apiUrl}/${id}`);
  }

  createSchool(school: Partial<School>): Observable<School> {
    return this.http.post<School>(this.apiUrl, school);
  }

  updateSchool(id: string, school: Partial<School>): Observable<School> {
    return this.http.put<School>(`${this.apiUrl}/${id}`, school);
  }

  deleteSchool(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActiveSchool(id: string): Observable<{ message: string; ecole: School }> {
    return this.http.patch<{ message: string; ecole: School }>(`${this.apiUrl}/${id}/toggle-active`, {});
  }
}
