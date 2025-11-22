// src/app/core/domain/use-cases/class/update-class.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Class } from '../../../domain/entities/class.entity';
import { IClassRepository } from '../../../domain/repositories/class.repository.interface';

export interface UpdateClassDto {
  id: string;
  name?: string;
  level?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateClassUseCase {
  private repository = inject(IClassRepository);

  execute(dto: UpdateClassDto): Observable<Class> {
    return this.repository.update(dto.id, dto);
  }
}
