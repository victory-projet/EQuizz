// backend/tests/unit/utils/AppError.test.js

const AppError = require('../../../src/utils/AppError');

describe('AppError', () => {
  
  it('devrait créer une erreur avec message, statusCode et code', () => {
    // Act
    const error = new AppError('Test error', 400, 'TEST_ERROR');

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.isOperational).toBe(true);
  });

  it('devrait créer une erreur badRequest', () => {
    // Act
    const error = AppError.badRequest('Bad request', 'BAD_REQUEST');

    // Assert
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error.code).toBe('BAD_REQUEST');
  });

  it('devrait créer une erreur unauthorized', () => {
    // Act
    const error = AppError.unauthorized('Unauthorized', 'UNAUTHORIZED');

    // Assert
    expect(error.statusCode).toBe(401);
  });

  it('devrait créer une erreur forbidden', () => {
    // Act
    const error = AppError.forbidden('Forbidden', 'FORBIDDEN');

    // Assert
    expect(error.statusCode).toBe(403);
  });

  it('devrait créer une erreur notFound', () => {
    // Act
    const error = AppError.notFound('Not found', 'NOT_FOUND');

    // Assert
    expect(error.statusCode).toBe(404);
  });

  it('devrait créer une erreur conflict', () => {
    // Act
    const error = AppError.conflict('Conflict', 'CONFLICT');

    // Assert
    expect(error.statusCode).toBe(409);
  });

  it('devrait créer une erreur internal', () => {
    // Act
    const error = AppError.internal('Internal error', 'INTERNAL_ERROR');

    // Assert
    expect(error.statusCode).toBe(500);
  });
});
