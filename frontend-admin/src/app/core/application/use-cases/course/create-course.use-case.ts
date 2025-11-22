// src/app/core/domain/use-cases/course/create-course.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../../../domain/entities/course.entity';
import { ICourseRepository } from '../../../domain/repositories/course.repository.interface';

export interface CreateCourseDto {
  code: string;
  name: string;
  description: string;
  teacherId: string;
  academicYearId: string;
  semesterId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreateCourseUseCase {
  private repository = inject(ICourseRepository);

  execute(dto: CreateCourseDto): Observable<Course> {
    this.validate(dto);

    const course = new Course(
      this.generateId(),
      dto.code,
      dto.name,
      dto.description,
      dto.teacherId,
      dto.academicYearId,
      dto.semesterId,
      new Date()
    );

    return this.repository.create(course);
  }

  private validate(dto: CreateCourseDto): void {
    if (!dto.code || dto.code.trim().length === 0) {
      throw new Error('Le code du cours est requis');
    }

    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Le nom du cours est requis');
    }
  }

  private generateId(): string {
    return `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
