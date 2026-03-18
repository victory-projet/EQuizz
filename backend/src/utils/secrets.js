const fs = require('fs');
const path = require('path');

/**
 * Lit un secret depuis /run/secrets/ ou depuis les variables d'environnement.
 * Priorité aux fichiers de secrets Docker.
 * 
 * @param {string} secretName Le nom du secret (ex: 'DB_PASSWORD')
 * @param {string} defaultValue Valeur par défaut si le secret n'est pas trouvé
 * @returns {string} La valeur du secret
 */
function getSecret(secretName, defaultValue = null) {
  // Chemin standard pour les secrets Docker
  const secretPath = `/run/secrets/${secretName.toLowerCase()}`;
  
  try {
    if (fs.existsSync(secretPath)) {
      return fs.readFileSync(secretPath, 'utf8').trim();
    }
  } catch (err) {
    console.warn(`⚠️ Erreur lors de la lecture du secret Docker "${secretName}":`, err.message);
  }

  // Fallback sur les variables d'environnement
  return process.env[secretName] || defaultValue;
}

module.exports = { getSecret };
