// src/app/core/domain/use-cases/class/add-student-to-class.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IClassRepository } from '../../../domain/repositories/class.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class AddStudentToClassUseCase {
  private repository = inject(IClassRepository);

  execute(classId: string, studentId: string): Observable<void> {
    return this.repository.addStudent(classId, studentId);
  }
}
