/**
 * Middleware de gestion centralisée des erreurs
 * Transforme les erreurs techniques en réponses JSON conviviales
 * SÉCURISÉ : Aucun détail technique n'est exposé au client
 */

class ErrorHandler {
  /**
   * Middleware Express pour gérer toutes les erreurs
   */
  static handle(err, req, res, _next) {
    // Logger l'erreur pour le debugging (serveur uniquement)
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
      });
    } else {
      // En production, log minimal sans données sensibles
      console.error('❌ Error:', {
        name: err.name,
        message: err.message,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
    }

    // Déterminer le type d'erreur et la réponse appropriée
    const errorResponse = this.formatError(err);

    // S'assurer que les headers ne sont pas déjà envoyés
    if (res.headersSent) {
      return;
    }

    // Envoyer la réponse (JAMAIS de détails techniques en production)
    res.status(errorResponse.statusCode).json({
      success: false,
      message: errorResponse.message,
      code: errorResponse.code,
      ...(process.env.NODE_ENV === 'development' && { 
        debug: {
          name: err.name,
          originalMessage: err.message,
          stack: err.stack?.split('\n').slice(0, 3).join('\n'), // Limiter la stack trace
        }
      }),
    });
  }

  /**
   * Formate l'erreur en réponse conviviale
   */
  static formatError(err) {
    // Erreur de validation Sequelize
    if (err.name === 'SequelizeValidationError') {
      const firstError = err.errors?.[0];
      const fieldName = this.translateFieldName(firstError?.path);
      return {
        statusCode: 400,
        message: firstError?.message || `Le champ ${fieldName} est invalide.`,
        code: 'VALIDATION_ERROR',
      };
    }

    // Erreur de contrainte unique Sequelize
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = this.translateFieldName(err.errors?.[0]?.path);
      return {
        statusCode: 409,
        message: `Cette valeur existe déjà pour ${field}.`,
        code: 'DUPLICATE_ERROR',
      };
    }

    // Erreur de clé étrangère Sequelize
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return {
        statusCode: 400,
        message: 'Référence invalide. Veuillez vérifier les données.',
        code: 'FOREIGN_KEY_ERROR',
      };
    }

    // Erreur de connexion à la base de données
    if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
      return {
        statusCode: 503,
        message: 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.',
        code: 'DATABASE_ERROR',
      };
    }

    // Erreur de timeout Sequelize
    if (err.name === 'SequelizeTimeoutError') {
      return {
        statusCode: 504,
        message: 'La requête a pris trop de temps. Veuillez réessayer.',
        code: 'TIMEOUT_ERROR',
      };
    }

    // Autres erreurs Sequelize
    if (err.name?.startsWith('Sequelize')) {
      return {
        statusCode: 500,
        message: 'Une erreur de base de données est survenue. Veuillez réessayer.',
        code: 'DATABASE_ERROR',
      };
    }

    // Erreur JWT
    if (err.name === 'JsonWebTokenError') {
      return {
        statusCode: 401,
        message: 'Session invalide. Veuillez vous reconnecter.',
        code: 'TOKEN_INVALID',
      };
    }

    if (err.name === 'TokenExpiredError') {
      return {
        statusCode: 401,
        message: 'Session expirée. Veuillez vous reconnecter.',
        code: 'TOKEN_EXPIRED',
      };
    }

    // Erreur de syntaxe JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return {
        statusCode: 400,
        message: 'Format de données invalide.',
        code: 'INVALID_JSON',
      };
    }

    // Erreur de fichier trop volumineux (multer)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return {
        statusCode: 413,
        message: 'Le fichier est trop volumineux.',
        code: 'FILE_TOO_LARGE',
      };
    }

    // Erreur de type de fichier invalide (multer)
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return {
        statusCode: 400,
        message: 'Type de fichier non autorisé.',
        code: 'INVALID_FILE_TYPE',
      };
    }

    // Erreur personnalisée avec statusCode
    if (err.statusCode) {
      return {
        statusCode: err.statusCode,
        message: this.sanitizeMessage(err.message),
        code: err.code || 'CUSTOM_ERROR',
      };
    }

    // Erreur générique (masquer tous les détails)
    return {
      statusCode: 500,
      message: 'Une erreur est survenue. Veuillez réessayer.',
      code: 'INTERNAL_ERROR',
    };
  }

  /**
   * Traduit les noms de champs techniques en français
   */
  static translateFieldName(fieldName) {
    const translations = {
      email: "l'email",
      matricule: 'le matricule',
      nom: 'le nom',
      prenom: 'le prénom',
      motDePasse: 'le mot de passe',
      classe_id: 'la classe',
      cours_id: 'le cours',
      enseignant_id: "l'enseignant",
      etudiant_id: "l'étudiant",
      ecole_id: "l'école",
      annee_academique_id: "l'année académique",
      semestre_id: 'le semestre',
      evaluation_id: "l'évaluation",
      quizz_id: 'le quizz',
      question_id: 'la question',
      titre: 'le titre',
      description: 'la description',
      dateDebut: 'la date de début',
      dateFin: 'la date de fin',
      duree: 'la durée',
      noteMax: 'la note maximale',
      type: 'le type',
      niveau: 'le niveau',
    };
    return translations[fieldName] || `le champ ${fieldName}`;
  }

  /**
   * Nettoie le message pour éviter d'exposer des détails techniques
   */
  static sanitizeMessage(message) {
    if (!message) return 'Une erreur est survenue.';

    // Liste des patterns techniques à supprimer
    const technicalPatterns = [
      /SQL:.*/gi,
      /Query:.*/gi,
      /at \w+\./gi,
      /Executing \(.*\):.*/gi,
      /SequelizeDatabaseError:.*/gi,
      /Error:.*/gi,
      /Exception:.*/gi,
      /Stack trace:.*/gi,
      /\[object Object\]/gi,
    ];

    let sanitized = message;

    // Supprimer les patterns techniques
    technicalPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Limiter la longueur
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200) + '...';
    }

    sanitized = sanitized.trim();

    // Si le message est vide après nettoyage, retourner un message générique
    return sanitized || 'Une erreur est survenue.';
  }

  /**
   * Crée une erreur personnalisée
   */
  static createError(message, statusCode = 400, code = 'ERROR') {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
  }
}

module.exports = ErrorHandler;
