const { Question, Quizz } = require('../models');
const ResponseFormatter = require('../utils/ResponseFormatter');

// Créer une nouvelle question
exports.createQuestion = async (req, res) => {
  try {
    const { quizz_id } = req.params;
    const { enonce, typeQuestion, options, ordre } = req.body;

    // Vérifier que le quiz existe
    const quizz = await Quizz.findByPk(quizz_id);
    if (!quizz) {
      return ResponseFormatter.notFound(res, 'Quiz');
    }

    // Validation des données
    if (!enonce || !typeQuestion) {
      return ResponseFormatter.validationError(res, [
        { field: 'enonce', message: 'L\'énoncé est requis' },
        { field: 'typeQuestion', message: 'Le type de question est requis' }
      ]);
    }

    if (!['CHOIX_MULTIPLE', 'REPONSE_OUVERTE'].includes(typeQuestion)) {
      return ResponseFormatter.validationError(res, [
        { field: 'typeQuestion', message: 'Type de question invalide' }
      ]);
    }

    // Pour les questions à choix multiple, vérifier les options
    if (typeQuestion === 'CHOIX_MULTIPLE') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return ResponseFormatter.validationError(res, [
          { field: 'options', message: 'Au moins 2 options sont requises pour les questions à choix multiple' }
        ]);
      }
    }

    // Déterminer l'ordre si non fourni
    let questionOrdre = ordre;
    if (!questionOrdre) {
      const lastQuestion = await Question.findOne({
        where: { quizz_id },
        order: [['ordre', 'DESC']]
      });
      questionOrdre = lastQuestion ? lastQuestion.ordre + 1 : 1;
    }

    const question = await Question.create({
      enonce,
      typeQuestion,
      options: typeQuestion === 'CHOIX_MULTIPLE' ? options : [],
      ordre: questionOrdre,
      quizz_id
    });

    return ResponseFormatter.created(res, question, 'Question créée avec succès');
  } catch (error) {
    console.error('Erreur lors de la création de la question:', error);
    return ResponseFormatter.error(res, 'Erreur lors de la création de la question', 500);
  }
};

// Récupérer toutes les questions d'un quiz
exports.getQuestionsByQuizz = async (req, res) => {
  try {
    const { quizz_id } = req.params;

    const questions = await Question.findAll({
      where: { quizz_id },
      order: [['ordre', 'ASC']]
    });

    res.json(questions);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer une question par ID
exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByPk(id, {
      include: [{ model: Quizz }]
    });

    if (!question) {
      return res.status(404).json({ message: 'Question non trouvée' });
    }

    res.json(question);
  } catch (error) {
    console.error('Erreur lors de la récupération de la question:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour une question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { enonce, typeQuestion, options, ordre } = req.body;

    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ message: 'Question non trouvée' });
    }

    // Validation des données
    if (typeQuestion && !['CHOIX_MULTIPLE', 'REPONSE_OUVERTE'].includes(typeQuestion)) {
      return res.status(400).json({ message: 'Type de question invalide' });
    }

    // Pour les questions à choix multiple, vérifier les options
    if (typeQuestion === 'CHOIX_MULTIPLE' && options) {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'Au moins 2 options sont requises pour les questions à choix multiple' });
      }
    }

    const updatedQuestion = await question.update({
      enonce: enonce || question.enonce,
      typeQuestion: typeQuestion || question.typeQuestion,
      options: options !== undefined ? options : question.options,
      ordre: ordre !== undefined ? ordre : question.ordre
    });

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la question:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ message: 'Question non trouvée' });
    }

    await question.destroy();
    res.json({ message: 'Question supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la question:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Réorganiser l'ordre des questions
exports.reorderQuestions = async (req, res) => {
  try {
    const { quizz_id } = req.params;
    const { questions } = req.body; // Array d'objets { id, ordre }

    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: 'Format de données invalide' });
    }

    // Mettre à jour l'ordre de chaque question
    for (const questionData of questions) {
      await Question.update(
        { ordre: questionData.ordre },
        { where: { id: questionData.id, quizz_id } }
      );
    }

    // Récupérer les questions mises à jour
    const updatedQuestions = await Question.findAll({
      where: { quizz_id },
      order: [['ordre', 'ASC']]
    });

    res.json(updatedQuestions);
  } catch (error) {
    console.error('Erreur lors de la réorganisation des questions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Importer des questions depuis un fichier Excel
exports.importQuestions = async (req, res) => {
  try {
    const { quizz_id } = req.params;
    const { questions } = req.body;

    // Vérifier que le quiz existe
    const quizz = await Quizz.findByPk(quizz_id);
    if (!quizz) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Aucune question à importer' });
    }

    let imported = 0;
    const errors = [];

    // Obtenir le dernier ordre
    const lastQuestion = await Question.findOne({
      where: { quizz_id },
      order: [['ordre', 'DESC']]
    });
    let currentOrdre = lastQuestion ? lastQuestion.ordre + 1 : 1;

    for (let i = 0; i < questions.length; i++) {
      const questionData = questions[i];
      
      try {
        // Validation des données requises
        if (!questionData.enonce || !questionData.typeQuestion) {
          errors.push(`Ligne ${i + 1}: Énoncé et type de question sont requis`);
          continue;
        }

        if (!['CHOIX_MULTIPLE', 'REPONSE_OUVERTE'].includes(questionData.typeQuestion)) {
          errors.push(`Ligne ${i + 1}: Type de question invalide "${questionData.typeQuestion}"`);
          continue;
        }

        // Validation des options pour les questions à choix multiple
        if (questionData.typeQuestion === 'CHOIX_MULTIPLE') {
          if (!questionData.options || !Array.isArray(questionData.options) || questionData.options.length < 2) {
            errors.push(`Ligne ${i + 1}: Au moins 2 options sont requises pour les questions à choix multiple`);
            continue;
          }
        }

        // Créer la question
        await Question.create({
          enonce: questionData.enonce.trim(),
          typeQuestion: questionData.typeQuestion,
          options: questionData.typeQuestion === 'CHOIX_MULTIPLE' ? questionData.options : [],
          ordre: currentOrdre++,
          quizz_id
        });

        imported++;

      } catch (questionError) {
        console.error(`Erreur lors de l'import de la question ligne ${i + 1}:`, questionError);
        errors.push(`Ligne ${i + 1}: ${questionError.message}`);
      }
    }

    res.json({
      imported,
      errors,
      message: `${imported} question(s) importée(s) avec succès${errors.length > 0 ? `, ${errors.length} erreur(s)` : ''}`
    });

  } catch (error) {
    console.error('Erreur lors de l\'import des questions:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'import' });
  }
};

// Récupérer toutes les questions (toutes évaluations confondues)
exports.getAllQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause.enonce = {
        [require('sequelize').Op.like]: `%${search}%`
      };
    }

    const { count, rows: questions } = await Question.findAndCountAll({
      where: whereClause,
      include: [{ 
        model: Quizz,
        attributes: ['id', 'titre']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Format compatible avec le frontend Angular
    return ResponseFormatter.compatibilityFormat(res, questions, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }, 'questions');
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error);
    return ResponseFormatter.error(res, 'Erreur lors de la récupération des questions', 500);
  }
};

// Créer une question autonome (sans quiz spécifique)
exports.createStandaloneQuestion = async (req, res) => {
  try {
    const { texte, type, options, bonneReponse, points, difficulte } = req.body;

    // Validation des données
    if (!texte || !type) {
      return res.status(400).json({ 
        message: 'Le texte et le type de question sont requis',
        errors: [
          { field: 'texte', message: 'Le texte de la question est requis' },
          { field: 'type', message: 'Le type de question est requis' }
        ]
      });
    }

    if (!['QCM', 'VRAI_FAUX', 'REPONSE_OUVERTE'].includes(type)) {
      return res.status(400).json({ 
        message: 'Type de question invalide',
        errors: [{ field: 'type', message: 'Type de question invalide' }]
      });
    }

    // Pour les questions QCM, vérifier les options
    if (type === 'QCM') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ 
          message: 'Au moins 2 options sont requises pour les questions QCM',
          errors: [{ field: 'options', message: 'Au moins 2 options sont requises' }]
        });
      }
      
      if (bonneReponse === undefined || bonneReponse < 0 || bonneReponse >= options.length) {
        return res.status(400).json({ 
          message: 'Index de bonne réponse invalide',
          errors: [{ field: 'bonneReponse', message: 'Index de bonne réponse invalide' }]
        });
      }
    }

    const question = await Question.create({
      enonce: texte,
      typeQuestion: type,
      options: type === 'QCM' ? options : [],
      bonneReponse: bonneReponse || 0,
      points: points || 1,
      difficulte: difficulte || 'MOYEN',
      ordre: 1 // Ordre par défaut pour les questions autonomes
    });

    res.status(201).json({
      message: 'Question créée avec succès',
      question
    });
  } catch (error) {
    console.error('Erreur lors de la création de la question:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};