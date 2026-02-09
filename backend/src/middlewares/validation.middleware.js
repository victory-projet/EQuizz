const { body, validationResult } = require('express-validator');

const claimAccountValidationRules = () => {
  return [
    body('email').isEmail().withMessage('Doit être un email valide.'),
    body('matricule').notEmpty().withMessage('Le matricule est requis.'),
    body('classeId').isUUID().withMessage('L\'ID de la classe est invalide.'),
  ];
};

const loginValidationRules = () => {
  return [
    // La validation vérifie qu'au moins l'un des deux champs est présent.
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.matricule) {
        throw new Error('Le champ email ou matricule est requis.');
      }
      return true;
    }),
    body('motDePasse').notEmpty().withMessage('Le mot de passe est requis.'),
  ];
};

const ecoleValidationRules = () => {
  return [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom de l\'école est requis.')
      .isString().withMessage('Le nom doit être une chaîne de caractères.')
      .isLength({ min: 3, max: 100 }).withMessage('Le nom doit contenir entre 3 et 100 caractères.'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

module.exports = {
  claimAccountValidationRules,
  validate,
  loginValidationRules,
  ecoleValidationRules,
};