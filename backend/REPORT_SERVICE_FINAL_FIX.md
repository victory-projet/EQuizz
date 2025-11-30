# 🔧 CORRECTION FINALE - report.service.js

## Problème

La clause WHERE avec `$Question.typeQuestion$` ne fonctionne pas avec les includes imbriqués.

## Solution

Simplifier la requête et filtrer les réponses ouvertes après la récupération.

## Code à remplacer dans getSentimentAnalysis()

**Remplacer** :
```javascript
async getSentimentAnalysis(evaluationId, classeId = null) {
  const whereClause = {
    '$Question.Quizz.Evaluation.id$': evaluationId,
    '$Question.typeQuestion$': 'REPONSE_OUVERTE'
  };

  if (classeId) {
    whereClause['$Etudiant.classe_id$'] = classeId;
  }

  const reponses = await db.ReponseEtudiant.findAll({
    where: whereClause,
    include: [
      {
        model: db.Question,
        include: [
          {
            model: db.Quizz,
            include: [{ model: db.Evaluation }]
          }
        ]
      },
      { 
        model: db.SessionReponse,
        attributes: ['id']
      },
      { model: db.AnalyseReponse }
    ]
  });
```

**Par** :
```javascript
async getSentimentAnalysis(evaluationId, classeId = null) {
  // Récupérer l'évaluation avec toutes les réponses
  const evaluation = await db.Evaluation.findByPk(evaluationId, {
    include: [
      {
        model: db.Quizz,
        include: [
          {
            model: db.Question,
            where: { typeQuestion: 'REPONSE_OUVERTE' },  // Filtrer directement ici
            required: false,
            include: [
              {
                model: db.ReponseEtudiant,
                include: [
                  { 
                    model: db.SessionReponse,
                    attributes: ['id']
                  },
                  { model: db.AnalyseReponse }
                ]
              }
            ]
          }
        ]
      }
    ]
  });

  if (!evaluation || !evaluation.Quizz) {
    return {
      total: 0,
      sentiments: {
        positif: 0,
        neutre: 0,
        negatif: 0,
        positifPct: '0',
        neutrePct: '0',
        negatifPct: '0'
      },
      keywords: [],
      summary: null
    };
  }

  // Collecter toutes les réponses ouvertes
  const reponses = [];
  evaluation.Quizz.Questions.forEach(question => {
    if (question.ReponseEtudiants) {
      question.ReponseEtudiants.forEach(reponse => {
        reponses.push(reponse);
      });
    }
  });
```

## Ligne approximative

Autour de la ligne 140-180 dans `backend/src/services/report.service.js`

## Test

Après correction, tester :
```bash
curl http://localhost:3000/api/reports/:id
```

Devrait retourner 200 OK avec les données du rapport.
