// backend/src/utils/matriculeGenerator.js

const db = require('../models');

/**
 * Génère un matricule unique pour un étudiant
 * Format moderne: ECOLE-ANNEE-NUMERO
 * Exemples: SJING-2024-001, SJING-2024-002, POLYT-2024-001, etc.
 * 
 * Ce format assure:
 * - Identification claire de l'école d'origine
 * - Traçabilité par année académique
 * - Unicité par école et année
 * - Lisibilité pour les étudiants et l'administration
 * 
 * @param {string} ecoleId - ID de l'école
 * @param {string} anneeAcademiqueId - ID de l'année académique
 * @returns {Promise<string>} - Matricule généré
 */
async function genererMatricule(ecoleId, anneeAcademiqueId) {
  try {
    // 1. Récupérer les informations de l'école
    const ecole = await db.Ecole.findByPk(ecoleId);
    if (!ecole) {
      throw new Error('École non trouvée');
    }

    // 2. Récupérer l'année académique
    const anneeAcademique = await db.AnneeAcademique.findByPk(anneeAcademiqueId);
    if (!anneeAcademique) {
      throw new Error('Année académique non trouvée');
    }

    // 3. Extraire le code de l'école (ex: "Saint Jean Ingénieur" -> "SJING")
    const codeEcole = genererCodeEcole(ecole.nom);

    // 4. Extraire l'année (ex: "2023-2024" -> "2024")
    const annee = extraireAnnee(anneeAcademique.nom);

    // 5. Trouver le prochain numéro séquentiel pour cette école et cette année
    const prefixe = `${codeEcole}-${annee}`;
    
    // Compter les étudiants existants avec ce préfixe
    const count = await db.Etudiant.count({
      where: {
        matricule: {
          [db.Sequelize.Op.like]: `${prefixe}-%`
        }
      }
    });

    // 6. Générer le numéro avec padding (001, 002, etc.)
    const numero = String(count + 1).padStart(3, '0');

    // 7. Construire le matricule final
    const matricule = `${prefixe}-${numero}`;

    // 8. Vérifier l'unicité (sécurité supplémentaire)
    const existe = await matriculeExiste(matricule);
    if (existe) {
      // Si par hasard le matricule existe déjà, réessayer avec le suivant
      const countExact = await db.Etudiant.count({
        where: {
          matricule: {
            [db.Sequelize.Op.like]: `${prefixe}-%`
          }
        }
      });
      const nouveauNumero = String(countExact + 1).padStart(3, '0');
      return `${prefixe}-${nouveauNumero}`;
    }

    return matricule;

  } catch (error) {
    console.error('Erreur lors de la génération du matricule:', error);
    throw error;
  }
}

/**
 * Génère un code d'école à partir du nom
 * @param {string} nomEcole - Nom de l'école
 * @returns {string} - Code de l'école
 */
function genererCodeEcole(nomEcole) {
  // Cas spéciaux pour certaines écoles connues
  const casSpeciaux = {
    'SAINT JEAN INGÉNIEUR': 'SJING',
    'SAINT JEAN INGENIEUR': 'SJING',
    'POLYTECHNIQUE': 'POLYT'
  };

  const nomNormalise = nomEcole.toUpperCase();
  if (casSpeciaux[nomNormalise]) {
    return casSpeciaux[nomNormalise];
  }

  // Extraire les premières lettres de chaque mot significatif
  const mots = nomEcole
    .toUpperCase()
    .split(' ')
    .filter(mot => mot.length > 2); // Ignorer les mots courts comme "de", "la", etc.

  if (mots.length === 1) {
    // Si un seul mot, prendre les 5 premières lettres
    return mots[0].substring(0, 5);
  } else if (mots.length === 2) {
    // Si deux mots, prendre 2-3 lettres de chaque pour faire 5 au total
    const mot1 = mots[0].substring(0, 2);
    const mot2 = mots[1].substring(0, 3);
    return mot1 + mot2;
  } else if (mots.length === 3) {
    // Si trois mots, prendre 2-2-1 lettres
    const mot1 = mots[0].substring(0, 2);
    const mot2 = mots[1].substring(0, 2);
    const mot3 = mots[2].substring(0, 1);
    return mot1 + mot2 + mot3;
  } else {
    // Si plusieurs mots, prendre la première lettre de chaque mot
    return mots.map(mot => mot[0]).join('').substring(0, 5);
  }
}

/**
 * Extrait l'année de fin d'une année académique
 * @param {string} nomAnnee - Nom de l'année (ex: "2023-2024")
 * @returns {string} - Année extraite (ex: "2024")
 */
function extraireAnnee(nomAnnee) {
  // Si le format est "2023-2024", prendre la deuxième année
  const match = nomAnnee.match(/(\d{4})-(\d{4})/);
  if (match) {
    return match[2]; // Retourne "2024"
  }

  // Si le format est juste "2024", le retourner tel quel
  const matchSimple = nomAnnee.match(/(\d{4})/);
  if (matchSimple) {
    return matchSimple[1];
  }

  // Par défaut, utiliser l'année actuelle
  return new Date().getFullYear().toString();
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
 * Valide le format d'un matricule
 * @param {string} matricule - Matricule à valider
 * @returns {boolean} - True si le format est valide
 */
function validerFormatMatricule(matricule) {
  // Format moderne: ECOLE-ANNEE-NUMERO (ex: SJING-2024-001)
  // Code école: 2-5 caractères, Année: 4 chiffres, Numéro: 3 chiffres
  const formatModerne = /^[A-Z]{2,5}-\d{4}-\d{3}$/;
  
  // Formats legacy acceptés pour compatibilité
  const formatLegacy1 = /^\d{7}$/; // 2025001
  const formatLegacy2 = /^\d{4}[a-z]\d{3}$/; // 2223i032
  
  return formatModerne.test(matricule) || 
         formatLegacy1.test(matricule) || 
         formatLegacy2.test(matricule);
}

module.exports = {
  genererMatricule,
  matriculeExiste,
  genererCodeEcole,
  extraireAnnee,
  validerFormatMatricule
};