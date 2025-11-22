// src/app/core/domain/entities/academic-year.entity.ts
/**
 * Domain Entity - Academic Year
 * Représente une année académique dans le domaine métier
 */
export class AcademicYear {
  constructor(
    public readonly id: string,
    public name: string,
    public startDate: Date,
    public endDate: Date,
    public isActive: boolean,
    public periods: Period[] = []
  ) {}

  /**
   * Vérifie si l'année académique est en cours
   */
  isCurrentYear(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate && this.isActive;
  }

  /**
   * Vérifie si l'année peut être supprimée
   */
  canBeDeleted(): boolean {
    // Une année active avec des périodes ne peut pas être supprimée
    return !this.isActive || this.periods.length === 0;
  }

  /**
   * Active cette année et désactive les autres
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Désactive cette année
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Ajoute une période à l'année
   */
  addPeriod(period: Period): void {
    if (this.isPeriodValid(period)) {
      this.periods.push(period);
    } else {
      throw new Error('La période est invalide ou chevauche une période existante');
    }
  }

  /**
   * Vérifie si une période est valide
   */
  private isPeriodValid(period: Period): boolean {
    // Vérifier que la période est dans les limites de l'année
    if (period.startDate < this.startDate || period.endDate > this.endDate) {
      return false;
    }

    // Vérifier qu'il n'y a pas de chevauchement avec d'autres périodes
    return !this.periods.some(p => 
      (period.startDate >= p.startDate && period.startDate <= p.endDate) ||
      (period.endDate >= p.startDate && period.endDate <= p.endDate)
    );
  }
}

/**
 * Domain Entity - Period (Semester/Trimester)
 */
export class Period {
  constructor(
    public readonly id: string,
    public name: string,
    public type: 'semester' | 'trimester',
    public startDate: Date,
    public endDate: Date
  ) {}

  /**
   * Vérifie si la période est en cours
   */
  isCurrentPeriod(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }

  /**
   * Calcule la durée en jours
   */
  getDurationInDays(): number {
    const diff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
