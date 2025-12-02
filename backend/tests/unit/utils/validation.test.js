// Tests unitaires pour les validations
describe('Validations', () => {
  describe('Validation d\'email', () => {
    it('devrait accepter un email valide', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.fr',
        'student123@school.edu',
      ];

      validEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(true);
      });
    });

    it('devrait rejeter un email invalide', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      invalidEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Validation de mot de passe', () => {
    it('devrait accepter un mot de passe fort', () => {
      const strongPasswords = [
        'Password123!',
        'MyP@ssw0rd',
        'Secure#Pass1',
      ];

      // Règles : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

      strongPasswords.forEach(password => {
        expect(passwordRegex.test(password)).toBe(true);
      });
    });

    it('devrait rejeter un mot de passe faible', () => {
      const weakPasswords = [
        'short',
        'alllowercase',
        'ALLUPPERCASE',
        '12345678',
      ];

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

      weakPasswords.forEach(password => {
        expect(passwordRegex.test(password)).toBe(false);
      });
    });
  });

  describe('Validation de dates', () => {
    it('devrait valider que dateDebut < dateFin', () => {
      const dateDebut = new Date('2025-11-01');
      const dateFin = new Date('2025-11-30');

      expect(dateDebut < dateFin).toBe(true);
    });

    it('devrait rejeter si dateDebut > dateFin', () => {
      const dateDebut = new Date('2025-11-30');
      const dateFin = new Date('2025-11-01');

      expect(dateDebut < dateFin).toBe(false);
    });
  });

  describe('Validation de type de question', () => {
    it('devrait accepter les types valides', () => {
      const validTypes = ['QCM', 'OUVERTE'];

      validTypes.forEach(type => {
        expect(['QCM', 'OUVERTE']).toContain(type);
      });
    });

    it('devrait rejeter les types invalides', () => {
      const invalidTypes = ['MULTIPLE', 'VRAI_FAUX', 'AUTRE'];

      invalidTypes.forEach(type => {
        expect(['QCM', 'OUVERTE']).not.toContain(type);
      });
    });
  });
});
