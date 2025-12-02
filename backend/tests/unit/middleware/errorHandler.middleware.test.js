// Tests unitaires pour le middleware de gestion d'erreurs
const errorHandler = require('../../../src/middlewares/errorHandler.middleware');

describe('ErrorHandler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/api/test',
      originalUrl: '/api/test',
      body: {},
      params: {},
      query: {}
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

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Erreur de validation',
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

      errorHandler(error, req, res, next);

      // Le code de statut peut être 400 ou 409 selon l'implémentation
      expect(res.status).toHaveBeenCalledWith(409);
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

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait gérer une erreur 401 (non autorisé)', () => {
      const error = {
        statusCode: 401,
        message: 'Token invalide',
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('devrait gérer une erreur générique avec un message par défaut', () => {
      const error = new Error('Erreur inconnue');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Erreur inconnue',
        })
      );
    });
  });
});
