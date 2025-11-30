# 🔒 AUDIT D'ANONYMAT - Backend

## 📊 Résumé Exécutif

**Date** : 30/11/2025  
**Statut** : ❌ **VIOLATIONS CRITIQUES DÉTECTÉES**  
**Niveau de risque** : 🔴 **ÉLEVÉ**

---

## ❌ VIOLATIONS CRITIQUES

### 1. 🚨 evaluation.service.js - `getSubmissions()`

**Fichier** : `backend/src/services/evaluation.service.js`  
**Ligne** : ~245-260  
**Gravité** : 🔴 **CRITIQUE**

**Code actuel** :
```javascript
return sessions.map(session => ({
  id: session.id,
  etudiant: {
    id: session.Etudiant.id,
    nom: session.Etudiant.Utilisateur.nom,        // ❌ VIOLATION
    prenom: session.Etudiant.Utilisateur.prenom,  // ❌ VIOLATION
    email: session.Etudiant.Utilisateur.email,    // ❌ VIOLATION
    matricule: session.Etudiant.matricule,        // ❌ VIOLATION
    classe: session.Etudiant.Classe?.nom
  },
  dateDebut: session.dateDebut,
  dateFin: session.dateFin,
  estTermine: session.estTermine,
  reponses: session.ReponseEtudiants.map(rep => ({
    questionId: rep.question_id,
    question: rep.Question.enonce,
    reponse: rep.reponseTexte,                    // ❌ VIOLATION
    dateReponse: rep.createdAt
  }))
}));
```

**Impact** :
- Expose l'identité complète des étudiants
- Permet de lier les réponses aux étudiants
- Violation totale de l'anonymat

**Correction requise** :
```javascript
// Cette méthode NE DOIT PAS EXISTER pour les évaluations anonymes
// OU retourner uniquement des statistiques agrégées

async getSubmissions(id) {
  // Pour les évaluations anonymes, retourner seulement des stats
  const evaluation = await evaluationRepository.findById(id);
  
  if (!evaluation) {
    throw AppError.notFound('Évaluation non trouvée.');
  }

  // Compter les soumissions sans exposer les identités
  const totalSubmissions = await db.SessionReponse.count({
    where: { quizz_id: evaluation.Quizz.id }
  });

  return {
    totalSubmissions,
    message: 'Les détails individuels ne sont pas disponibles pour préserver l\'anonymat'
  };
}
```

---

### 2. 🚨 export.service.js - Export Excel

**Fichier** : `backend/src/services/export.service.js`  
**Ligne** : ~105-115  
**Gravité** : 🔴 **CRITIQUE**

**Code actuel** :
```javascript
const row = {
  matricule: session.Etudiant.matricule,           // ❌ VIOLATION
  nom: session.Etudiant.Utilisateur.nom,           // ❌ VIOLATION
  prenom: session.Etudiant.Utilisateur.prenom,     // ❌ VIOLATION
  classe: session.Etudiant.Classe?.nom || 'N/A'
};
```

**Impact** :
- Export de fichiers Excel avec noms/prénoms
- Données personnelles stockées hors système
- Risque de fuite de données

**Correction requise** :
```javascript
// NE PAS exporter les données individuelles
// Exporter uniquement des statistiques agrégées

async exportEvaluationResults(evaluationId) {
  const workbook = new ExcelJS.Workbook();
  
  // Feuille 1: Statistiques globales uniquement
  const statsSheet = workbook.addWorksheet('Statistiques');
  statsSheet.columns = [
    { header: 'Métrique', key: 'metric', width: 30 },
    { header: 'Valeur', key: 'value', width: 15 }
  ];

  const stats = await this.getAggregatedStats(evaluationId);
  
  statsSheet.addRow({ metric: 'Total étudiants', value: stats.totalEtudiants });
  statsSheet.addRow({ metric: 'Répondants', value: stats.nombreRepondants });
  statsSheet.addRow({ metric: 'Taux participation', value: `${stats.tauxParticipation}%` });
  
  // Feuille 2: Distribution des réponses (agrégée)
  const distributionSheet = workbook.addWorksheet('Distribution');
  // Ajouter des graphiques de distribution sans identités
  
  return workbook;
}
```

---

### 3. 🚨 report.service.js - Includes avec Etudiant

**Fichier** : `backend/src/services/report.service.js`  
**Ligne** : ~20-45, ~140-165  
**Gravité** : 🔴 **CRITIQUE**

**Problèmes** :
1. Include de `db.Etudiant` dans les requêtes
2. Exposition potentielle des données étudiants
3. GROUP BY qui peut exposer des patterns

**Correction requise** :
```javascript
// Dans generateReport()
const evaluation = await db.Evaluation.findByPk(evaluationId, {
  include: [
    { model: db.Cours, required: false },
    { model: db.Classe },
    {
      model: db.Quizz,
      include: [
        {
          model: db.Question,
          include: [
            {
              model: db.ReponseEtudiant,
              attributes: ['id', 'contenu', 'question_id', 'session_reponse_id'],
              include: [
                { 
                  model: db.SessionReponse,
                  attributes: ['id', 'dateDebut', 'dateFin']
                  // PAS d'include Etudiant
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

// Dans getSentimentAnalysis()
const reponses = await db.ReponseEtudiant.findAll({
  where: whereClause,
  attributes: ['id', 'contenu'],
  include: [
    { 
      model: db.Question,
      attributes: ['id', 'enonce', 'typeQuestion']
    },
    { 
      model: db.SessionReponse,
      attributes: ['id']
      // PAS d'include Etudiant
    },
    { model: db.AnalyseReponse }
  ]
});
```

---

## ⚠️ VIOLATIONS MINEURES (Acceptables dans certains contextes)

### 1. dashboard.service.js - `getEtudiantDashboard()`

**Fichier** : `backend/src/services/dashboard.service.js`  
**Ligne** : ~235-240  
**Gravité** : 🟡 **ACCEPTABLE**

**Raison** : L'étudiant voit ses propres données (pas celles des autres)

```javascript
return {
  etudiant: {
    nom: etudiant.Utilisateur.nom,      // ✅ OK - Ses propres données
    prenom: etudiant.Utilisateur.prenom,
    matricule: etudiant.matricule,
    classe: etudiant.Classe.nom
  }
};
```

---

### 2. auth.controller.js - Login/Profile

**Fichier** : `backend/src/controllers/auth.controller.js`  
**Gravité** : ✅ **OK**

**Raison** : Authentification nécessite l'identité

---

## ✅ FICHIERS CONFORMES

### Services OK
- ✅ `auth.service.js` - Authentification (nécessaire)
- ✅ `jwt.service.js` - Tokens (pas de données perso)
- ✅ `email.service.js` - Envoi emails (nécessaire)
- ✅ `sentiment.service.js` - Analyse texte (anonyme)
- ✅ `sentiment-gemini.service.js` - IA (anonyme)

### Controllers OK
- ✅ `auth.controller.js` - Login (nécessaire)
- ✅ `student.controller.js` - Profil étudiant (ses données)

---

## 🔧 PLAN DE CORRECTION

### Phase 1 : URGENT (À faire immédiatement)

#### 1.1 Supprimer/Modifier `getSubmissions()`
```javascript
// backend/src/services/evaluation.service.js

async getSubmissions(id) {
  const evaluation = await evaluationRepository.findById(id);
  
  if (!evaluation) {
    throw AppError.notFound('Évaluation non trouvée.');
  }

  // Retourner uniquement des statistiques agrégées
  const stats = await db.SessionReponse.count({
    where: { quizz_id: evaluation.Quizz.id },
    distinct: true
  });

  return {
    totalSubmissions: stats,
    anonymousData: true,
    message: 'Les données individuelles ne sont pas disponibles pour préserver l\'anonymat des étudiants'
  };
}
```

#### 1.2 Corriger `export.service.js`
```javascript
// backend/src/services/export.service.js

async exportEvaluationResults(evaluationId) {
  const workbook = new ExcelJS.Workbook();
  
  // Feuille 1: Statistiques globales UNIQUEMENT
  const statsSheet = workbook.addWorksheet('Statistiques Globales');
  
  const report = await reportService.generateReport(evaluationId);
  
  // Ajouter uniquement des données agrégées
  statsSheet.addRow(['Total étudiants', report.statistics.totalEtudiants]);
  statsSheet.addRow(['Répondants', report.statistics.nombreRepondants]);
  statsSheet.addRow(['Taux participation', `${report.statistics.tauxParticipation}%`]);
  
  // Feuille 2: Sentiments (agrégés)
  if (report.sentimentAnalysis) {
    const sentimentSheet = workbook.addWorksheet('Analyse Sentiments');
    sentimentSheet.addRow(['Positif', `${report.sentimentAnalysis.sentiments.positifPct}%`]);
    sentimentSheet.addRow(['Neutre', `${report.sentimentAnalysis.sentiments.neutrePct}%`]);
    sentimentSheet.addRow(['Négatif', `${report.sentimentAnalysis.sentiments.negatifPct}%`]);
  }
  
  // PAS de feuille avec les réponses individuelles
  
  return workbook;
}
```

#### 1.3 Corriger `report.service.js`
- Supprimer tous les `include: [{ model: db.Etudiant }]`
- Utiliser `count()` avec `distinct` au lieu de `findAll()` + `group`
- Ne retourner que des statistiques agrégées

### Phase 2 : Validation

#### 2.1 Tests d'Anonymat
```bash
# Test 1: Vérifier qu'aucune donnée perso n'est exposée
curl http://localhost:3000/api/evaluations/:id/submissions | grep -i "nom\|prenom\|email"
# Résultat attendu: Aucune correspondance

# Test 2: Vérifier les rapports
curl http://localhost:3000/api/reports/:id | grep -i "nom\|prenom\|email"
# Résultat attendu: Aucune correspondance

# Test 3: Vérifier les exports
# Télécharger et ouvrir le fichier Excel
# Vérifier: Pas de noms/prénoms/emails
```

#### 2.2 Code Review
- [ ] Vérifier tous les `include` dans les services
- [ ] Vérifier tous les `map()` qui retournent des données
- [ ] Vérifier tous les exports
- [ ] Vérifier tous les endpoints publics

### Phase 3 : Documentation

#### 3.1 Ajouter des commentaires
```javascript
/**
 * IMPORTANT: Cette méthode respecte l'anonymat complet.
 * Ne JAMAIS exposer les données personnelles des étudiants.
 * Retourner uniquement des statistiques agrégées.
 */
async generateReport(evaluationId) {
  // ...
}
```

#### 3.2 Créer un guide
- Document "ANONYMITY_GUIDELINES.md"
- Checklist pour les développeurs
- Exemples de code conforme

---

## 📋 CHECKLIST DE CONFORMITÉ

### Pour chaque endpoint/méthode qui retourne des données:

- [ ] Aucun nom d'étudiant exposé
- [ ] Aucun prénom d'étudiant exposé
- [ ] Aucun email d'étudiant exposé
- [ ] Aucun matricule exposé (sauf pour l'étudiant lui-même)
- [ ] Pas de lien possible entre réponse et étudiant
- [ ] Uniquement des statistiques agrégées
- [ ] Utilisation de `attributes: []` ou liste limitée
- [ ] Pas d'include inutile de `db.Etudiant`
- [ ] Tests d'anonymat passés
- [ ] Documentation à jour

---

## 🎯 OBJECTIF FINAL

**Principe d'or** : Un administrateur/enseignant ne doit JAMAIS pouvoir identifier quel étudiant a donné quelle réponse.

**Données autorisées** :
- ✅ Statistiques agrégées (totaux, moyennes, pourcentages)
- ✅ Distributions (sans identités)
- ✅ Sentiments globaux
- ✅ Mots-clés agrégés
- ✅ Résumés IA (sans noms)

**Données interdites** :
- ❌ Noms/prénoms des étudiants
- ❌ Emails des étudiants
- ❌ Matricules (sauf pour l'étudiant lui-même)
- ❌ Réponses individuelles identifiables
- ❌ Tout lien réponse ↔ étudiant

---

**Priorité** : 🔴 **CRITIQUE - À CORRIGER IMMÉDIATEMENT**  
**Conformité RGPD** : ❌ **NON CONFORME**  
**Risque légal** : 🔴 **ÉLEVÉ**
