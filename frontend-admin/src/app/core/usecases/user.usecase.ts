import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepositoryInterface, CreateUserDto, UpdateUserDto } from '../domain/repositories/user.repository.interface';
import { User } from '../domain/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class UserUseCase {
  constructor(private userRepository: UserRepositoryInterface) {}

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
}
