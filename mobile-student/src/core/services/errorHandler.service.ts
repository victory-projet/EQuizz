/**
 * Service de gestion centralisée des erreurs
 * Transforme les erreurs techniques en messages utilisateur conviviaux
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  code?: string;
}

export class ErrorHandlerService {
  /**
   * Transforme une erreur en message convivial pour l'utilisateur
   */
  static handleError(error: unknown): UserFriendlyError {
    // Erreur réseau
    if (this.isNetworkError(error)) {
      return {
        title: 'Problème de connexion',
        message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.',
        code: 'NETWORK_ERROR'
      };
    }

    // Erreur d'authentification
    if (this.isAuthError(error)) {
      return {
        title: 'Authentification requise',
        message: 'Votre session a expiré. Veuillez vous reconnecter.',
        code: 'AUTH_ERROR'
      };
    }

    // Erreur de validation
    if (this.isValidationError(error)) {
      return {
        title: 'Données invalides',
        message: this.extractValidationMessage(error),
        code: 'VALIDATION_ERROR'
      };
    }

    // Erreur 404
    if (this.is404Error(error)) {
      return {
        title: 'Ressource introuvable',
        message: 'Les informations demandées sont introuvables.',
        code: 'NOT_FOUND'
      };
    }

    // Erreur serveur (500)
    if (this.isServerError(error)) {
      return {
        title: 'Erreur du serveur',
        message: 'Une erreur temporaire est survenue. Veuillez réessayer dans quelques instants.',
        code: 'SERVER_ERROR'
      };
    }

    // Erreur avec message personnalisé du backend
    if (this.hasCustomMessage(error)) {
      return {
        title: 'Erreur',
        message: this.extractCustomMessage(error),
        code: 'CUSTOM_ERROR'
      };
    }

    // Erreur générique
    return {
      title: 'Erreur',
      message: 'Une erreur inattendue est survenue. Veuillez réessayer.',
      code: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Vérifie si c'est une erreur réseau
   */
  private static isNetworkError(error: any): boolean {
    return (
      error?.message?.includes('Network request failed') ||
      error?.message?.includes('Network Error') ||
      error?.code === 'ECONNABORTED' ||
      error?.code === 'ENOTFOUND' ||
      error?.code === 'ECONNREFUSED' ||
      !error?.response
    );
  }

  /**
   * Vérifie si c'est une erreur d'authentification
   */
  private static isAuthError(error: any): boolean {
    return error?.response?.status === 401 || error?.response?.status === 403;
  }

  /**
   * Vérifie si c'est une erreur de validation
   */
  private static isValidationError(error: any): boolean {
    return (
      error?.response?.status === 400 ||
      error?.response?.status === 422 ||
      error?.response?.data?.errors
    );
  }

  /**
   * Vérifie si c'est une erreur 404
   */
  private static is404Error(error: any): boolean {
    return error?.response?.status === 404;
  }

  /**
   * Vérifie si c'est une erreur serveur
   */
  private static isServerError(error: any): boolean {
    const status = error?.response?.status;
    return status >= 500 && status < 600;
  }

  /**
   * Vérifie si l'erreur contient un message personnalisé
   */
  private static hasCustomMessage(error: any): boolean {
    return !!(
      error?.response?.data?.message ||
      error?.message
    );
  }

  /**
   * Extrait le message de validation
   */
  private static extractValidationMessage(error: any): string {
    // Si c'est un tableau d'erreurs de validation
    if (Array.isArray(error?.response?.data?.errors)) {
      const firstError = error.response.data.errors[0];
      return firstError?.msg || firstError?.message || 'Les données fournies sont invalides.';
    }

    // Si c'est un objet d'erreurs
    if (error?.response?.data?.errors && typeof error.response.data.errors === 'object') {
      const firstKey = Object.keys(error.response.data.errors)[0];
      return error.response.data.errors[firstKey];
    }

    return error?.response?.data?.message || 'Les données fournies sont invalides.';
  }

  /**
   * Extrait le message personnalisé
   */
  private static extractCustomMessage(error: any): string {
    // Priorité au message du backend
    if (error?.response?.data?.message) {
      return this.sanitizeMessage(error.response.data.message);
    }

    // Sinon le message de l'erreur
    if (error?.message) {
      return this.sanitizeMessage(error.message);
    }

    return 'Une erreur est survenue.';
  }

  /**
   * Nettoie le message pour éviter d'afficher des détails techniques
   */
  private static sanitizeMessage(message: string): string {
    // Liste des patterns techniques à masquer
    const technicalPatterns = [
      /Error:/gi,
      /Exception:/gi,
      /Stack trace:/gi,
      /at \w+\./gi,
      /\[object Object\]/gi,
      /undefined/gi,
      /null/gi,
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

    return sanitized.trim() || 'Une erreur est survenue.';
  }

  /**
   * Log l'erreur pour le debugging (en développement uniquement)
   */
  static logError(error: unknown, context?: string): void {
    if (__DEV__) {
      console.error(`[ErrorHandler${context ? ` - ${context}` : ''}]:`, error);
    }
  }
}
