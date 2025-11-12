// src/app/core/domain/entities/course.entity.ts
/**
 * Domain Entities - Course (UE - Unité d'Enseignement)
 */

export class Course {
  constructor(
    public readonly id: string,
    public code: string,
    public name: string,
    public description: string,
    public teacherId: string,
    public academicYearId: string,
    public semesterId: string,
    public createdAt: Date
  ) {}

  /**
   * Vérifie si le cours est valide
   */
  isValid(): boolean {
    return this.name.length > 0 && this.code.length > 0;
  }

  /**
   * Vérifie si le cours peut être supprimé
   */
  canBeDeleted(): boolean {
    // Un cours peut être supprimé s'il n'a pas de quiz associés
    return true; // À implémenter avec la logique métier
  }
}

export class Teacher {
  constructor(
    public readonly id: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public department: string,
    public courseIds: string[]
  ) {}

  /**
   * Nom complet
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Ajoute un cours
   */
  addCourse(courseId: string): void {
    if (!this.courseIds.includes(courseId)) {
      this.courseIds.push(courseId);
    }
  }

  /**
   * Retire un cours
   */
  removeCourse(courseId: string): void {
    this.courseIds = this.courseIds.filter(id => id !== courseId);
  }
}
