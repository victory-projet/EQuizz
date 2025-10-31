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

   async login(req, res) {
    try {
      const { email, matricule, motDePasse } = req.body;
      const loginIdentifier = email || matricule; // On prend l'un ou l'autre

      const { token, utilisateur } = await authService.login(loginIdentifier, motDePasse);
      
      // On ne renvoie que les informations non sensibles au client
      res.status(200).json({
        token,
        utilisateur: {
          id: utilisateur.id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          role: utilisateur.Administrateur ? 'admin' : (utilisateur.Enseignant ? 'enseignant' : 'etudiant')
        }
      });
    } catch (error) {
      res.status(401).json({ message: error.message }); // 401 Unauthorized est plus approprié ici
    }
  }
  
}

module.exports = new AuthController();