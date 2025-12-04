// Repository Interface - Teacher
import { Observable } from 'rxjs';
import { Teacher } from '../entities/teacher.entity';

export abstract class TeacherRepositoryInterface {
  abstract getTeachers(): Observable<Teacher[]>;
  abstract getTeacher(id: string | number): Observable<Teacher>;
  abstract createTeacher(teacher: Partial<Teacher>): Observable<Teacher>;
  abstract updateTeacher(id: string | number, teacher: Partial<Teacher>): Observable<Teacher>;
  abstract deleteTeacher(id: string | number): Observable<void>;
}
