// src/app/core/domain/use-cases/class/create-class.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Class } from '../../../domain/entities/class.entity';
import { IClassRepository } from '../../../domain/repositories/class.repository.interface';

export interface CreateClassDto {
  name: string;
  level: string;
  academicYearId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreateClassUseCase {
  private repository = inject(IClassRepository);

  execute(dto: CreateClassDto): Observable<Class> {
    this.validate(dto);

    const classEntity = new Class(
      this.generateId(),
      dto.name,
      dto.level,
      dto.academicYearId,
      [],
      [],
      new Date()
    );

    return this.repository.create(classEntity);
  }

  private validate(dto: CreateClassDto): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Le nom de la classe est requis');
    }

    if (!dto.level || dto.level.trim().length === 0) {
      throw new Error('Le niveau est requis');
    }

    if (!dto.academicYearId) {
      throw new Error('L\'année académique est requise');
    }
  }

  private generateId(): string {
    return `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
