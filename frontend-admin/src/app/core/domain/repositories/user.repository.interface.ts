import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';

export interface CreateUserDto {
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string; // Optionnel pour les étudiants
  role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';
  specialite?: string;
  matricule?: string;
}

export interface UpdateUserDto {
  nom?: string;
  prenom?: string;
  email?: string;
  estActif?: boolean;
  specialite?: string;
}

export abstract class UserRepositoryInterface {
  abstract getAll(): Observable<User[]>;
  abstract getById(id: string): Observable<User>;
  abstract create(data: CreateUserDto): Observable<User>;
  abstract update(id: string, data: UpdateUserDto): Observable<User>;
  abstract delete(id: string): Observable<void>;
  abstract resetPassword(id: string, nouveauMotDePasse: string): Observable<void>;
}
