// src/app/core/infrastructure/repositories/academic-year.repository.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { AcademicYear, Period } from '../../core/domain/entities/academic-year.entity';
import { IAcademicYearRepository } from '../../core/domain/repositories/academic-year.repository.interface';

/**
 * Repository Implementation - Academic Year
 * Implémentation concrète pour l'accès aux données
 * Principe: Dependency Inversion (implémente l'interface du domaine)
 * 
 * Note: Utilise un stockage en mémoire pour la démo
 * En production, remplacer par HttpClient vers une API
 */
@Injectable({
  providedIn: 'root'
})
export class AcademicYearRepository implements IAcademicYearRepository {
  private academicYears: AcademicYear[] = this.initMockData();

  getAll(): Observable<AcademicYear[]> {
    return of([...this.academicYears]).pipe(delay(300));
  }

  getById(id: string): Observable<AcademicYear> {
    const year = this.academicYears.find(y => y.id === id);
    if (!year) {
      return throwError(() => new Error(`Année académique ${id} non trouvée`));
    }
    return of(year).pipe(delay(200));
  }

  getActive(): Observable<AcademicYear | null> {
    const activeYear = this.academicYears.find(y => y.isActive) || null;
    return of(activeYear).pipe(delay(200));
  }

  create(year: AcademicYear): Observable<AcademicYear> {
    this.academicYears.unshift(year);
    return of(year).pipe(delay(300));
  }

  update(id: string, updates: Partial<AcademicYear>): Observable<AcademicYear> {
    const index = this.academicYears.findIndex(y => y.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Année académique ${id} non trouvée`));
    }

    // Mettre à jour uniquement les propriétés fournies
    Object.assign(this.academicYears[index], updates);

    return of(this.academicYears[index]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    const index = this.academicYears.findIndex(y => y.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Année académique ${id} non trouvée`));
    }

    this.academicYears.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  addPeriod(yearId: string, period: Period): Observable<Period> {
    const year = this.academicYears.find(y => y.id === yearId);
    if (!year) {
      return throwError(() => new Error(`Année académique ${yearId} non trouvée`));
    }

    year.addPeriod(period);
    return of(period).pipe(delay(300));
  }

  removePeriod(yearId: string, periodId: string): Observable<void> {
    const year = this.academicYears.find(y => y.id === yearId);
    if (!year) {
      return throwError(() => new Error(`Année académique ${yearId} non trouvée`));
    }

    year.periods = year.periods.filter(p => p.id !== periodId);
    return of(void 0).pipe(delay(300));
  }

  private initMockData(): AcademicYear[] {
    const periods1 = [
      new Period(
        '1',
        'Semestre 1',
        'semester',
        new Date('2025-09-01'),
        new Date('2026-01-31')
      ),
      new Period(
        '2',
        'Semestre 2',
        'semester',
        new Date('2026-02-01'),
        new Date('2026-06-30')
      )
    ];

    return [
      new AcademicYear(
        '1',
        '2025-2026',
        new Date('2025-09-01'),
        new Date('2026-06-30'),
        true, // Année active en cours
        periods1
      ),
      new AcademicYear(
        '2',
        '2024-2025',
        new Date('2024-09-01'),
        new Date('2025-06-30'),
        false,
        []
      ),
      new AcademicYear(
        '3',
        '2023-2024',
        new Date('2023-09-01'),
        new Date('2024-06-30'),
        false,
        []
      )
    ];
  }
}
