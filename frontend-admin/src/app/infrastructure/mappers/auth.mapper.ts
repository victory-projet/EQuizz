// Mapper pour l'authentification
import { User, AuthToken, LoginCredentials } from '../../core/domain/entities/user.entity';
import { BackendUser, BackendAuthResponse, BackendLoginRequest } from '../http/interfaces/backend.interfaces';

export class AuthMapper {
  /**
   * Convertir BackendUser vers User (Domain)
   */
  static toDomain(backendUser: BackendUser): User {
    return new User(
      backendUser.id.toString(),
      backendUser.email,
      backendUser.prenom,
      backendUser.nom,
      backendUser.role as any,
      backendUser.estActif,
      new Date(backendUser.createdAt),
      backendUser.updatedAt ? new Date(backendUser.updatedAt) : undefined
    );
  }

  /**
   * Convertir BackendAuthResponse vers AuthToken (Domain)
   */
  static toAuthToken(backendResponse: BackendAuthResponse): AuthToken {
    return new AuthToken(
      backendResponse.token,
      backendResponse.token, // Le backend ne retourne qu'un seul token
      3600, // 1 heure par défaut
      'Bearer'
    );
  }

  /**
   * Convertir LoginCredentials vers BackendLoginRequest
   */
  static toBackendLoginRequest(credentials: LoginCredentials): BackendLoginRequest {
    return {
      email: credentials.email,
      motDePasse: credentials.password
    };
  }

  /**
   * Convertir User (Domain) vers BackendUser (pour update)
   */
  static toBackend(user: User): Partial<BackendUser> {
    return {
      email: user.email,
      prenom: user.firstName,
      nom: user.lastName,
      role: user.role,
      estActif: user.isActive
    };
  }
}
