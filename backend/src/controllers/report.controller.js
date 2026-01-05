const { Evaluation, Classe, Enseignant, Utilisateur } = require('../models');

class ReportController {
  // Obtenir les données complètes d'un rapport d'évaluation
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
        return res.status(404).json({ message: 'Évaluation non trouvée' });
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
        ],
        openQuestions: [
          {
            id: 2,
            titre: "Question ouverte exemple",
            responses: [
              { texte: "Réponse exemple 1", dateReponse: new Date() },
              { texte: "Réponse exemple 2", dateReponse: new Date() }
            ]
          }
        ],
        sentimentData: {
          positive: 60,
          neutral: 30,
          negative: 10
        }
      };

      console.log(`✅ Rapport généré avec succès`);
      res.json(reportData);
    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport:', error);
      console.error('Stack trace:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error constructor:', error.constructor.name);
      res.status(500).json({ 
        message: 'Erreur serveur', 
        error: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }

  // Obtenir les options de filtrage
  async getFilterOptions(req, res) {
    try {
      const classes = await Classe.findAll({
        attributes: ['id', 'nom'],
        order: [['nom', 'ASC']]
      });

      const enseignants = await Enseignant.findAll({
        attributes: ['id'],
        order: [['id', 'ASC']]
      });

      res.json({
        classes,
        enseignants: enseignants.map(e => ({
          id: e.id,
          nom: `Enseignant ${e.id}`
        }))
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des options de filtrage:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }

  // Exporter le rapport en PDF
  async exportToPDF(req, res) {
    try {
      const { id } = req.params;
      
      res.json({ 
        message: 'Export PDF en cours de développement',
        downloadUrl: `/api/reports/${id}/download`
      });
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
}

module.exports = new ReportController();