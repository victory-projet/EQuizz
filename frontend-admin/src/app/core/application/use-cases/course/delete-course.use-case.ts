// src/app/core/domain/use-cases/course/delete-course.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ICourseRepository } from '../../../domain/repositories/course.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class DeleteCourseUseCase {
  private repository = inject(ICourseRepository);

  execute(id: string): Observable<void> {
    return this.repository.delete(id);
  }
}
