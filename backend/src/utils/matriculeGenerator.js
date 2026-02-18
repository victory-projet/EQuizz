// backend/src/utils/matriculeGenerator.js

const db = require('../models');

/**
 * Génère un matricule universitaire unique
 * Format: UNIV-ANNEE-NUMERO (ex: UNIV-2024-00123)
 * @returns {Promise<string>} - Matricule universitaire généré
 */
async function genererMatriculeUniv() {
  try {
    const annee = new Date().getFullYear().toString();
    const prefixe = `UNIV-${annee}`;

    // Compter les étudiants existants avec ce préfixe au niveau universitaire
    const count = await db.Etudiant.count({
      where: {
        matriculeUniv: {
          [db.Sequelize.Op.like]: `${prefixe}-%`
        }
      }
    });

    const numero = String(count + 1).padStart(5, '0');
    const matriculeUniv = `${prefixe}-${numero}`;

    // Vérification d'unicité
    const existe = await db.Etudiant.findOne({ where: { matriculeUniv } });
    if (existe) {
      const countExact = await db.Etudiant.count({
        where: {
          matriculeUniv: {
            [db.Sequelize.Op.like]: `${prefixe}-%`
          }
        }
      });
      const nouveauNumero = String(countExact + 1).padStart(5, '0');
      return `${prefixe}-${nouveauNumero}`;
    }

    return matriculeUniv;
  } catch (error) {
    console.error('Erreur lors de la génération du matricule universitaire:', error);
    throw error;
  }
}

/**
 * Vérifie si un matricule existe déjà
 * @param {string} matricule - Matricule à vérifier
 * @returns {Promise<boolean>} - True si le matricule existe
 */
async function matriculeExiste(matricule) {
  const count = await db.Etudiant.count({
    where: { matricule }
  });
  return count > 0;
}

/**
 * Valide le format d'un matricule universitaire
 * @param {string} matricule - Matricule à valider
 * @returns {boolean} - True si le format est valide
 */
function validerFormatMatriculeUniv(matricule) {
  // Format: UNIV-ANNEE-NUMERO (ex: UNIV-2024-00123)
  const formatUniv = /^UNIV-\d{4}-\d{5}$/;
  return formatUniv.test(matricule);
}

module.exports = {
  genererMatriculeUniv,
  matriculeExiste,
  validerFormatMatriculeUniv
};