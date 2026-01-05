import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRepositoryInterface, CreateUserDto, UpdateUserDto } from '../domain/repositories/user.repository.interface';
import { User, Etudiant } from '../domain/entities/user.entity';
import { StudentService } from '../services/student.service';

@Injectable({
  providedIn: 'root'
})
export class UserUseCase {
  constructor(
    private userRepository: UserRepositoryInterface,
    private studentService: StudentService
  ) {}

  getAllUsers(): Observable<User[]> {
    return this.userRepository.getAll();
  }

  getUserById(id: string): Observable<User> {
    return this.userRepository.getById(id);
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.userRepository.create(data);
  }

  updateUser(id: string, data: UpdateUserDto): Observable<User> {
    return this.userRepository.update(id, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.userRepository.delete(id);
  }

  resetPassword(id: string, nouveauMotDePasse: string): Observable<void> {
    return this.userRepository.resetPassword(id, nouveauMotDePasse);
  }

  importUsers(users: any[]): Observable<{ imported: number; errors: any[] }> {
    return this.userRepository.importUsers(users);
  }

  // Student-specific methods
  getStudentsPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    classeId?: string;
    statut?: string;
  }): Observable<{ students: Etudiant[]; pagination: any }> {
    return this.studentService.getStudentsPaginated(params).pipe(
      map(response => ({
        students: response.students.map(student => this.mapStudentToEtudiant(student)),
        pagination: response.pagination
      }))
    );
  }

  createStudent(data: any): Observable<Etudiant> {
    return this.studentService.createStudent(data).pipe(
      map(student => this.mapStudentToEtudiant(student))
    );
  }

  updateStudent(id: number, data: any): Observable<Etudiant> {
    return this.studentService.updateStudent(id, data).pipe(
      map(student => this.mapStudentToEtudiant(student))
    );
  }

  deleteStudent(id: number): Observable<void> {
    return this.studentService.deleteStudent(id);
  }

  private mapStudentToEtudiant(student: any): Etudiant {
    return {
      id: parseInt(student.id),
      nom: student.nom,
      prenom: student.prenom,
      email: student.email,
      matricule: student.numeroEtudiant,
      role: 'ETUDIANT' as const,
      estActif: student.estActif,
      dateCreation: new Date(student.createdAt || student.dateInscription),
      dateModification: new Date(student.updatedAt || student.createdAt || student.dateInscription),
      classeId: student.classe?.id ? parseInt(student.classe.id) : undefined,
      classe: student.classe ? {
        id: parseInt(student.classe.id),
        nom: student.classe.nom,
        anneeAcademiqueId: 1, // Default value
        dateCreation: new Date(),
        dateModification: new Date()
      } : undefined,
      numeroEtudiant: student.numeroEtudiant,
      statut: student.estActif ? 'ACTIF' : 'INACTIF'
    };
  }
}
