const { body, validationResult } = require('express-validator');

const claimAccountValidationRules = () => {
  return [
    body('email').isEmail().withMessage('Doit être un email valide.'),
    body('matricule').notEmpty().withMessage('Le matricule est requis.'),
    body('classeId').isUUID().withMessage('L\'ID de la classe est invalide.'),
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
};