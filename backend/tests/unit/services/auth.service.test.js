// backend/tests/unit/services/auth.service.test.js

const authService = require('../../../src/services/auth.service');
const etudiantRepository = require('../../../src/repositories/etudiant.repository');
const utilisateurRepository = require('../../../src/repositories/utilisateur.repository');
const emailService = require('../../../src/services/email.service');
const jwtService = require('../../../src/services/jwt.service');
const AppError = require('../../../src/utils/AppError');

// Mock des dépendances
jest.mock('../../../src/repositories/etudiant.repository');
jest.mock('../../../src/repositories/utilisateur.repository');
jest.mock('../../../src/services/email.service');
jest.mock('../../../src/services/jwt.service');

describe('AuthService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processAccountClaim', () => {
    
    it('devrait activer un compte étudiant avec succès', async () => {
      // Arrange
      const mockEtudiant = {
        id: 'etudiant-1',
        matricule: '20230001',
        Utilisateur: {
          id: 'user-1',
          email: 'test@saintjeaningenieur.org',
          motDePasseHash: null
        }
      };

      etudiantRepository.findStudentForClaim.mockResolvedValue(mockEtudiant);
      etudiantRepository.setPassword.mockResolvedValue(true);
      emailService.sendAccountClaimEmail.mockResolvedValue(true);

      // Act
      const result = await authService.processAccountClaim(
        '20230001',
        'test@saintjeaningenieur.org',
        'classe-1'
      );

      // Assert
      expect(result).toBe(true);
      expect(etudiantRepository.findStudentForClaim).toHaveBeenCalledWith(
        '20230001',
        'test@saintjeaningenieur.org',
        'classe-1'
      );
      expect(etudiantRepository.setPassword).toHaveBeenCalled();
      expect(emailService.sendAccountClaimEmail).toHaveBeenCalled();
    });

    it('devrait rejeter si l\'étudiant n\'existe pas', async () => {
      // Arrange
      etudiantRepository.findStudentForClaim.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.processAccountClaim('invalid', 'invalid@test.com', 'classe-1')
      ).rejects.toThrow(AppError);
    });

    it('devrait rejeter si le compte est déjà activé', async () => {
      // Arrange
      const mockEtudiant = {
        Utilisateur: {
          motDePasseHash: 'already-hashed-password'
        }
      };
      etudiantRepository.findStudentForClaim.mockResolvedValue(mockEtudiant);

      // Act & Assert
      await expect(
        authService.processAccountClaim('20230001', 'test@test.com', 'classe-1')
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      // Arrange
      const mockUtilisateur = {
        id: 'user-1',
        email: 'test@saintjeaningenieur.org',
        isPasswordMatch: jest.fn().mockResolvedValue(true)
      };

      utilisateurRepository.findByLogin.mockResolvedValue(mockUtilisateur);
      jwtService.generateToken.mockReturnValue('mock-jwt-token');

      // Act
      const result = await authService.login('test@saintjeaningenieur.org', 'password123');

      // Assert
      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result).toHaveProperty('utilisateur');
      expect(utilisateurRepository.findByLogin).toHaveBeenCalledWith('test@saintjeaningenieur.org');
      expect(mockUtilisateur.isPasswordMatch).toHaveBeenCalledWith('password123');
    });

    it('devrait rejeter avec des identifiants invalides', async () => {
      // Arrange
      utilisateurRepository.findByLogin.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.login('invalid@test.com', 'wrongpassword')
      ).rejects.toThrow(AppError);
    });

    it('devrait rejeter avec un mauvais mot de passe', async () => {
      // Arrange
      const mockUtilisateur = {
        isPasswordMatch: jest.fn().mockResolvedValue(false)
      };
      utilisateurRepository.findByLogin.mockResolvedValue(mockUtilisateur);

      // Act & Assert
      await expect(
        authService.login('test@test.com', 'wrongpassword')
      ).rejects.toThrow(AppError);
    });
  });

  describe('linkCardToAccount', () => {
    
    it('devrait lier une carte à un compte avec succès', async () => {
      // Arrange
      const mockEtudiant = {
        id: 'etudiant-1',
        matricule: '20230001',
        Utilisateur: {
          motDePasseHash: 'hashed-password'
        }
      };

      etudiantRepository.findByMatricule.mockResolvedValue(mockEtudiant);
      etudiantRepository.findByIdCarte.mockResolvedValue(null);
      etudiantRepository.updateIdCarte.mockResolvedValue(true);
      emailService.sendCardLinkConfirmation.mockResolvedValue(true);

      // Act
      const result = await authService.linkCardToAccount('20230001', 'CARD123');

      // Assert
      expect(result).toBe(true);
      expect(etudiantRepository.updateIdCarte).toHaveBeenCalledWith('etudiant-1', 'CARD123');
      expect(emailService.sendCardLinkConfirmation).toHaveBeenCalled();
    });

    it('devrait rejeter si l\'étudiant n\'existe pas', async () => {
      // Arrange
      etudiantRepository.findByMatricule.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.linkCardToAccount('invalid', 'CARD123')
      ).rejects.toThrow(AppError);
    });

    it('devrait rejeter si le compte n\'est pas activé', async () => {
      // Arrange
      const mockEtudiant = {
        Utilisateur: { motDePasseHash: null }
      };
      etudiantRepository.findByMatricule.mockResolvedValue(mockEtudiant);

      // Act & Assert
      await expect(
        authService.linkCardToAccount('20230001', 'CARD123')
      ).rejects.toThrow(AppError);
    });

    it('devrait rejeter si la carte est déjà utilisée', async () => {
      // Arrange
      const mockEtudiant = {
        Utilisateur: { motDePasseHash: 'hashed' }
      };
      etudiantRepository.findByMatricule.mockResolvedValue(mockEtudiant);
      etudiantRepository.findByIdCarte.mockResolvedValue({ id: 'autre-etudiant' });

      // Act & Assert
      await expect(
        authService.linkCardToAccount('20230001', 'CARD123')
      ).rejects.toThrow(AppError);
    });
  });
});
