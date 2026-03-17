// backend/src/services/excel-import.service.js

const ExcelJS = require('exceljs');
const db = require('../models');
const bcrypt = require('bcryptjs');

class ExcelImportService {
  /**
   * Importe des écoles depuis un fichier Excel
   */
  async importEcoles(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Ecoles') || workbook.worksheets[0];
    
    const results = {
      success: 0,
      errors: [],
      created: [],
      updated: []
    };

    const dateImport = new Date();

    // Ignorer la première ligne (en-tête)
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const nom = row.getCell(1).value?.toString().trim();

      if (!nom) continue;

      try {
        const [ecole, created] = await db.Ecole.findOrCreate({
          where: { nom },
          defaults: { nom, dateImport }
        });

        if (!created) {
          await ecole.update({ dateImport });
          results.updated.push(nom);
        } else {
          results.created.push(nom);
        }
        
        results.success++;
      } catch (error) {
        results.errors.push({ row: i, nom, error: error.message });
      }
    }

    return results;
  }

  /**
   * Importe des classes depuis un fichier Excel
   */
  async importClasses(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Classes') || workbook.worksheets[0];
    
    const results = {
      success: 0,
      errors: [],
      created: [],
      updated: []
    };

    const dateImport = new Date();

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const nom = row.getCell(1).value?.toString().trim();
      const niveau = row.getCell(2).value?.toString().trim();
      const anneeAcademique = row.getCell(3).value?.toString().trim();

      if (!nom || !niveau) continue;

      try {
        let anneeAcademiqueId = null;
        if (anneeAcademique) {
          const annee = await db.AnneeAcademique.findOne({ where: { nom: anneeAcademique } });
          anneeAcademiqueId = annee?.id;
        }

        const [classe, created] = await db.Classe.findOrCreate({
          where: { nom },
          defaults: { nom, niveau, anneeAcademiqueId, dateImport }
        });

        if (!created) {
          await classe.update({ niveau, anneeAcademiqueId, dateImport });
          results.updated.push(nom);
        } else {
          results.created.push(nom);
        }
        
        results.success++;
      } catch (error) {
        results.errors.push({ row: i, nom, error: error.message });
      }
    }

    return results;
  }

  /**
   * Importe des étudiants depuis un fichier Excel
   */
  async importEtudiants(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Etudiants') || workbook.worksheets[0];
    
    const results = {
      success: 0,
      errors: [],
      created: [],
      updated: []
    };

    const dateImport = new Date();

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const matricule = row.getCell(1).value?.toString().trim();
      const nom = row.getCell(2).value?.toString().trim();
      const prenom = row.getCell(3).value?.toString().trim();
      const email = row.getCell(4).value?.toString().trim();
      const classeName = row.getCell(5).value?.toString().trim();
      const idCarte = row.getCell(6).value?.toString().trim();

      if (!matricule || !nom || !prenom || !email) continue;

      try {
        // Trouver la classe
        let classeId = null;
        if (classeName) {
          const classe = await db.Classe.findOne({ where: { nom: classeName } });
          classeId = classe?.id;
        }

        // Créer ou mettre à jour l'utilisateur
        const [utilisateur, userCreated] = await db.Utilisateur.findOrCreate({
          where: { email },
          defaults: {
            nom,
            prenom,
            email,
            motDePasse: await bcrypt.hash(matricule, 10), // Mot de passe par défaut = matricule
            role: 'etudiant',
            dateImport
          }
        });

        if (!userCreated) {
          await utilisateur.update({ nom, prenom, dateImport });
        }

        // Créer ou mettre à jour l'étudiant
        const [etudiant, etudiantCreated] = await db.Etudiant.findOrCreate({
          where: { matricule },
          defaults: {
            id: utilisateur.id,
            matricule,
            idCarte,
            classeId,
            dateImport
          }
        });

        if (!etudiantCreated) {
          await etudiant.update({ idCarte, classeId, dateImport });
          results.updated.push(matricule);
        } else {
          results.created.push(matricule);
        }
        
        results.success++;
      } catch (error) {
        results.errors.push({ row: i, matricule, error: error.message });
      }
    }

    return results;
  }

  /**
   * Importe des enseignants depuis un fichier Excel
   */
  async importEnseignants(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Enseignants') || workbook.worksheets[0];
    
    const results = {
      success: 0,
      errors: [],
      created: [],
      updated: []
    };

    const dateImport = new Date();

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const nom = row.getCell(1).value?.toString().trim();
      const prenom = row.getCell(2).value?.toString().trim();
      const email = row.getCell(3).value?.toString().trim();
      const specialite = row.getCell(4).value?.toString().trim();
      const ecoleName = row.getCell(5).value?.toString().trim();

      if (!nom || !prenom || !email) continue;

      try {
        // Trouver l'école
        let ecoleId = null;
        if (ecoleName) {
          const ecole = await db.Ecole.findOne({ where: { nom: ecoleName } });
          ecoleId = ecole?.id;
        }

        // Créer ou mettre à jour l'utilisateur
        const [utilisateur, userCreated] = await db.Utilisateur.findOrCreate({
          where: { email },
          defaults: {
            nom,
            prenom,
            email,
            motDePasse: await bcrypt.hash('Enseignant123!', 10), // Mot de passe par défaut
            role: 'enseignant',
            ecoleId,
            dateImport
          }
        });

        if (!userCreated) {
          await utilisateur.update({ nom, prenom, ecoleId, dateImport });
        }

        // Créer ou mettre à jour l'enseignant
        const [enseignant, enseignantCreated] = await db.Enseignant.findOrCreate({
          where: { id: utilisateur.id },
          defaults: {
            id: utilisateur.id,
            specialite,
            dateImport
          }
        });

        if (!enseignantCreated) {
          await enseignant.update({ specialite, dateImport });
          results.updated.push(email);
        } else {
          results.created.push(email);
        }
        
        results.success++;
      } catch (error) {
        results.errors.push({ row: i, email, error: error.message });
      }
    }

    return results;
  }

  /**
   * Importe des cours depuis un fichier Excel
   */
  async importCours(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Cours') || workbook.worksheets[0];
    
    const results = {
      success: 0,
      errors: [],
      created: [],
      updated: []
    };

    const dateImport = new Date();

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const code = row.getCell(1).value?.toString().trim();
      const nom = row.getCell(2).value?.toString().trim();
      const enseignantEmail = row.getCell(3).value?.toString().trim();
      const semestreName = row.getCell(4).value?.toString().trim();

      if (!code || !nom) continue;

      try {
        // Trouver l'enseignant
        let enseignantId = null;
        if (enseignantEmail) {
          const utilisateur = await db.Utilisateur.findOne({ where: { email: enseignantEmail } });
          if (utilisateur) {
            const enseignant = await db.Enseignant.findByPk(utilisateur.id);
            enseignantId = enseignant?.id;
          }
        }

        // Trouver le semestre
        let semestreId = null;
        if (semestreName) {
          const semestre = await db.Semestre.findOne({ where: { nom: semestreName } });
          semestreId = semestre?.id;
        }

        const [cours, created] = await db.Cours.findOrCreate({
          where: { code },
          defaults: { code, nom, enseignantId, semestreId, dateImport }
        });

        if (!created) {
          await cours.update({ nom, enseignantId, semestreId, dateImport });
          results.updated.push(code);
        } else {
          results.created.push(code);
        }
        
        results.success++;
      } catch (error) {
        results.errors.push({ row: i, code, error: error.message });
      }
    }

    return results;
  }

  /**
   * Génère un template Excel pour une entité
   */
  async generateTemplate(entityType) {
    const workbook = new ExcelJS.Workbook();
    let worksheet;

    switch (entityType) {
      case 'ecoles':
        worksheet = workbook.addWorksheet('Ecoles');
        worksheet.columns = [
          { header: 'Nom', key: 'nom', width: 30 }
        ];
        worksheet.addRow({ nom: 'Exemple: École Polytechnique' });
        break;

      case 'classes':
        worksheet = workbook.addWorksheet('Classes');
        worksheet.columns = [
          { header: 'Nom', key: 'nom', width: 20 },
          { header: 'Niveau', key: 'niveau', width: 15 },
          { header: 'Année Académique', key: 'annee', width: 20 }
        ];
        worksheet.addRow({ nom: 'ING4 ISI FR', niveau: 'ING4', annee: '2024-2025' });
        break;

      case 'etudiants':
        worksheet = workbook.addWorksheet('Etudiants');
        worksheet.columns = [
          { header: 'Matricule', key: 'matricule', width: 15 },
          { header: 'Nom', key: 'nom', width: 20 },
          { header: 'Prénom', key: 'prenom', width: 20 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Classe', key: 'classe', width: 15 },
          { header: 'ID Carte', key: 'idCarte', width: 15 }
        ];
        worksheet.addRow({ 
          matricule: 'E2024001', 
          nom: 'Dupont', 
          prenom: 'Jean', 
          email: 'jean.dupont@example.com',
          classe: 'ING4 ISI FR',
          idCarte: 'CARD001'
        });
        break;

      case 'enseignants':
        worksheet = workbook.addWorksheet('Enseignants');
        worksheet.columns = [
          { header: 'Nom', key: 'nom', width: 20 },
          { header: 'Prénom', key: 'prenom', width: 20 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Spécialité', key: 'specialite', width: 25 },
          { header: 'École', key: 'ecole', width: 25 }
        ];
        worksheet.addRow({ 
          nom: 'Martin', 
          prenom: 'Sophie', 
          email: 'sophie.martin@example.com',
          specialite: 'Informatique',
          ecole: 'École Polytechnique'
        });
        break;

      case 'cours':
        worksheet = workbook.addWorksheet('Cours');
        worksheet.columns = [
          { header: 'Code', key: 'code', width: 15 },
          { header: 'Nom', key: 'nom', width: 30 },
          { header: 'Email Enseignant', key: 'enseignant', width: 30 },
          { header: 'Semestre', key: 'semestre', width: 20 }
        ];
        worksheet.addRow({ 
          code: 'INFO401', 
          nom: 'Programmation Avancée', 
          enseignant: 'sophie.martin@example.com',
          semestre: 'S1'
        });
        break;

      default:
        throw new Error('Type d\'entité non supporté');
    }

    // Style pour l'en-tête
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    return workbook;
  }
}

module.exports = new ExcelImportService();
