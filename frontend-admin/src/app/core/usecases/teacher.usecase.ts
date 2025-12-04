// Use Case - Teacher
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeacherRepositoryInterface } from '../domain/repositories/teacher.repository.interface';
import { Teacher } from '../domain/entities/teacher.entity';

@Injectable({
  providedIn: 'root'
})
export class TeacherUseCase {
  constructor(private teacherRepository: TeacherRepositoryInterface) {}

  getTeachers(): Observable<Teacher[]> {
    return this.teacherRepository.getTeachers();
  }

  getTeacher(id: string | number): Observable<Teacher> {
    return this.teacherRepository.getTeacher(id);
  }

  createTeacher(teacher: Partial<Teacher>): Observable<Teacher> {
    return this.teacherRepository.createTeacher(teacher);
  }

  updateTeacher(id: string | number, teacher: Partial<Teacher>): Observable<Teacher> {
    return this.teacherRepository.updateTeacher(id, teacher);
  }

  deleteTeacher(id: string | number): Observable<void> {
    return this.teacherRepository.deleteTeacher(id);
  }
}
