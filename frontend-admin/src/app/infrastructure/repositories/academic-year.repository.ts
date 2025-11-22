// src/app/core/infrastructure/repositories/academic-year.repository.ts
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, map } from 'rxjs';
import { AcademicYear, Period } from '../../core/domain/entities/academic-year.entity';
import { IAcademicYearRepository } from '../../core/domain/repositories/academic-year.repository.interface';
import { ApiService } from '../http/api.service';
import { AcademicMapper } from '../mappers/academic.mapper';
import { BackendAnneeAcademique, BackendSemestre } from '../http/interfaces/backend.interfaces';

/**
 * Repository Implementation - Academic Year
 * Implémentation concrète pour l'accès aux données via l'API backend
 */
@Injectable({
  providedIn: 'root'
})
export class AcademicYearRepository implements IAcademicYearRepository {
  private apiService = inject(ApiService);

  getAll(): Observable<AcademicYear[]> {
    return this.apiService.get<BackendAnneeAcademique[]>('/academic/annees-academiques').pipe(
      map(backendYears => backendYears.map(y => AcademicMapper.toAcademicYear(y)))
    );
  }

  getById(id: string): Observable<AcademicYear> {
    return this.apiService.get<BackendAnneeAcademique>(`/academic/annees-academiques/${id}`).pipe(
      map(backendYear => AcademicMapper.toAcademicYear(backendYear))
    );
  }

  getActive(): Observable<AcademicYear | null> {
    return this.getAll().pipe(
      map(years => years.find(y => y.isActive) || null)
    );
  }

  create(year: AcademicYear): Observable<AcademicYear> {
    const request = AcademicMapper.toBackendAnneeAcademiqueRequest(year);
    
    return this.apiService.post<BackendAnneeAcademique>('/academic/annees-academiques', request).pipe(
      map(backendYear => AcademicMapper.toAcademicYear(backendYear))
    );
  }

  update(id: string, updates: Partial<AcademicYear>): Observable<AcademicYear> {
    // Créer un objet temporaire pour la conversion
    const tempYear = new AcademicYear(
      id,
      updates.name || '',
      updates.startDate || new Date(),
      updates.endDate || new Date(),
      updates.isActive ?? false,
      updates.periods || []
    );
    
    const request = AcademicMapper.toBackendAnneeAcademiqueRequest(tempYear);
    
    return this.apiService.put<BackendAnneeAcademique>(`/academic/annees-academiques/${id}`, request).pipe(
      map(backendYear => AcademicMapper.toAcademicYear(backendYear))
    );
  }

  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`/academic/annees-academiques/${id}`);
  }

  addPeriod(yearId: string, period: Period): Observable<Period> {
    const request = AcademicMapper.toBackendSemestreRequest(period, parseInt(yearId));
    
    return this.apiService.post<BackendSemestre>('/academic/semestres', request).pipe(
      map(backendSemestre => AcademicMapper.toPeriod(backendSemestre))
    );
  }

  removePeriod(yearId: string, periodId: string): Observable<void> {
    return this.apiService.delete<void>(`/academic/semestres/${periodId}`);
  }
}
