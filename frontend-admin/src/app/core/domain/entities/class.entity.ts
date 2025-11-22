// src/app/core/domain/entities/class.entity.ts
/**
 * Domain Entities - Class
 */

export class Class {
  constructor(
    public readonly id: string,
    public name: string,
    public level: string,
    public academicYearId: string,
    public studentIds: string[],
    public courseIds: string[],
    public createdAt: Date
  ) {}

  /**
   * Ajoute un étudiant
   */
  addStudent(studentId: string): void {
    if (this.studentIds.includes(studentId)) {
      throw new Error('Étudiant déjà inscrit dans cette classe');
    }
    this.studentIds.push(studentId);
  }

  /**
   * Retire un étudiant
   */
  removeStudent(studentId: string): void {
    this.studentIds = this.studentIds.filter(id => id !== studentId);
  }

  /**
   * Ajoute un cours
   */
  addCourse(courseId: string): void {
    if (this.courseIds.includes(courseId)) {
      throw new Error('Cours déjà assigné à cette classe');
    }
    this.courseIds.push(courseId);
  }

  /**
   * Retire un cours
   */
  removeCourse(courseId: string): void {
    this.courseIds = this.courseIds.filter(id => id !== courseId);
  }

  /**
   * Compte le nombre d'étudiants
   */
  getStudentCount(): number {
    return this.studentIds.length;
  }

  /**
   * Vérifie si la classe peut être supprimée
   */
  canBeDeleted(): boolean {
    return this.studentIds.length === 0;
  }
}

export class Student {
  constructor(
    public readonly id: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public studentNumber: string,
    public classIds: string[],
    public enrollmentDate: Date
  ) {}

  /**
   * Nom complet
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Vérifie si l'étudiant est inscrit dans une classe
   */
  isEnrolledIn(classId: string): boolean {
    return this.classIds.includes(classId);
  }
}
