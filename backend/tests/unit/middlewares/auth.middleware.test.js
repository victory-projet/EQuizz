// backend/tests/unit/middlewares/auth.middleware.test.js

const { authenticate, isAdmin } = require('../../../src/middlewares/auth.middleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticate', () => {
    
    it('devrait authentifier un utilisateur avec un token valide', () => {
      // Arrange
      const mockPayload = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'etudiant'
      };

      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockPayload);
      });

      // Act
      authenticate(req, res, next);

      // Assert
      expect(req.user).toEqual(mockPayload);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('devrait rejeter sans token', () => {
      // Act
      authenticate(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('devrait rejeter avec un token invalide', () => {
      // Arrange
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      // Act
      authenticate(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    // Test supprimé car le middleware ne vérifie pas l'existence de l'utilisateur en base
  });

  describe('isAdmin', () => {
    
    it('devrait autoriser un administrateur', () => {
      // Arrange
      req.user = {
        Administrateur: { id: 'admin-123' }
      };

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('devrait rejeter un non-administrateur', () => {
      // Arrange
      req.user = {
        role: 'etudiant'
      };

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
    });

    it('devrait rejeter sans utilisateur', () => {
      // Arrange
      req.user = null;

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
    });
  });
});
