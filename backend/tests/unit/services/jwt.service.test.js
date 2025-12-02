// backend/tests/unit/services/jwt.service.test.js

const jwtService = require('../../../src/services/jwt.service');
const jwt = require('jsonwebtoken');

describe('JWTService', () => {
  
  const mockUser = {
    id: 'user-123',
    email: 'test@test.com',
    nom: 'Test',
    prenom: 'User'
  };

  describe('generateToken', () => {
    
    it('devrait générer un token JWT valide', () => {
      // Act
      const token = jwtService.generateToken(mockUser);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Vérifier que le token peut être décodé
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty('id', mockUser.id);
      expect(decoded).toHaveProperty('email', mockUser.email);
    });

    it('devrait inclure une expiration', () => {
      // Act
      const token = jwtService.generateToken(mockUser);
      const decoded = jwt.decode(token);

      // Assert
      expect(decoded).toHaveProperty('exp');
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('verifyToken', () => {
    
    it('devrait vérifier un token valide', () => {
      // Arrange
      const token = jwtService.generateToken(mockUser);

      // Act
      const decoded = jwtService.verifyToken(token);

      // Assert
      expect(decoded).toHaveProperty('id', mockUser.id);
      expect(decoded).toHaveProperty('email', mockUser.email);
    });

    it('devrait rejeter un token invalide', () => {
      // Act & Assert
      expect(() => {
        jwtService.verifyToken('invalid-token');
      }).toThrow();
    });

    it('devrait rejeter un token expiré', () => {
      // Arrange - Créer un token avec expiration immédiate
      const expiredToken = jwt.sign(
        { id: mockUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      // Act & Assert
      expect(() => {
        jwtService.verifyToken(expiredToken);
      }).toThrow();
    });
  });
});
