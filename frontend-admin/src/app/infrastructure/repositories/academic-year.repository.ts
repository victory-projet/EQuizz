import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from '../http/api.service';
import { BackendAnneeAcademique, BackendAnneeAcademiqueRequest } from '../http/interfaces/backend.interfaces';
import { SimpleAcademicYear } from '../../core/models/simplified.interfaces';
import { BackendMapper } from '../mappers/backend.mapper';

@Injectable({
  providedIn: 'root'
})
export class AcademicYearRepository {
  private readonly baseUrl = '/academic/annees-academiques';

  constructor(private api: ApiService) {}

  findAll(): Observable<SimpleAcademicYear[]> {
    return this.api.get<BackendAnneeAcademique[]>(this.baseUrl)
      .pipe(
        map(response => BackendMapper.toAcademicYears(response))
      );
  }

  findById(id: string): Observable<SimpleAcademicYear> {
    return this.api.get<BackendAnneeAcademique>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => BackendMapper.toAcademicYear(response))
      );
  }

  create(data: Partial<SimpleAcademicYear>): Observable<SimpleAcademicYear> {
    const request: BackendAnneeAcademiqueRequest = {
      libelle: data.label!,
      dateDebut: data.startDate!.toISOString().split('T')[0],
      dateFin: data.endDate!.toISOString().split('T')[0],
      estCourante: data.isCurrent || false
    };

    return this.api.post<BackendAnneeAcademique>(this.baseUrl, request)
      .pipe(
        map(response => BackendMapper.toAcademicYear(response))
      );
  }

  update(id: string, data: Partial<SimpleAcademicYear>): Observable<SimpleAcademicYear> {
    const request: Partial<BackendAnneeAcademiqueRequest> = {};
    
    if (data.label) request.libelle = data.label;
    if (data.startDate) request.dateDebut = data.startDate.toISOString().split('T')[0];
    if (data.endDate) request.dateFin = data.endDate.toISOString().split('T')[0];
    if (data.isCurrent !== undefined) request.estCourante = data.isCurrent;

    return this.api.put<BackendAnneeAcademique>(`${this.baseUrl}/${id}`, request)
      .pipe(
        map(response => BackendMapper.toAcademicYear(response))
      );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.baseUrl}/${id}`);
  }

  findCurrent(): Observable<SimpleAcademicYear | null> {
    return this.findAll().pipe(
      map(years => {
        const current = years.find(y => y.isCurrent);
        return current || null;
      })
    );
  }

  setCurrent(id: string): Observable<SimpleAcademicYear> {
    return this.update(id, { isCurrent: true });
  }
}
