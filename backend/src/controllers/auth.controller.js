const authService = require('../services/auth.service');

class AuthController {
  async claimAccount(req, res) {
    try {
      const { matricule, email, classeId } = req.body;
      await authService.processAccountClaim(matricule, email, classeId);
      res.status(200).json({ message: 'Si vos informations sont valides, vous recevrez un email avec vos identifiants de connexion.' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();