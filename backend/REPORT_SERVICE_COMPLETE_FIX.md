# 🔧 CORRECTION COMPLÈTE - report.service.js

## Problèmes à corriger

1. ✅ `estTerminee` → `statut` (DÉJÀ CORRIGÉ)
2. ⚠️ Clause WHERE avec `typeQuestion` (À CORRIGER)
3. ⚠️ `Cours.nom` → `Cour.nom` (À CORRIGER)

---

## Correction 1 : Méthode generateReport()

### Ligne ~70-80 : Retour du rapport

**Chercher** :
```javascript
return {
  evaluation: {
    id: evaluation.id,
    titre: evaluation.titre,
    cours: evaluation.Cours.nom,  // ❌ ERREUR ICI
    dateDebut: evaluation.dateDebut,
    dateFin: evaluation.dateFin,
    statut: evaluation.statut
  },
```

**Remplacer par** :
```javascript
return {
  evaluation: {
    id: evaluation.id,
    titre: evaluation.titre,
    cours: evaluation.Cour?.nom || evaluation.Cours?.nom || 'Non défini',  // ✅ CORRIGÉ
    dateDebut: evaluation.dateDebut,
    dateFin: evaluation.dateFin,
    statut: evaluation.statut
  },
```

---

## Correction 2 : Méthode getSentimentAnalysis()

### Ligne ~140-180 : Simplifier la requête

**Remplacer toute la méthode** par :

```javascript
async getSentimentAnalysis(evaluationId, classeId = null) {
  // Récupérer l'évaluation avec les questions de type REPONSE_OUVERTE
  const evaluation = await db.Evaluation.findByPk(evaluationId, {
    include: [
      {
        model: db.Quizz,
        include: [
          {
            model: db.Question,
            where: { typeQuestion: 'REPONSE_OUVERTE' },
            required: false,
            include: [
              {
                model: db.ReponseEtudiant,
                attributes: ['id', 'contenu'],
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
  if (evaluation.Quizz.Questions) {
    evaluation.Quizz.Questions.forEach(question => {
      if (question.ReponseEtudiants) {
        question.ReponseEtudiants.forEach(reponse => {
          reponses.push(reponse);
        });
      }
    });
  }

  // Compter les sentiments
  const sentimentCounts = {
    POSITIF: 0,
    NEUTRE: 0,
    NEGATIF: 0
  };

  const textes = [];
  reponses.forEach(reponse => {
    if (reponse.AnalyseReponse) {
      sentimentCounts[reponse.AnalyseReponse.sentiment]++;
    }
    if (reponse.contenu) {
      textes.push(reponse.contenu);
    }
  });

  // Extraire les mots-clés
  const keywords = await sentimentService.extractKeywords(textes, 20);

  // Générer un résumé avec Gemini (si disponible)
  let summary = null;
  if (sentimentService.generateSummary && textes.length > 0) {
    try {
      summary = await sentimentService.generateSummary(textes);
    } catch (error) {
      console.error('Erreur génération résumé:', error);
    }
  }

  const total = reponses.length;
  return {
    total,
    sentiments: {
      positif: sentimentCounts.POSITIF,
      neutre: sentimentCounts.NEUTRE,
      negatif: sentimentCounts.NEGATIF,
      positifPct: total > 0 ? ((sentimentCounts.POSITIF / total) * 100).toFixed(2) : '0',
      neutrePct: total > 0 ? ((sentimentCounts.NEUTRE / total) * 100).toFixed(2) : '0',
      negatifPct: total > 0 ? ((sentimentCounts.NEGATIF / total) * 100).toFixed(2) : '0'
    },
    keywords,
    summary
  };
}
```

---

## Correction 3 : Méthode getQuestionDetails()

### Si elle existe, vérifier aussi l'accès à Cours

**Chercher** :
```javascript
cours: evaluation.Cours.nom
```

**Remplacer par** :
```javascript
cours: evaluation.Cour?.nom || evaluation.Cours?.nom || 'Non défini'
```

---

## Résumé des corrections

| Ligne | Problème | Solution |
|-------|----------|----------|
| ~30 | `estTerminee` | ✅ Déjà corrigé en `statut` |
| ~75 | `Cours.nom` | Utiliser `Cour?.nom \|\| Cours?.nom` |
| ~145 | WHERE clause | Simplifier avec include direct |

---

## Test après corrections

```bash
# Test 1: Rapport simple
curl http://localhost:3000/api/reports/:id

# Test 2: Rapport avec classe
curl http://localhost:3000/api/reports/:id?classeId=xxx

# Test 3: Export PDF
curl http://localhost:3000/api/reports/:id/pdf
```

**Résultat attendu** : 200 OK avec données du rapport

---

## Pourquoi "Cour" et pas "Cours" ?

Sequelize utilise `singularize: true` par défaut, ce qui transforme les noms de modèles au singulier pour les relations `belongsTo`.

**Relation** :
```javascript
Evaluation.belongsTo(Cours, { foreignKey: 'cours_id' });
```

**Résultat** : Sequelize crée `evaluation.Cour` (singulier)

**Solution robuste** : Supporter les deux formats
```javascript
evaluation.Cour?.nom || evaluation.Cours?.nom || 'Non défini'
```

---

**Date** : 30/11/2025  
**Priorité** : 🔴 CRITIQUE  
**Fichier** : `backend/src/services/report.service.js`
