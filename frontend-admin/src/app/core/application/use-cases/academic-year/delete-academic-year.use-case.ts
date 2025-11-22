// src/app/core/domain/use-cases/academic-year/delete-academic-year.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { IAcademicYearRepository } from '../../../domain/repositories/academic-year.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class DeleteAcademicYearUseCase {
  private repository = inject(IAcademicYearRepository);

  execute(id: string): Observable<void> {
    return this.repository.getById(id).pipe(
      switchMap(year => {
        if (!year.canBeDeleted()) {
          return throwError(() => new Error('Impossible de supprimer une année active avec des périodes'));
        }
        return this.repository.delete(id);
      })
    );
  }
}
