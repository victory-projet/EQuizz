// src/app/core/domain/use-cases/academic-year/get-all-academic-years.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AcademicYear } from '../../../domain/entities/academic-year.entity';
import { IAcademicYearRepository } from '../../../domain/repositories/academic-year.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class GetAllAcademicYearsUseCase {
  private repository = inject(IAcademicYearRepository);

  execute(): Observable<AcademicYear[]> {
    return this.repository.getAll();
  }
}
