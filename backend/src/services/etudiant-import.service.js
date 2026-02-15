// backend/src/services/etudiant-import.service.js

const ExcelJS = require('exceljs');
const db = require('../models');
const AppError = require('../utils/AppError');
const { genererMatricule } = require('../utils/matriculeGenerator');

class EtudiantImportService {
  /**
   * Importe ou met à jour des étudiants depuis un fichier Excel
   * @param {Buffer} fileBuffer - Buffer du fichier Excel
   * @param {string} defaultClasseId - ID de classe par défaut (optionnel)
   * @returns {Object} Résultat de l'import avec statistiques
   */
  async importFromExcel(fileBuffer, defaultClasseId = null) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw AppError.badRequest('Le fichier Excel est vide ou invalide.', 'INVALID_EXCEL_FILE');
    }

    const results = {
      created: [],
      updated: [],
      errors: [],
      stats: {
        totalRows: 0,
        created: 0,
        updated: 0,
        errors: 0,
        skipped: 0
      }
    };

    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      rows.push({ row, rowNumber });
    });

    results.stats.totalRows = rows.length;

    for (const { row, rowNumber } of rows) {
      try {
        const rowData = this._parseRow(row, rowNumber, defaultClasseId);
        const result = await this._processStudent(rowData, rowNumber);
        
        if (result.action === 'created') {
          results.created.push(result.data);
          results.stats.created++;
        } else if (result.action === 'updated') {
          results.updated.push(result.data);
          results.stats.updated++;
        } else if (result.action === 'skipped') {
          results.stats.skipped++;
        }
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          error: error.message
        });
        results.stats.errors++;
      }
    }

    return results;
  }

  /**
   * Parse une ligne du fichier Excel
   */
  _parseRow(row, rowNumber, defaultClasseId) {
    const nom = this._getCellValue(row, 1);
    const prenom = this._getCellValue(row, 2);
    const email = this._getCellValue(row, 3);
    const matricule = this._getCellValue(row, 4);
    const idCarte = this._getCellValue(row, 5);
    const classeNom = this._getCellValue(row, 6);
    const action = this._getCellValue(row, 7) || 'UPSERT';

    // Validation des champs obligatoires
    if (!nom || !prenom || !email) {
      throw new Error('Les colonnes Nom, Prenom et Email sont obligatoires');
    }

    // Validation du format email
    if (!this._isValidEmail(email)) {
      throw new Error(`Email invalide: ${email}`);
    }

    // Validation de l'action
    const validActions = ['CREATE', 'UPDATE', 'UPSERT'];
    if (!validActions.includes(action.toUpperCase())) {
      throw new Error(`Action invalide: ${action}. Utilisez CREATE, UPDATE ou UPSERT`);
    }

    return {
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim().toLowerCase(),
      matricule: matricule ? matricule.trim() : null,
      idCarte: idCarte ? idCarte.trim() : null,
      classeNom: classeNom ? classeNom.trim() : null,
      classeId: defaultClasseId,
      action: action.toUpperCase()
    };
  }

  /**
   * Traite un étudiant (création ou mise à jour)
   */
  async _processStudent(data, rowNumber) {
    const transaction = await db.sequelize.transaction();

    try {
      // Résoudre la classe
      let classeId = data.classeId;
      if (data.classeNom) {
        const classe = await db.Classe.findOne({
          where: { nom: data.classeNom }
        });
        if (!classe) {
          throw new Error(`Classe non trouvée: ${data.classeNom}`);
        }
        classeId = classe.id;
      }

      if (!classeId) {
        throw new Error('Aucune classe spécifiée');
      }

      // Vérifier si l'étudiant existe (par email ou matricule)
      const existingUser = await db.Utilisateur.findOne({
        where: { email: data.email },
        include: [{ model: db.Etudiant }]
      });

      let existingByMatricule = null;
      if (data.matricule) {
        existingByMatricule = await db.Etudiant.findOne({
          where: { matricule: data.matricule },
          include: [{ model: db.Utilisateur }]
        });
      }

      // Déterminer l'action à effectuer
      const exists = existingUser || existingByMatricule;

      if (data.action === 'CREATE' && exists) {
        throw new Error('L\'étudiant existe déjà (utilisez UPDATE ou UPSERT)');
      }

      if (data.action === 'UPDATE' && !exists) {
        throw new Error('L\'étudiant n\'existe pas (utilisez CREATE ou UPSERT)');
      }

      let result;
      if (exists) {
        // Mise à jour
        result = await this._updateStudent(existingUser || existingByMatricule.Utilisateur, data, classeId, transaction);
        await transaction.commit();
        return { action: 'updated', data: result };
      } else {
        // Création
        result = await this._createStudent(data, classeId, transaction);
        await transaction.commit();
        return { action: 'created', data: result };
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Crée un nouvel étudiant
   */
  async _createStudent(data, classeId, transaction) {
    // Récupérer la classe avec ses relations
    const classe = await db.Classe.findByPk(classeId, {
      include: [
        { model: db.Ecole },
        { model: db.AnneeAcademique }
      ]
    });

    if (!classe) {
      throw new Error('Classe non trouvée');
    }

    // Générer ou utiliser le matricule fourni
    let matricule = data.matricule;
    if (!matricule) {
      matricule = await genererMatricule(classe.ecole_id, classe.anneeAcademiqueId);
    } else {
      // Vérifier l'unicité du matricule
      const existingMatricule = await db.Etudiant.findOne({
        where: { matricule }
      });
      if (existingMatricule) {
        throw new Error(`Le matricule ${matricule} existe déjà`);
      }
    }

    // Créer l'utilisateur
    const utilisateur = await db.Utilisateur.create({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      motDePasseHash: null,
      estActif: true
    }, { transaction });

    // Créer l'étudiant
    const etudiant = await db.Etudiant.create({
      id: utilisateur.id,
      matricule,
      idCarte: data.idCarte,
      classe_id: classeId
    }, { transaction });

    // Créer l'entrée dans l'historique
    await db.HistoriqueEtudiant.create({
      etudiant_id: etudiant.id,
      matricule: matricule,
      ecole_id: classe.ecole_id,
      classe_id: classeId,
      dateDebut: new Date(),
      dateFin: null,
      estPeriodeActuelle: true
    }, { transaction });

    return {
      id: etudiant.id,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      matricule,
      idCarte: data.idCarte,
      classe: classe.nom
    };
  }

  /**
   * Met à jour un étudiant existant
   */
  async _updateStudent(utilisateur, data, classeId, transaction) {
    // Mettre à jour l'utilisateur
    await utilisateur.update({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email
    }, { transaction });

    // Récupérer l'étudiant
    const etudiant = await db.Etudiant.findByPk(utilisateur.id);
    if (!etudiant) {
      throw new Error('Profil étudiant non trouvé');
    }

    // Préparer les mises à jour
    const updates = {};
    
    if (data.idCarte !== null) {
      updates.idCarte = data.idCarte;
    }

    // Vérifier si changement de classe
    if (classeId && classeId !== etudiant.classe_id) {
      const nouvelleClasse = await db.Classe.findByPk(classeId, {
        include: [{ model: db.Ecole }]
      });

      const ancienneClasse = await db.Classe.findByPk(etudiant.classe_id, {
        include: [{ model: db.Ecole }]
      });

      const estChangementEcole = ancienneClasse.ecole_id !== nouvelleClasse.ecole_id;

      // Si changement d'école, générer nouveau matricule
      if (estChangementEcole) {
        const nouveauMatricule = await genererMatricule(
          nouvelleClasse.ecole_id,
          nouvelleClasse.anneeAcademiqueId
        );
        updates.matricule = nouveauMatricule;

        // Clôturer l'historique actuel
        await db.HistoriqueEtudiant.update(
          {
            dateFin: new Date(),
            estPeriodeActuelle: false
          },
          {
            where: {
              etudiant_id: etudiant.id,
              estPeriodeActuelle: true
            },
            transaction
          }
        );

        // Créer nouvelle entrée historique
        await db.HistoriqueEtudiant.create({
          etudiant_id: etudiant.id,
          matricule: nouveauMatricule,
          ecole_id: nouvelleClasse.ecole_id,
          classe_id: classeId,
          dateDebut: new Date(),
          dateFin: null,
          estPeriodeActuelle: true
        }, { transaction });
      }

      updates.classe_id = classeId;
    }

    // Appliquer les mises à jour
    if (Object.keys(updates).length > 0) {
      await etudiant.update(updates, { transaction });
    }

    const classe = await db.Classe.findByPk(etudiant.classe_id);

    return {
      id: etudiant.id,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      matricule: etudiant.matricule,
      idCarte: etudiant.idCarte,
      classe: classe.nom
    };
  }

  /**
   * Récupère la valeur d'une cellule
   */
  _getCellValue(row, colNumber) {
    const cell = row.getCell(colNumber);
    const value = cell.value;
    
    if (value === null || value === undefined) {
      return null;
    }
    
    if (typeof value === 'object' && value.text) {
      return value.text;
    }
    
    return String(value).trim();
  }

  /**
   * Valide le format d'un email
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide le fichier Excel avant import (dry-run)
   */
  async validateExcel(fileBuffer, defaultClasseId = null) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw AppError.badRequest('Le fichier Excel est vide ou invalide.', 'INVALID_EXCEL_FILE');
    }

    const validations = {
      valid: [],
      errors: [],
      warnings: []
    };

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      try {
        const rowData = this._parseRow(row, rowNumber, defaultClasseId);
        validations.valid.push({
          row: rowNumber,
          data: rowData
        });
      } catch (error) {
        validations.errors.push({
          row: rowNumber,
          error: error.message
        });
      }
    });

    return validations;
  }
}

module.exports = new EtudiantImportService();
