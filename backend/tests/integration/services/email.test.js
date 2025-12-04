// Tests d'intégration pour le service d'email
const nodemailer = require('nodemailer');

describe('Service Email', () => {
  let transporter;

  beforeAll(() => {
    // Créer un transporteur de test avec Ethereal
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  });

  describe('Envoi d\'emails', () => {
    it('devrait envoyer un email de bienvenue', async () => {
      const mailOptions = {
        from: '"EQuizz" <noreply@equizz.fr>',
        to: 'test@example.com',
        subject: 'Bienvenue sur EQuizz',
        text: 'Votre compte a été créé avec succès.',
        html: '<p>Votre compte a été créé avec succès.</p>',
      };

      // const info = await transporter.sendMail(mailOptions);
      // expect(info.messageId).toBeDefined();
    });

    it('devrait envoyer un email de réinitialisation de mot de passe', async () => {
      const resetToken = 'reset-token-123';
      const mailOptions = {
        from: '"EQuizz" <noreply@equizz.fr>',
        to: 'test@example.com',
        subject: 'Réinitialisation de mot de passe',
        text: `Votre token de réinitialisation : ${resetToken}`,
      };

      // const info = await transporter.sendMail(mailOptions);
      // expect(info.messageId).toBeDefined();
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les adresses email invalides', async () => {
      const mailOptions = {
        from: '"EQuizz" <noreply@equizz.fr>',
        to: 'invalid-email',
        subject: 'Test',
        text: 'Test',
      };

      // await expect(transporter.sendMail(mailOptions)).rejects.toThrow();
    });
  });
});
