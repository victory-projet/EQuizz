// src/app/core/domain/use-cases/academic-year/update-academic-year.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AcademicYear } from '../../../domain/entities/academic-year.entity';
import { IAcademicYearRepository } from '../../../domain/repositories/academic-year.repository.interface';

export interface UpdateAcademicYearDto {
  id: string;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateAcademicYearUseCase {
  private repository = inject(IAcademicYearRepository);

  execute(dto: UpdateAcademicYearDto): Observable<AcademicYear> {
    this.validate(dto);
    return this.repository.update(dto.id, dto);
  }

  private validate(dto: UpdateAcademicYearDto): void {
    if (dto.name && !dto.name.match(/^\d{4}-\d{4}$/)) {
      throw new Error('Le nom doit être au format YYYY-YYYY');
    }

    if (dto.startDate && dto.endDate && dto.startDate >= dto.endDate) {
      throw new Error('La date de début doit être antérieure à la date de fin');
    }
  }
}
