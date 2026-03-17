import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';

export interface CreateUserDto {
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string; // Optionnel pour les étudiants
  role: 'SUPER-ADMIN' | 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';
  specialite?: string;
  matricule?: string;
  ecoleId?: string; // Pour les administrateurs
}

export interface UpdateUserDto {
  nom?: string;
  prenom?: string;
  email?: string;
  estActif?: boolean;
  specialite?: string;
  ecoleId?: string; // Pour les administrateurs
}

export abstract class UserRepositoryInterface {
  abstract getAll(includeArchived?: boolean): Observable<User[]>;
  abstract getById(id: string): Observable<User>;
  abstract create(data: CreateUserDto): Observable<User>;
  abstract update(id: string, data: UpdateUserDto): Observable<User>;
  abstract delete(id: string): Observable<void>;
  abstract resetPassword(id: string, nouveauMotDePasse: string): Observable<void>;
  abstract importUsers(users: any[]): Observable<{ imported: number; errors: any[] }>;
}
