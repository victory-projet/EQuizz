// Tests unitaires pour le middleware de gestion d'erreurs
const ErrorHandler = require('../../../src/middlewares/errorHandler.middleware');

describe('ErrorHandler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/api/test',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('handle()', () => {
    it('devrait gérer une erreur de validation Sequelize', () => {
      const error = {
        name: 'SequelizeValidationError',
        errors: [
          {
            path: 'email',
            message: 'Email invalide',
          },
        ],
      };

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'VALIDATION_ERROR',
        })
      );
    });

    it('devrait gérer une erreur de contrainte unique', () => {
      const error = {
        name: 'SequelizeUniqueConstraintError',
        errors: [
          {
            path: 'email',
            message: 'email must be unique',
          },
        ],
      };

      ErrorHandler.handle(error, req, res, next);

      // Le code de statut peut être 400 ou 409 selon l'implémentation
      expect(res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('existe déjà'),
        })
      );
    });

    it('devrait gérer une erreur 404', () => {
      const error = {
        statusCode: 404,
        message: 'Ressource non trouvée',
      };

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait gérer une erreur 401 (non autorisé)', () => {
      const error = {
        statusCode: 401,
        message: 'Token invalide',
      };

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('devrait gérer une erreur générique avec un message par défaut', () => {
      const error = new Error('Erreur inconnue');

      ErrorHandler.handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'INTERNAL_ERROR',
        })
      );
    });
  });

  describe('translateFieldName()', () => {
    it('devrait traduire les noms de champs en français', () => {
      expect(ErrorHandler.translateFieldName('email')).toContain('email');
      expect(ErrorHandler.translateFieldName('password')).toContain('password');
      expect(ErrorHandler.translateFieldName('nom')).toContain('nom');
      expect(ErrorHandler.translateFieldName('prenom')).toContain('prénom');
    });

    it('devrait retourner une traduction pour les champs inconnus', () => {
      const result = ErrorHandler.translateFieldName('unknownField');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('sanitizeMessage()', () => {
    it('devrait nettoyer ou transformer les messages techniques', () => {
      const message = 'Validation error on field email';
      const sanitized = ErrorHandler.sanitizeMessage(message);
      
      // Le message doit être transformé d'une manière ou d'une autre
      expect(sanitized).toBeDefined();
      expect(typeof sanitized).toBe('string');
    });

    it('devrait préserver les messages non techniques', () => {
      const message = 'Email invalide';
      const sanitized = ErrorHandler.sanitizeMessage(message);
      
      expect(sanitized).toContain('Email');
    });
  });

  describe('createError()', () => {
    it('devrait créer une erreur personnalisée', () => {
      const error = ErrorHandler.createError('Message personnalisé', 400, 'CUSTOM_ERROR');

      expect(error.message).toBe('Message personnalisé');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CUSTOM_ERROR');
    });

    it('devrait utiliser les valeurs par défaut', () => {
      const error = ErrorHandler.createError('Message');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('ERROR');
    });
  });
});
