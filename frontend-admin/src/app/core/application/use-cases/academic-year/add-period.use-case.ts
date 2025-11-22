// src/app/core/domain/use-cases/academic-year/add-period.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Period } from '../../../domain/entities/academic-year.entity';
import { IAcademicYearRepository } from '../../../domain/repositories/academic-year.repository.interface';

export interface AddPeriodDto {
  yearId: string;
  name: string;
  type: 'semester' | 'trimester';
  startDate: Date;
  endDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AddPeriodUseCase {
  private repository = inject(IAcademicYearRepository);

  execute(dto: AddPeriodDto): Observable<Period> {
    this.validate(dto);

    const period = new Period(
      this.generateId(),
      dto.name,
      dto.type,
      dto.startDate,
      dto.endDate
    );

    return this.repository.addPeriod(dto.yearId, period);
  }

  private validate(dto: AddPeriodDto): void {
    if (!dto.name) {
      throw new Error('Le nom de la période est requis');
    }

    if (dto.startDate >= dto.endDate) {
      throw new Error('La date de début doit être antérieure à la date de fin');
    }
  }

  private generateId(): string {
    return `period-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
