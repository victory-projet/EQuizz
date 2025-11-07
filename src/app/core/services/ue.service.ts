import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UE } from '../../shared/interfaces/ue.interface';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class UEService {
  private uesSubject = new BehaviorSubject<UE[]>([]);
  public ues$ = this.uesSubject.asObservable();

  private mockUEs: UE[] = [
    {
      id: '1',
      code: 'INF101',
      name: 'Algorithmique et Programmation',
      description: 'Introduction aux concepts fondamentaux de l\'algorithmique et de la programmation',
      credits: 6,
      semester: 1,
      createdAt: new Date('2024-09-01')
    },
    {
      id: '2',
      code: 'INF102',
      name: 'Base de Données',
      description: 'Conception et gestion de bases de données relationnelles',
      credits: 5,
      semester: 1,
      createdAt: new Date('2024-09-01')
    },
    {
      id: '3',
      code: 'INF201',
      name: 'Réseaux Informatiques',
      description: 'Principes et protocoles des réseaux informatiques',
      credits: 5,
      semester: 2,
      createdAt: new Date('2024-09-01')
    },
    {
      id: '4',
      code: 'MAT101',
      name: 'Mathématiques pour l\'Informatique',
      description: 'Mathématiques discrètes et logique',
      credits: 4,
      semester: 1,
      createdAt: new Date('2024-09-01')
    },
    {
      id: '5',
      code: 'INF301',
      name: 'Systèmes d\'Information',
      description: 'Analyse et conception de systèmes d\'information',
      credits: 6,
      semester: 3,
      createdAt: new Date('2024-09-01')
    }
  ];

  constructor(private toastService: ToastService) {
    this.uesSubject.next(this.mockUEs);
  }

  getUEs(): Observable<UE[]> {
    return this.ues$;
  }

  getUEById(id: string): UE | undefined {
    return this.mockUEs.find(ue => ue.id === id);
  }

  createUE(ue: Omit<UE, 'id' | 'createdAt'>): void {
    const newUE: UE = {
      ...ue,
      id: this.generateId(),
      createdAt: new Date()
    };
    this.mockUEs.push(newUE);
    this.uesSubject.next([...this.mockUEs]);
    this.toastService.success('UE créée avec succès !');
  }

  updateUE(id: string, updates: Partial<UE>): void {
    const index = this.mockUEs.findIndex(ue => ue.id === id);
    if (index !== -1) {
      this.mockUEs[index] = {
        ...this.mockUEs[index],
        ...updates,
        updatedAt: new Date()
      };
      this.uesSubject.next([...this.mockUEs]);
      this.toastService.success('UE mise à jour avec succès !');
    } else {
      this.toastService.error('UE introuvable');
    }
  }

  deleteUE(id: string): void {
    // TODO: Vérifier qu'aucun quiz n'est associé à cette UE
    const index = this.mockUEs.findIndex(ue => ue.id === id);
    if (index !== -1) {
      this.mockUEs.splice(index, 1);
      this.uesSubject.next([...this.mockUEs]);
      this.toastService.success('UE supprimée avec succès !');
    } else {
      this.toastService.error('UE introuvable');
    }
  }

  searchUEs(term: string): UE[] {
    if (!term.trim()) {
      return this.mockUEs;
    }
    const searchTerm = term.toLowerCase();
    return this.mockUEs.filter(ue =>
      ue.name.toLowerCase().includes(searchTerm) ||
      ue.code.toLowerCase().includes(searchTerm) ||
      ue.description.toLowerCase().includes(searchTerm)
    );
  }

  private generateId(): string {
    return `ue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
