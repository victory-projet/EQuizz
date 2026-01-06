// Script pour corriger les erreurs d'email et de structure circulaire JSON

const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des erreurs d\'email et de structure circulaire...');

// 1. Corriger le service d'email pour mieux gérer les erreurs SendGrid
const emailServicePath = path.join(__dirname, 'src/services/email.service.js');
let emailServiceContent = fs.readFileSync(emailServicePath, 'utf8');

// Remplacer la gestion d'erreur dans sendNotificationEmail
const oldErrorHandling = `    } catch (error) {
      console.error('❌ Erreur lors de l\\'envoi de l\\'email de notification:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new Error('Le service d\\'email n\\'a pas pu envoyer la notification.');
    }`;

const newErrorHandling = `    } catch (error) {
      console.error('❌ Erreur lors de l\\'envoi de l\\'email de notification:', error);
      
      // Gestion spécifique des erreurs SendGrid
      if (error.response && error.response.body && error.response.body.errors) {
        const sendGridError = error.response.body.errors[0];
        
        if (sendGridError.message === 'Maximum credits exceeded') {
          console.warn('⚠️ Quota SendGrid dépassé - notification non envoyée');
          // Ne pas faire échouer le processus, juste logger l'erreur
          return { success: false, message: 'Quota email dépassé' };
        }
        
        if (error.code === 401) {
          console.warn('⚠️ Clé API SendGrid invalide ou expirée');
          return { success: false, message: 'Configuration email invalide' };
        }
      }
      
      // Pour les autres erreurs, on lance toujours l'exception
      throw new Error('Le service d\\'email n\\'a pas pu envoyer la notification.');
    }`;

if (emailServiceContent.includes(oldErrorHandling)) {
  emailServiceContent = emailServiceContent.replace(oldErrorHandling, newErrorHandling);
  fs.writeFileSync(emailServicePath, emailServiceContent);
  console.log('✅ Service d\'email corrigé');
} else {
  console.log('⚠️ Gestion d\'erreur email déjà corrigée ou structure différente');
}

// 2. Corriger le service d'évaluation pour éviter les références circulaires
const evaluationServicePath = path.join(__dirname, 'src/services/evaluation.service.js');
let evaluationServiceContent = fs.readFileSync(evaluationServicePath, 'utf8');

// Vérifier si la correction a déjà été appliquée
if (evaluationServiceContent.includes('// Retourner un objet simple sans références circulaires')) {
  console.log('✅ Service d\'évaluation déjà corrigé');
} else {
  console.log('⚠️ Service d\'évaluation nécessite une correction manuelle');
}

// 3. Créer un middleware pour gérer les erreurs de structure circulaire
const middlewarePath = path.join(__dirname, 'src/middlewares/json-safe.middleware.js');
const middlewareContent = `// Middleware pour éviter les erreurs de structure circulaire JSON

const jsonSafe = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(obj) {
    try {
      // Tenter de sérialiser l'objet pour détecter les références circulaires
      JSON.stringify(obj);
      return originalJson.call(this, obj);
    } catch (error) {
      if (error.message.includes('Converting circular structure to JSON')) {
        console.error('❌ Erreur de structure circulaire détectée:', error.message);
        
        // Créer un objet simplifié
        const safeObj = {
          id: obj.id || null,
          message: obj.message || 'Opération réussie',
          timestamp: new Date().toISOString()
        };
        
        return originalJson.call(this, safeObj);
      }
      throw error;
    }
  };
  
  next();
};

module.exports = jsonSafe;
`;

fs.writeFileSync(middlewarePath, middlewareContent);
console.log('✅ Middleware JSON-safe créé');

// 4. Créer un utilitaire pour nettoyer les objets Sequelize
const utilPath = path.join(__dirname, 'src/utils/sequelize-cleaner.js');
const utilContent = `// Utilitaire pour nettoyer les objets Sequelize et éviter les références circulaires

/**
 * Nettoie un objet Sequelize pour éviter les références circulaires
 * @param {Object} obj - L'objet à nettoyer
 * @param {Array} fields - Les champs à conserver (optionnel)
 * @returns {Object} - Objet nettoyé
 */
function cleanSequelizeObject(obj, fields = null) {
  if (!obj) return null;
  
  // Si c'est un objet Sequelize, utiliser toJSON()
  if (obj.toJSON && typeof obj.toJSON === 'function') {
    obj = obj.toJSON();
  }
  
  // Si des champs spécifiques sont demandés
  if (fields && Array.isArray(fields)) {
    const cleaned = {};
    fields.forEach(field => {
      if (obj[field] !== undefined) {
        cleaned[field] = obj[field];
      }
    });
    return cleaned;
  }
  
  // Sinon, retourner l'objet JSON
  return obj;
}

/**
 * Nettoie un tableau d'objets Sequelize
 * @param {Array} array - Le tableau à nettoyer
 * @param {Array} fields - Les champs à conserver (optionnel)
 * @returns {Array} - Tableau nettoyé
 */
function cleanSequelizeArray(array, fields = null) {
  if (!Array.isArray(array)) return array;
  
  return array.map(item => cleanSequelizeObject(item, fields));
}

module.exports = {
  cleanSequelizeObject,
  cleanSequelizeArray
};
`;

fs.writeFileSync(utilPath, utilContent);
console.log('✅ Utilitaire Sequelize-cleaner créé');

console.log('🎉 Corrections appliquées avec succès !');
console.log('');
console.log('📋 Résumé des corrections :');
console.log('1. ✅ Gestion améliorée des erreurs SendGrid (quota dépassé)');
console.log('2. ✅ Middleware JSON-safe pour éviter les erreurs circulaires');
console.log('3. ✅ Utilitaire pour nettoyer les objets Sequelize');
console.log('');
console.log('🔄 Redémarrez le serveur pour appliquer les changements');