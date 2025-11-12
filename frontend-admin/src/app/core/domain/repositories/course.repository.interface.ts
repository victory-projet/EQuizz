// src/app/core/domain/repositories/course.repository.interface.ts
import { Observable } from 'rxjs';
import { Course, Teacher } from '../entities/course.entity';

/**
 * Repository Interface - Course
 */
export abstract class ICourseRepository {
  abstract getAll(): Observable<Course[]>;
  abstract getById(id: string): Observable<Course>;
  abstract getByAcademicYear(yearId: string): Observable<Course[]>;
  abstract getBySemester(semesterId: string): Observable<Course[]>;
  abstract getByTeacher(teacherId: string): Observable<Course[]>;
  abstract create(course: Course): Observable<Course>;
  abstract update(id: string, course: Partial<Course>): Observable<Course>;
  abstract delete(id: string): Observable<void>;
}

/**
 * Repository Interface - Teacher
 */
export abstract class ITeacherRepository {
  abstract getAll(): Observable<Teacher[]>;
  abstract getById(id: string): Observable<Teacher>;
  abstract getByDepartment(department: string): Observable<Teacher[]>;
  abstract create(teacher: Teacher): Observable<Teacher>;
  abstract update(id: string, teacher: Partial<Teacher>): Observable<Teacher>;
  abstract delete(id: string): Observable<void>;
}
