// src/app/core/domain/use-cases/class/get-all-classes.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Class } from '../../entities/class.entity';
import { IClassRepository } from '../../repositories/class.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class GetAllClassesUseCase {
  private repository = inject(IClassRepository);

  execute(): Observable<Class[]> {
    return this.repository.getAll();
  }
}
