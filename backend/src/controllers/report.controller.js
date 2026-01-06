const { Evaluation, Classe, Enseignant, Utilisateur, AnneeAcademique } = require('../models');
const ResponseFormatter = require('../utils/ResponseFormatter');

class ReportController {
  // Récupérer tous les rapports disponibles
  async getAllReports(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      console.log('📊 Récupération de tous les rapports disponibles');

      // Pour le moment, on récupère toutes les évaluations comme base des rapports
      const whereClause = {};
      if (search) {
        whereClause.titre = {
          [require('sequelize').Op.like]: `%${search}%`
        };
      }

      const { count, rows: evaluations } = await Evaluation.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'titre', 'description', 'dateDebut', 'dateFin', 'statut', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Transformer les évaluations en rapports avec des statistiques simulées
      const reports = evaluations.map(evaluation => ({
        id: evaluation.id,
        titre: `Rapport - ${evaluation.titre}`,
        evaluation: {
          id: evaluation.id,
          titre: evaluation.titre,
          description: evaluation.description,
          dateDebut: evaluation.dateDebut,
          dateFin: evaluation.dateFin,
          statut: evaluation.statut
        },
        dateGeneration: new Date(),
        statistiques: {
          totalParticipants: Math.floor(Math.random() * 50) + 10,
          tauxParticipation: Math.floor(Math.random() * 40) + 60,
          scoresMoyen: Math.floor(Math.random() * 30) + 70,
          tempsPasseMoyen: Math.floor(Math.random() * 20) + 10
        },
        statut: 'Disponible'
      }));

      // Format compatible avec le frontend Angular
      return ResponseFormatter.compatibilityFormat(res, reports, {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }, 'reports');
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports:', error);
      return ResponseFormatter.error(res, 'Erreur lors de la récupération des rapports', 500);
    }
  }

  // Obtenir le rapport complet d'une évaluation
  async getEvaluationReport(req, res) {
    try {
      const { id } = req.params;
      const { classe, enseignant } = req.query;

      console.log(`📊 Génération du rapport pour l'évaluation ${id}`);
      console.log(`🔍 Filtres: classe=${classe}, enseignant=${enseignant}`);

      // Récupérer l'évaluation de base
      const evaluation = await Evaluation.findByPk(id);

      if (!evaluation) {
        console.log(`❌ Évaluation ${id} non trouvée`);
        return ResponseFormatter.notFound(res, 'Évaluation');
      }

      console.log(`✅ Évaluation trouvée: ${evaluation.titre}`);

      // Retourner des données simulées pour le moment
      const reportData = {
        evaluation: {
          id: evaluation.id,
          titre: evaluation.titre,
          description: evaluation.description,
          dateCreation: evaluation.createdAt,
          dateDebut: evaluation.dateDebut,
          dateFin: evaluation.dateFin,
          statut: evaluation.statut
        },
        statistics: {
          totalStudents: 25,
          totalRespondents: 18,
          participationRate: 72,
          totalQuestions: 10,
          averageScore: 75,
          averageTime: 15,
          successRate: 80
        },
        mcqQuestions: [
          {
            id: 1,
            titre: "Question QCM exemple",
            options: [
              { texte: "Option A", count: 8, percentage: 44 },
              { texte: "Option B", count: 6, percentage: 33 },
              { texte: "Option C", count: 4, percentage: 23 }
            ]
          }
        ]
      };

      return ResponseFormatter.success(res, reportData, 'Rapport généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      return ResponseFormatter.error(res, 'Erreur lors de la génération du rapport', 500);
    }
  }

  // Obtenir les options de filtrage (classes, enseignants)
  async getFilterOptions(req, res) {
    try {
      console.log('🔍 Récupération des options de filtrage...');

      // Récupérer les classes (sans associations pour éviter les erreurs)
      let classes = [];
      try {
        classes = await Classe.findAll({
          attributes: ['id', 'nom', 'niveau']
        });
      } catch (classeError) {
        console.warn('⚠️ Erreur lors de la récupération des classes:', classeError.message);
        classes = [];
      }

      // Récupérer les enseignants (Utilisateur avec profil Enseignant)
      let enseignantsFiltered = [];
      try {
        const enseignants = await Utilisateur.findAll({
          attributes: ['id', 'nom', 'prenom', 'email'],
          include: [
            {
              model: Enseignant,
              required: false,
              attributes: ['id', 'specialite']
            }
          ]
        });

        // Filtrer seulement ceux qui ont un profil enseignant
        enseignantsFiltered = enseignants.filter(user => user.Enseignant !== null);
      } catch (enseignantError) {
        console.warn('⚠️ Erreur lors de la récupération des enseignants:', enseignantError.message);
        enseignantsFiltered = [];
      }

      console.log(`✅ Options récupérées: ${classes.length} classes, ${enseignantsFiltered.length} enseignants`);

      return ResponseFormatter.success(res, {
        classes: classes.map(classe => ({
          id: classe.id,
          nom: classe.nom,
          niveau: classe.niveau
        })),
        enseignants: enseignantsFiltered.map(user => ({
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          specialite: user.Enseignant?.specialite
        }))
      }, 'Options de filtrage récupérées avec succès');

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des options de filtrage:', error);
      return ResponseFormatter.error(res, 'Erreur lors de la récupération des options de filtrage', 500, {
        message: error.message,
        stack: error.stack
      });
    }
  }

  // Exporter un rapport en PDF
  async exportToPDF(req, res) {
    try {
      const { id } = req.params;
      
      // Pour le moment, retourner un message simulé
      res.json({ 
        message: 'Export PDF en cours de développement',
        evaluationId: id,
        status: 'pending'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      res.status(500).json({ message: 'Erreur lors de l\'export PDF' });
    }
  }
}

module.exports = new ReportController();