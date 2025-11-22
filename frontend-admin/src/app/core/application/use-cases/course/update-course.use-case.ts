// src/app/core/domain/use-cases/course/update-course.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../../../domain/entities/course.entity';
import { ICourseRepository } from '../../../domain/repositories/course.repository.interface';

export interface UpdateCourseDto {
  name?: string;
  description?: string;
  teacherId?: string;
  academicYearId?: string;
  semesterId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateCourseUseCase {
  private repository = inject(ICourseRepository);

  execute(id: string, dto: UpdateCourseDto): Observable<Course> {
    return this.repository.update(id, dto);
  }
}
