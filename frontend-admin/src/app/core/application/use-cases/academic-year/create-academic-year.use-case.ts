// src/app/core/domain/use-cases/academic-year/create-academic-year.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AcademicYear } from '../../../domain/entities/academic-year.entity';
import { IAcademicYearRepository } from '../../../domain/repositories/academic-year.repository.interface';

/**
 * Use Case - Create Academic Year
 * Encapsule la logique métier pour créer une année académique
 * Principe: Single Responsibility (une seule raison de changer)
 */
export interface CreateAcademicYearDto {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CreateAcademicYearUseCase {
  private repository = inject(IAcademicYearRepository);

  execute(dto: CreateAcademicYearDto): Observable<AcademicYear> {
    // Validation métier
    this.validate(dto);

    // Créer l'entité
    const academicYear = new AcademicYear(
      this.generateId(),
      dto.name,
      dto.startDate,
      dto.endDate,
      dto.isActive
    );

    // Si l'année est active, désactiver les autres
    if (dto.isActive) {
      return this.repository.getAll().pipe(
        map(years => {
          years.forEach(y => y.deactivate());
          return academicYear;
        }),
        map(() => this.repository.create(academicYear)),
        map(obs => obs as unknown as AcademicYear)
      );
    }

    return this.repository.create(academicYear);
  }

  private validate(dto: CreateAcademicYearDto): void {
    if (!dto.name || !dto.name.match(/^\d{4}-\d{4}$/)) {
      throw new Error('Le nom doit être au format YYYY-YYYY');
    }

    if (dto.startDate >= dto.endDate) {
      throw new Error('La date de début doit être antérieure à la date de fin');
    }

    const yearDiff = dto.endDate.getFullYear() - dto.startDate.getFullYear();
    if (yearDiff > 1) {
      throw new Error('Une année académique ne peut pas dépasser 1 an');
    }
  }

  private generateId(): string {
    return `year-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
