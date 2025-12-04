// backend/src/services/dashboard.service.js

const db = require('../models');
const { Op } = require('sequelize');

class DashboardService {
  /**
   * Récupère les statistiques globales pour l'administrateur
   * @param {Object} filters - Filtres optionnels (year, semester, classeId, coursId, enseignantId)
   */
  async getAdminDashboard(filters = {}) {
    console.log('📊 Dashboard service filters:', filters);
    const whereClause = this.buildWhereClause(filters);
    console.log('📊 Where clause:', JSON.stringify(whereClause, null, 2));

    const [
      totalEtudiants,
      totalEnseignants,
      totalCours,
      totalEvaluations,
      evaluationsActives,
      evaluationsTerminees,
      tauxParticipationMoyen
    ] = await Promise.all([
      this.countEtudiants(filters),
      db.Enseignant.count(),
      db.Cours.count(),
      db.Evaluation.count({ where: whereClause }),
      db.Evaluation.count({ where: { ...whereClause, statut: 'PUBLIEE' } }),
      db.Evaluation.count({ where: { ...whereClause, statut: 'CLOTUREE' } }),
      this.calculateAverageParticipation(filters)
    ]);

    // Évaluations récentes
    const evaluationsRecentes = await db.Evaluation.findAll({
      where: whereClause,
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.Cours, required: false },
        { model: db.Classe, required: false }
      ]
    });

    // Statistiques par cours
    const statsParCours = await this.getStatsByCours(filters);

    // Participation dans le temps
    const participationTimeline = await this.getParticipationTimeline(filters);

    // Top mots-clés
    const topKeywords = await this.getTopKeywords(filters);

    // Tendances (variations par rapport au mois précédent)
    const trends = await this.calculateTrends(filters);

    // Alertes
    const alerts = await this.getAlerts(filters);

    return {
      overview: {
        totalEtudiants,
        totalEnseignants,
        totalCours,
        totalEvaluations,
        evaluationsActives,
        evaluationsTerminees,
        tauxParticipationMoyen
      },
      trends,
      alerts,
      evaluationsRecentes: evaluationsRecentes.map(e => ({
        id: e.id,
        titre: e.titre,
        cours: e.Cours ? e.Cours.nom : 'N/A',
        statut: e.statut,
        dateDebut: e.dateDebut,
        dateFin: e.dateFin,
        nombreClasses: e.Classes ? e.Classes.length : 0
      })),
      statsParCours,
      participationTimeline,
      topKeywords
    };
  }

  /**
   * Construit la clause WHERE pour les filtres
   */
  buildWhereClause(filters) {
    const where = {};

    // Filtre par année académique
    if (filters.year) {
      const [startYear, endYear] = filters.year.split('-');
      where.dateDebut = {
        [Op.gte]: new Date(`${startYear}-09-01`),
        [Op.lte]: new Date(`${endYear}-08-31`)
      };
    }

    // Filtre par semestre
    if (filters.semester && filters.semester !== 'all') {
      const year = filters.year ? filters.year.split('-')[0] : new Date().getFullYear();
      if (filters.semester === '1') {
        where.dateDebut = {
          [Op.gte]: new Date(`${year}-09-01`),
          [Op.lte]: new Date(`${parseInt(year) + 1}-01-31`)
        };
      } else if (filters.semester === '2') {
        where.dateDebut = {
          [Op.gte]: new Date(`${parseInt(year) + 1}-02-01`),
          [Op.lte]: new Date(`${parseInt(year) + 1}-08-31`)
        };
      }
    }

    // Filtre par cours
    if (filters.coursId && filters.coursId !== 'all') {
      where.cours_id = filters.coursId;
    }

    return where;
  }

  /**
   * Compte les étudiants avec filtres
   */
  async countEtudiants(filters) {
    if (filters.classeId && filters.classeId !== 'all') {
      return db.Etudiant.count({ where: { classe_id: filters.classeId } });
    }
    return db.Etudiant.count();
  }

  /**
   * Calcule le taux de participation moyen
   */
  async calculateAverageParticipation(filters = {}) {
    const whereClause = this.buildWhereClause(filters);
    whereClause.statut = { [Op.in]: ['PUBLIEE', 'CLOTUREE'] };

    const evaluations = await db.Evaluation.findAll({
      where: whereClause,
      include: [
        {
          model: db.Quizz,
          include: [{ model: db.SessionReponse }]
        },
        {
          model: db.Classe,
          include: [{ model: db.Etudiant }]
        }
      ]
    });

    if (evaluations.length === 0) return 0;

    let totalTaux = 0;
    let count = 0;

    for (const evaluation of evaluations) {
      let totalEtudiants = evaluation.Classes.reduce(
        (sum, classe) => sum + classe.Etudiants.length,
        0
      );

      // Filtre par classe si nécessaire
      if (filters.classeId && filters.classeId !== 'all') {
        const classe = evaluation.Classes.find(c => c.id === filters.classeId);
        totalEtudiants = classe ? classe.Etudiants.length : 0;
      }

      if (totalEtudiants > 0) {
        let repondants = evaluation.Quizz.SessionReponses;
        
        // Filtre les répondants par classe si nécessaire
        if (filters.classeId && filters.classeId !== 'all') {
          repondants = repondants.filter(s => {
            const etudiant = evaluation.Classes
              .flatMap(c => c.Etudiants)
              .find(e => e.id === s.etudiant_id);
            return etudiant && etudiant.classe_id === filters.classeId;
          });
        }

        const uniqueRepondants = new Set(repondants.map(s => s.etudiant_id)).size;
        const taux = (uniqueRepondants / totalEtudiants) * 100;
        totalTaux += taux;
        count++;
      }
    }

    return count > 0 ? (totalTaux / count).toFixed(2) : 0;
  }

  /**
   * Récupère les statistiques par cours
   */
  async getStatsByCours(filters = {}) {
    const coursWhere = {};
    if (filters.coursId && filters.coursId !== 'all') {
      coursWhere.id = filters.coursId;
    }

    const cours = await db.Cours.findAll({
      where: coursWhere,
      include: [
        {
          model: db.Evaluation,
          where: filters.year || filters.semester ? this.buildWhereClause(filters) : undefined,
          required: false,
          include: [
            {
              model: db.Quizz,
              include: [{ model: db.SessionReponse }]
            },
            {
              model: db.Classe,
              include: [{ model: db.Etudiant }]
            }
          ]
        },
        { model: db.Enseignant, include: [{ model: db.Utilisateur }] }
      ]
    });

    return cours
      .map(c => {
        const nombreEvaluations = c.Evaluations.length;
        let totalReponses = 0;
        let totalEtudiants = 0;

        c.Evaluations.forEach(evaluation => {
          const repondants = new Set(
            evaluation.Quizz.SessionReponses.map(s => s.etudiant_id)
          ).size;
          totalReponses += repondants;

          let etudiants = evaluation.Classes.reduce(
            (sum, classe) => sum + classe.Etudiants.length,
            0
          );

          // Filtre par classe si nécessaire
          if (filters.classeId && filters.classeId !== 'all') {
            const classe = evaluation.Classes.find(cl => cl.id === filters.classeId);
            etudiants = classe ? classe.Etudiants.length : 0;
          }

          totalEtudiants += etudiants;
        });

        const tauxParticipation = totalEtudiants > 0
          ? ((totalReponses / totalEtudiants) * 100).toFixed(2)
          : 0;

        return {
          id: c.id,
          code: c.code,
          nom: c.nom,
          enseignant: c.Enseignant ? c.Enseignant.Utilisateur.nom : 'Non assigné',
          nombreEvaluations,
          tauxParticipation: parseFloat(tauxParticipation)
        };
      })
      .filter(c => c.nombreEvaluations > 0); // Ne retourner que les cours avec des évaluations
  }

  /**
   * Récupère la participation dans le temps (par semaine)
   */
  async getParticipationTimeline(filters = {}) {
    const whereClause = this.buildWhereClause(filters);
    whereClause.statut = { [Op.in]: ['PUBLIEE', 'CLOTUREE'] };

    const evaluations = await db.Evaluation.findAll({
      where: whereClause,
      order: [['dateDebut', 'ASC']],
      include: [
        {
          model: db.Quizz,
          include: [{ model: db.SessionReponse }]
        },
        {
          model: db.Classe,
          include: [{ model: db.Etudiant }]
        }
      ]
    });

    // Grouper par semaine
    const weeklyData = new Map();

    evaluations.forEach(evaluation => {
      const weekKey = this.getWeekKey(evaluation.dateDebut);
      
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { totalEtudiants: 0, totalRepondants: 0 });
      }

      const data = weeklyData.get(weekKey);
      
      const totalEtudiants = evaluation.Classes.reduce(
        (sum, classe) => sum + classe.Etudiants.length,
        0
      );

      const repondants = new Set(
        evaluation.Quizz.SessionReponses.map(s => s.etudiant_id)
      ).size;

      data.totalEtudiants += totalEtudiants;
      data.totalRepondants += repondants;
    });

    // Convertir en tableau et calculer les taux
    const timeline = Array.from(weeklyData.entries())
      .map(([week, data]) => ({
        periode: week,
        tauxParticipation: data.totalEtudiants > 0
          ? parseFloat(((data.totalRepondants / data.totalEtudiants) * 100).toFixed(2))
          : 0
      }))
      .sort((a, b) => a.periode.localeCompare(b.periode));

    return timeline;
  }

  /**
   * Récupère les mots-clés les plus fréquents
   */
  async getTopKeywords(filters = {}, limit = 10) {
    try {
      // Récupérer directement les réponses textuelles
      const reponses = await db.ReponseEtudiant.findAll({
        where: {
          reponseTexte: { [Op.ne]: null }
        },
        include: [
          {
            model: db.Question,
            where: { type: { [Op.in]: ['REPONSE_OUVERTE', 'TEXTE_LIBRE'] } },
            required: true,
            include: [
              {
                model: db.Quizz,
                required: true,
                include: [
                  {
                    model: db.Evaluation,
                    where: this.buildWhereClause(filters),
                    required: true
                  }
                ]
              }
            ]
          }
        ]
      });

      // Collecter tous les mots des réponses ouvertes
      const wordFrequency = new Map();

      reponses.forEach(reponse => {
        if (reponse.reponseTexte) {
          // Nettoyer et extraire les mots
          const words = reponse.reponseTexte
            .toLowerCase()
            .replace(/[^\wàâäéèêëïîôùûüÿæœç\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3); // Mots de plus de 3 caractères

          words.forEach(word => {
            wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
          });
        }
      });

    // Mots à exclure (stop words français)
    const stopWords = new Set([
      'dans', 'pour', 'avec', 'sans', 'plus', 'très', 'bien', 'être',
      'avoir', 'faire', 'cette', 'cette', 'tous', 'tout', 'leur', 'leurs',
      'elle', 'elles', 'nous', 'vous', 'mais', 'donc', 'alors', 'aussi'
    ]);

    // Convertir en tableau, filtrer et trier
    const keywords = Array.from(wordFrequency.entries())
      .filter(([word]) => !stopWords.has(word))
      .map(([mot, frequence]) => ({ mot, frequence }))
      .sort((a, b) => b.frequence - a.frequence)
      .slice(0, limit);

    return keywords;
    } catch (error) {
      console.error('Erreur getTopKeywords:', error);
      return [];
    }
  }

  /**
   * Obtient la clé de semaine pour une date
   */
  getWeekKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const week = Math.ceil(d.getDate() / 7);
    return `${year}-${month}-S${week}`;
  }

  /**
   * Récupère le dashboard pour un étudiant
   */
  async getStudentDashboard(etudiantId) {
    const etudiant = await db.Etudiant.findByPk(etudiantId, {
      include: [
        { model: db.Utilisateur },
        { model: db.Classe }
      ]
    });

    if (!etudiant) {
      throw new Error('Étudiant non trouvé');
    }

    // Quizz disponibles
    const quizzDisponibles = await db.Quizz.findAll({
      include: [
        {
          model: db.Evaluation,
          where: {
            statut: 'PUBLIEE',
            dateDebut: { [Op.lte]: new Date() },
            dateFin: { [Op.gte]: new Date() }
          },
          include: [
            {
              model: db.Classe,
              where: { id: etudiant.classe_id }
            },
            { model: db.Cours }
          ]
        }
      ]
    });

    // Vérifier lesquels sont complétés
    const quizzAvecStatut = await Promise.all(
      quizzDisponibles.map(async quizz => {
        const session = await db.SessionReponse.findOne({
          where: {
            quizz_id: quizz.id,
            etudiant_id: etudiantId
          }
        });

        return {
          id: quizz.id,
          titre: quizz.titre,
          cours: quizz.Evaluation.Cours.nom,
          dateFin: quizz.Evaluation.dateFin,
          statut: session ? 'COMPLETE' : 'A_FAIRE'
        };
      })
    );

    // Statistiques personnelles
    const totalQuizzCompletes = await db.SessionReponse.count({
      where: { etudiant_id: etudiantId }
    });

    // Notifications non lues
    const notificationsNonLues = await db.sequelize.models.NotificationEtudiant.count({
      where: {
        EtudiantId: etudiantId,
        estLue: false
      }
    });

    return {
      etudiant: {
        nom: etudiant.Utilisateur.nom,
        prenom: etudiant.Utilisateur.prenom,
        matricule: etudiant.matricule,
        classe: etudiant.Classe.nom
      },
      quizz: {
        disponibles: quizzAvecStatut.filter(q => q.statut === 'A_FAIRE'),
        completes: quizzAvecStatut.filter(q => q.statut === 'COMPLETE'),
        total: quizzAvecStatut.length
      },
      statistiques: {
        totalQuizzCompletes,
        notificationsNonLues
      }
    };
  }

  /**
   * Récupère les statistiques d'une évaluation spécifique
   */
  async getEvaluationStats(evaluationId) {
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [
        { model: db.Cours },
        {
          model: db.Quizz,
          include: [
            { model: db.Question },
            { model: db.SessionReponse }
          ]
        },
        {
          model: db.Classe,
          include: [{ model: db.Etudiant }]
        }
      ]
    });

    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    const totalEtudiants = evaluation.Classes.reduce(
      (sum, classe) => sum + classe.Etudiants.length,
      0
    );

    const repondants = new Set(
      evaluation.Quizz.SessionReponses.map(s => s.etudiant_id)
    ).size;

    const tauxParticipation = totalEtudiants > 0
      ? ((repondants / totalEtudiants) * 100).toFixed(2)
      : 0;

    return {
      id: evaluation.id,
      titre: evaluation.titre,
      cours: evaluation.Cours.nom,
      statut: evaluation.statut,
      dateDebut: evaluation.dateDebut,
      dateFin: evaluation.dateFin,
      nombreQuestions: evaluation.Quizz.Questions.length,
      totalEtudiants,
      nombreRepondants: repondants,
      tauxParticipation: parseFloat(tauxParticipation),
      classes: evaluation.Classes.map(c => ({
        id: c.id,
        nom: c.nom,
        nombreEtudiants: c.Etudiants.length
      }))
    };
  }
  /**
   * Calcule les tendances (variations par rapport au mois précédent)
   */
  async calculateTrends(filters = {}) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Étudiants actifs (inscrits ce mois vs mois dernier)
    const [etudiantsCurrentMonth, etudiantsLastMonth] = await Promise.all([
      db.Etudiant.count({
        where: {
          createdAt: { [Op.gte]: currentMonth }
        }
      }),
      db.Etudiant.count({
        where: {
          createdAt: {
            [Op.gte]: lastMonth,
            [Op.lt]: currentMonth
          }
        }
      })
    ]);

    // Cours créés ce mois vs mois dernier
    const [coursCurrentMonth, coursLastMonth] = await Promise.all([
      db.Cours.count({
        where: {
          createdAt: { [Op.gte]: currentMonth }
        }
      }),
      db.Cours.count({
        where: {
          createdAt: {
            [Op.gte]: lastMonth,
            [Op.lt]: currentMonth
          }
        }
      })
    ]);

    // Évaluations publiées ce mois vs mois dernier
    const [evaluationsCurrentMonth, evaluationsLastMonth] = await Promise.all([
      db.Evaluation.count({
        where: {
          statut: 'PUBLIEE',
          createdAt: { [Op.gte]: currentMonth }
        }
      }),
      db.Evaluation.count({
        where: {
          statut: 'PUBLIEE',
          createdAt: {
            [Op.gte]: lastMonth,
            [Op.lt]: currentMonth
          }
        }
      })
    ]);

    return {
      etudiants: this.calculatePercentageChange(etudiantsLastMonth, etudiantsCurrentMonth),
      cours: this.calculatePercentageChange(coursLastMonth, coursCurrentMonth),
      evaluations: this.calculatePercentageChange(evaluationsLastMonth, evaluationsCurrentMonth)
    };
  }

  /**
   * Calcule le pourcentage de variation
   */
  calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    const change = ((newValue - oldValue) / oldValue) * 100;
    return Math.round(change);
  }

  /**
   * Récupère les alertes importantes
   */
  async getAlerts(filters = {}) {
    const alerts = [];

    // Alerte 1: Rapports prêts
    const rapportsEnAttente = await db.Evaluation.count({
      where: {
        statut: 'CLOTUREE',
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
        }
      }
    });

    if (rapportsEnAttente > 0) {
      alerts.push({
        type: 'info',
        title: `Rapport${rapportsEnAttente > 1 ? 's' : ''} disponible${rapportsEnAttente > 1 ? 's' : ''}`,
        message: `${rapportsEnAttente} rapport${rapportsEnAttente > 1 ? 's' : ''} d'évaluation ${rapportsEnAttente > 1 ? 'sont' : 'est'} prêt${rapportsEnAttente > 1 ? 's' : ''} à être consulté${rapportsEnAttente > 1 ? 's' : ''}.`,
        date: new Date()
      });
    }

    // Alerte 2: Participation faible
    const evaluationsActives = await db.Evaluation.findAll({
      where: {
        statut: 'PUBLIEE',
        dateFin: { [Op.gte]: new Date() }
      },
      include: [
        {
          model: db.Quizz,
          include: [{ model: db.SessionReponse }]
        },
        {
          model: db.Classe,
          include: [{ model: db.Etudiant }]
        },
        { model: db.Cours }
      ]
    });

    for (const evaluation of evaluationsActives) {
      const totalEtudiants = evaluation.Classes.reduce(
        (sum, classe) => sum + classe.Etudiants.length,
        0
      );

      if (totalEtudiants > 0 && evaluation.Quizz) {
        const repondants = new Set(
          evaluation.Quizz.SessionReponses.map(s => s.etudiant_id)
        ).size;

        const tauxParticipation = (repondants / totalEtudiants) * 100;

        if (tauxParticipation < 30) {
          alerts.push({
            type: 'warning',
            title: 'Participation en chute !!!',
            message: `Constat d'une faible participation pour l'unité ${evaluation.Cours?.code || 'N/A'} soit de ${evaluation.Cours?.nom || 'N/A'} à ${Math.round(tauxParticipation)}%`,
            date: new Date()
          });
          break; // Une seule alerte de ce type
        }
      }
    }

    // Alerte 3: Évaluations qui se terminent bientôt
    const evaluationsProcheFin = await db.Evaluation.findAll({
      where: {
        statut: 'PUBLIEE',
        dateFin: {
          [Op.gte]: new Date(),
          [Op.lte]: new Date(Date.now() + 48 * 60 * 60 * 1000) // Dans les 48h
        }
      },
      include: [{ model: db.Cours }],
      limit: 1
    });

    if (evaluationsProcheFin.length > 0) {
      const evaluation = evaluationsProcheFin[0];
      const heuresRestantes = Math.round((new Date(evaluation.dateFin) - new Date()) / (1000 * 60 * 60));
      
      alerts.push({
        type: 'info',
        title: 'Fin du Quota horaires en approche',
        message: `L'évaluation ${evaluation.Cours?.nom || evaluation.titre} se termine dans ${heuresRestantes}h`,
        date: new Date()
      });
    }

    return alerts.slice(0, 3); // Maximum 3 alertes
  }
}

module.exports = new DashboardService();
