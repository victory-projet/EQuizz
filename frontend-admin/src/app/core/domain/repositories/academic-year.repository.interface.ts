// src/app/core/domain/repositories/academic-year.repository.interface.ts
import { Observable } from 'rxjs';
import { AcademicYear, Period } from '../entities/academic-year.entity';

/**
 * Repository Interface - Academic Year
 * Définit le contrat pour l'accès aux données des années académiques
 * Principe: Dependency Inversion (dépendre d'abstractions, pas d'implémentations)
 */
export abstract class IAcademicYearRepository {
  abstract getAll(): Observable<AcademicYear[]>;
  abstract getById(id: string): Observable<AcademicYear>;
  abstract getActive(): Observable<AcademicYear | null>;
  abstract create(year: AcademicYear): Observable<AcademicYear>;
  abstract update(id: string, year: Partial<AcademicYear>): Observable<AcademicYear>;
  abstract delete(id: string): Observable<void>;
  abstract addPeriod(yearId: string, period: Period): Observable<Period>;
  abstract removePeriod(yearId: string, periodId: string): Observable<void>;
}
