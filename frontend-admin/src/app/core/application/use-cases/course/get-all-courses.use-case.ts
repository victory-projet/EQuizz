// src/app/core/domain/use-cases/course/get-all-courses.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../../../domain/entities/course.entity';
import { ICourseRepository } from '../../../domain/repositories/course.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class GetAllCoursesUseCase {
  private repository = inject(ICourseRepository);

  execute(): Observable<Course[]> {
    return this.repository.getAll();
  }
}
