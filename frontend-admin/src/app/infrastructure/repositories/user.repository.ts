import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UserRepositoryInterface, CreateUserDto, UpdateUserDto } from '../../core/domain/repositories/user.repository.interface';
import { User } from '../../core/domain/entities/user.entity';
import { ApiService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class UserRepository implements UserRepositoryInterface {
  constructor(private api: ApiService) {}

  getAll(): Observable<User[]> {
    return this.api.get<any[]>('/utilisateurs').pipe(
      map(users => users.map(u => this.mapUser(u)))
    );
  }

  getById(id: string): Observable<User> {
    return this.api.get<any>(`/utilisateurs/${id}`).pipe(
      map(u => this.mapUser(u))
    );
  }

  create(data: CreateUserDto): Observable<User> {
    return this.api.post<any>('/utilisateurs', data).pipe(
      map(u => this.mapUser(u))
    );
  }

  update(id: string, data: UpdateUserDto): Observable<User> {
    return this.api.put<any>(`/utilisateurs/${id}`, data).pipe(
      map(u => this.mapUser(u))
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/utilisateurs/${id}`);
  }

  resetPassword(id: string, nouveauMotDePasse: string): Observable<void> {
    return this.api.post<void>(`/utilisateurs/${id}/reset-password`, { nouveauMotDePasse });
  }

  private mapUser(data: any): User {
    const baseUser = {
      id: data.id,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      role: data.role,
      estActif: data.estActif,
      dateCreation: new Date(data.createdAt),
      dateModification: new Date(data.updatedAt)
    };

    // Ajouter les propriétés spécifiques selon le rôle
    if (data.role === 'ETUDIANT') {
      return {
        ...baseUser,
        matricule: data.matricule || data.Etudiant?.matricule,
        classeId: data.classeId || data.Etudiant?.classe_id,
        numeroCarteEtudiant: data.Etudiant.idCarte
      } as any;
    } else if (data.role === 'ENSEIGNANT' && data.Enseignant) {
      return {
        ...baseUser,
        specialite: data.Enseignant.specialite
      } as any;
    }

    return baseUser;
  }
}

