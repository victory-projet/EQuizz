import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from '../http/api.service';
import { BackendUser, BackendEtudiant, BackendEnseignant } from '../http/interfaces/backend.interfaces';
import { SimpleUser, SimpleStudent, SimpleTeacher } from '../../core/models/simplified.interfaces';
import { BackendMapper } from '../mappers/backend.mapper';
import { IUserRepository, IAuthRepository } from '../../core/domain/repositories/auth.repository.interface';
import { User, AuthToken, LoginCredentials, UserRole } from '../../core/domain/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class UserRepository implements IUserRepository, IAuthRepository {
  private readonly baseUrl = '/auth';
  private readonly studentsUrl = '/academic/etudiants';
  private readonly teachersUrl = '/academic/enseignants';

  constructor(private api: ApiService) { }

  // IAuthRepository implementation
  login(credentials: LoginCredentials): Observable<AuthToken> {
    // TODO: Implement
    return of(new AuthToken('', '', 3600));
  }

  logout(): Observable<void> {
    // TODO: Implement
    return of(void 0);
  }

  refreshToken(refreshToken: string): Observable<AuthToken> {
    // TODO: Implement
    return of(new AuthToken('', '', 3600));
  }

  register(user: Partial<User>, password: string): Observable<User> {
    // TODO: Implement
    return of({} as User);
  }

  resetPassword(email: string): Observable<void> {
    // TODO: Implement
    return of(void 0);
  }

  getCurrentUser(): Observable<User> {
    return this.api.get<BackendUser>(`${this.baseUrl}/me`)
      .pipe(
        map(response => this.mapBackendUserToDomainUser(response))
      );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.api.post<void>(`${this.baseUrl}/change-password`, {
      currentPassword: oldPassword,
      newPassword
    });
  }

  // IUserRepository implementation
  getAll(): Observable<User[]> {
    // TODO: Implement mapping from backend user to domain User
    return of([]);
  }

  getById(id: string): Observable<User> {
    // TODO: Implement mapping
    return of({} as User);
  }

  getByRole(role: string): Observable<User[]> {
    return of([]);
  }

  create(user: User): Observable<User> {
    return of(user);
  }

  update(id: string, user: Partial<User>): Observable<User> {
    const request: any = {};

    if (user.firstName) request.prenom = user.firstName;
    if (user.lastName) request.nom = user.lastName;
    if (user.email) request.email = user.email;

    return this.api.put<BackendUser>(`${this.baseUrl}/profile`, request)
      .pipe(
        map(response => this.mapBackendUserToDomainUser(response))
      );
  }

  delete(id: string): Observable<void> {
    return of(void 0);
  }

  activate(id: string): Observable<User> {
    return of({} as User);
  }

  deactivate(id: string): Observable<User> {
    return of({} as User);
  }

  // Legacy/Specific methods
  updateProfile(data: Partial<User>): Observable<User> {
    return this.update('current', data);
  }

  // Student & Teacher methods (kept as is for now, but technically belong to specific repositories)
  getAllStudents(): Observable<SimpleStudent[]> {
    return this.api.get<BackendEtudiant[]>(this.studentsUrl)
      .pipe(
        map(response => BackendMapper.toStudents(response))
      );
  }

  getStudentById(id: string): Observable<SimpleStudent> {
    return this.api.get<BackendEtudiant>(`${this.studentsUrl}/${id}`)
      .pipe(
        map(response => BackendMapper.toStudent(response))
      );
  }

  getStudentsByClass(classId: string): Observable<SimpleStudent[]> {
    return this.api.get<BackendEtudiant[]>(`${this.studentsUrl}/class/${classId}`)
      .pipe(
        map(response => BackendMapper.toStudents(response))
      );
  }

  createStudent(data: Partial<SimpleStudent>): Observable<SimpleStudent> {
    const request: any = {
      prenom: data.firstName!,
      nom: data.lastName!,
      email: data.email!,
      matricule: data.matricule!,
      idCarte: data.idCarte,
      classeId: data.classId
    };

    return this.api.post<BackendEtudiant>(this.studentsUrl, request)
      .pipe(
        map(response => BackendMapper.toStudent(response))
      );
  }

  updateStudent(id: string, data: Partial<SimpleStudent>): Observable<SimpleStudent> {
    const request: any = {};

    if (data.firstName) request.prenom = data.firstName;
    if (data.lastName) request.nom = data.lastName;
    if (data.email) request.email = data.email;
    if (data.matricule) request.matricule = data.matricule;
    if (data.idCarte) request.idCarte = data.idCarte;
    if (data.classId) request.classeId = data.classId;

    return this.api.put<BackendEtudiant>(`${this.studentsUrl}/${id}`, request)
      .pipe(
        map(response => BackendMapper.toStudent(response))
      );
  }

  deleteStudent(id: string): Observable<void> {
    return this.api.delete<void>(`${this.studentsUrl}/${id}`);
  }

  getAllTeachers(): Observable<SimpleTeacher[]> {
    return this.api.get<BackendEnseignant[]>(this.teachersUrl)
      .pipe(
        map(response => BackendMapper.toTeachers(response))
      );
  }

  getTeacherById(id: string): Observable<SimpleTeacher> {
    return this.api.get<BackendEnseignant>(`${this.teachersUrl}/${id}`)
      .pipe(
        map(response => BackendMapper.toTeacher(response))
      );
  }

  createTeacher(data: Partial<SimpleTeacher>): Observable<SimpleTeacher> {
    const request: any = {
      prenom: data.firstName!,
      nom: data.lastName!,
      email: data.email!,
      specialite: data.specialization
    };

    return this.api.post<BackendEnseignant>(this.teachersUrl, request)
      .pipe(
        map(response => BackendMapper.toTeacher(response))
      );
  }

  updateTeacher(id: string, data: Partial<SimpleTeacher>): Observable<SimpleTeacher> {
    const request: any = {};

    if (data.firstName) request.prenom = data.firstName;
    if (data.lastName) request.nom = data.lastName;
    if (data.email) request.email = data.email;
    if (data.specialization) request.specialite = data.specialization;

    return this.api.put<BackendEnseignant>(`${this.teachersUrl}/${id}`, request)
      .pipe(
        map(response => BackendMapper.toTeacher(response))
      );
  }

  deleteTeacher(id: string): Observable<void> {
    return this.api.delete<void>(`${this.teachersUrl}/${id}`);
  }

  private mapBackendUserToDomainUser(backend: BackendUser): User {
    return new User(
      backend.id,
      backend.prenom,
      backend.nom,
      backend.email,
      backend.role as UserRole, // Cast to UserRole
      backend.estActif, // isActive
      new Date(), // createdAt
      new Date() // lastLogin
    );
  }
}
