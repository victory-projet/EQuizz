// src/app/core/domain/use-cases/class/delete-class.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { IClassRepository } from '../../../domain/repositories/class.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class DeleteClassUseCase {
  private repository = inject(IClassRepository);

  execute(id: string): Observable<void> {
    return this.repository.getById(id).pipe(
      switchMap(classEntity => {
        // En production, vérifier si la classe peut être supprimée
        // Pour le mock, on permet la suppression même avec des étudiants
        // if (!classEntity.canBeDeleted()) {
        //   return throwError(() => new Error('Impossible de supprimer une classe avec des étudiants'));
        // }
        return this.repository.delete(id);
      })
    );
  }
}
