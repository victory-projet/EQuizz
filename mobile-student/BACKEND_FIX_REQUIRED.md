# 🔧 Corrections Requises Côté Backend

## ❌ Problème Identifié

L'application mobile fonctionne correctement, mais **aucune évaluation n'est retournée** par l'API.

### Logs de l'Application Mobile
```
✅ Response from /student/quizzes: {"data": [], "dataLength": 0, "status": 200}
```

### Informations de l'Utilisateur Connecté
```json
{
  "id": "e64f0e6e-0716-493f-92d7-c2b9a7bea92a",
  "nom": "sims",
  "prenom": "gills",
  "matricule": undefined,
  "classe": undefined
}
```

## 🔍 Diagnostic

### Problème 1 : Informations Incomplètes lors du Login
L'endpoint `/api/auth/login` ne retourne pas toutes les informations nécessaires de l'étudiant.

**Ce qui est retourné actuellement** :
```json
{
  "token": "...",
  "utilisateur": {
    "id": "...",
    "nom": "sims",
    "prenom": "gills",
    "email": "..."
  }
}
```

**Ce qui devrait être retourné** :
```json
{
  "token": "...",
  "utilisateur": {
    "id": "...",
    "nom": "sims",
    "prenom": "gills",
    "email": "gills.sims@saintjeaningenieur.org",
    "role": "etudiant",
    "Etudiant": {
      "matricule": "ING4-2024-001",
      "classe_id": "..."
    },
    "Classe": {
      "nom": "ING4 ISI FR",
      "Niveau": {
        "nom": "ING4"
      }
    },
    "Ecole": {
      "nom": "Saint Jean Ingenieur"
    }
  }
}
```

### Problème 2 : Aucune Évaluation Retournée
L'endpoint `/api/student/quizzes` retourne un tableau vide.

**Causes possibles** :
1. L'étudiant n'a pas de classe assignée dans la base de données
2. Les évaluations ne sont pas associées à la classe de l'étudiant
3. Les dates des évaluations sont expirées (dateDebut: 2024-11-01, dateFin: 2024-11-15)
4. Le statut des évaluations n'est pas "PUBLIEE"
5. La requête SQL ne fait pas les bonnes jointures

## ✅ Solutions Requises

### Solution 1 : Corriger l'Endpoint de Login

**Fichier** : `backend/src/routes/auth.routes.js` (ou similaire)

Modifier la réponse du login pour inclure toutes les informations :

```javascript
// Dans la route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { matricule, motDePasse } = req.body;
    
    // Trouver l'utilisateur avec toutes ses relations
    const utilisateur = await db.Utilisateur.findOne({
      where: { /* conditions */ },
      include: [
        {
          model: db.Etudiant,
          as: 'Etudiant',
          include: [
            {
              model: db.Classe,
              as: 'Classe',
              include: [
                {
                  model: db.Niveau,
                  as: 'Niveau'
                },
                {
                  model: db.Ecole,
                  as: 'Ecole'
                }
              ]
            }
          ]
        }
      ]
    });
    
    // Vérifier le mot de passe...
    
    // Générer le token...
    
    // Retourner la réponse complète
    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: 'etudiant',
        matricule: utilisateur.Etudiant?.matricule,
        Classe: utilisateur.Etudiant?.Classe ? {
          nom: utilisateur.Etudiant.Classe.nom,
          Niveau: {
            nom: utilisateur.Etudiant.Classe.Niveau?.nom
          }
        } : undefined,
        Ecole: utilisateur.Etudiant?.Classe?.Ecole ? {
          nom: utilisateur.Etudiant.Classe.Ecole.nom
        } : undefined
      }
    });
  } catch (error) {
    // Gestion d'erreur...
  }
});
```

### Solution 2 : Corriger l'Endpoint des Quiz

**Fichier** : `backend/src/routes/student.routes.js`

Vérifier que la route `/student/quizzes` :

1. **Récupère bien l'ID de l'étudiant depuis le token JWT**
2. **Trouve la classe de l'étudiant**
3. **Retourne les évaluations associées à cette classe**
4. **Filtre par statut PUBLIEE et dates valides**

```javascript
router.get('/quizzes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Depuis le token JWT
    
    console.log('🔍 Fetching quizzes for user:', userId);
    
    // 1. Trouver l'étudiant et sa classe
    const etudiant = await db.Etudiant.findOne({
      where: { id: userId },
      include: [{ model: db.Classe, as: 'Classe' }]
    });
    
    if (!etudiant) {
      console.log('❌ Étudiant non trouvé');
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    if (!etudiant.Classe) {
      console.log('❌ Étudiant sans classe');
      return res.json([]); // Pas d'erreur, juste pas de quiz
    }
    
    console.log('✅ Étudiant trouvé:', {
      id: etudiant.id,
      matricule: etudiant.matricule,
      classe: etudiant.Classe.nom
    });
    
    // 2. Trouver les évaluations pour cette classe
    const now = new Date();
    
    const evaluations = await db.Evaluation.findAll({
      where: {
        statut: 'PUBLIEE',
        dateDebut: { [db.Sequelize.Op.lte]: now },
        dateFin: { [db.Sequelize.Op.gte]: now }
      },
      include: [
        {
          model: db.Classe,
          as: 'Classes',
          where: { id: etudiant.classe_id },
          through: { attributes: [] }
        },
        {
          model: db.Cours,
          as: 'Cours',
          attributes: ['nom', 'code']
        },
        {
          model: db.Quizz,
          as: 'Quizz',
          include: [
            {
              model: db.Question,
              as: 'Questions'
            }
          ]
        }
      ]
    });
    
    console.log('✅ Évaluations trouvées:', evaluations.length);
    
    // 3. Formater la réponse
    const response = evaluations.map(eval => ({
      id: eval.id,
      titre: eval.titre,
      dateDebut: eval.dateDebut,
      dateFin: eval.dateFin,
      statut: 'En cours', // Calculer selon les dates
      nombreQuestions: eval.Quizz?.Questions?.length || 0,
      Cours: {
        nom: eval.Cours.nom
      },
      Classes: eval.Classes.map(c => ({ nom: c.nom }))
    }));
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});
```

### Solution 3 : Mettre à Jour les Dates des Évaluations

Les évaluations dans le seed ont des dates de novembre 2024 qui sont expirées.

**Option A** : Modifier le seed pour utiliser des dates dynamiques

```javascript
// Dans init.routes.js
const evaluation = await db.Evaluation.create({
  titre: 'Évaluation Mi-Parcours - Bases de Données',
  description: 'Évaluation de satisfaction du cours de Bases de Données Avancées',
  dateDebut: new Date(), // Aujourd'hui
  dateFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
  datePublication: new Date(),
  typeEvaluation: 'MI_PARCOURS',
  statut: 'PUBLIEE',
  administrateur_id: adminUser.id,
  cours_id: cours1.id
}, { transaction });
```

**Option B** : Créer une route pour mettre à jour les dates

```javascript
router.post('/update-evaluation-dates', async (req, res) => {
  try {
    await db.Evaluation.update(
      {
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        where: { statut: 'PUBLIEE' }
      }
    );
    
    res.json({ message: 'Dates mises à jour' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Solution 4 : Créer un Endpoint de Debug

Pour faciliter le débogage, créer un endpoint qui retourne toutes les informations :

```javascript
router.get('/debug/user-info', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const utilisateur = await db.Utilisateur.findByPk(userId, {
      include: [
        {
          model: db.Etudiant,
          as: 'Etudiant',
          include: [
            {
              model: db.Classe,
              as: 'Classe',
              include: [
                { model: db.Niveau, as: 'Niveau' },
                { model: db.Ecole, as: 'Ecole' }
              ]
            }
          ]
        }
      ]
    });
    
    const evaluations = await db.Evaluation.findAll({
      where: { statut: 'PUBLIEE' },
      include: [
        { model: db.Classe, as: 'Classes' },
        { model: db.Cours, as: 'Cours' }
      ]
    });
    
    res.json({
      utilisateur,
      evaluations,
      debug: {
        userId,
        hasEtudiant: !!utilisateur.Etudiant,
        hasClasse: !!utilisateur.Etudiant?.Classe,
        classeId: utilisateur.Etudiant?.classe_id,
        evaluationsCount: evaluations.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🧪 Tests à Effectuer Côté Backend

### Test 1 : Vérifier les Données dans la Base
```sql
-- Vérifier l'étudiant
SELECT u.id, u.nom, u.prenom, e.matricule, e.classe_id, c.nom as classe_nom
FROM Utilisateurs u
JOIN Etudiants e ON u.id = e.id
LEFT JOIN Classes c ON e.classe_id = c.id
WHERE u.nom = 'sims';

-- Vérifier les évaluations
SELECT ev.id, ev.titre, ev.statut, ev.dateDebut, ev.dateFin, c.nom as cours_nom
FROM Evaluations ev
JOIN Cours c ON ev.cours_id = c.id
WHERE ev.statut = 'PUBLIEE';

-- Vérifier les associations Evaluation-Classe
SELECT ec.evaluation_id, ec.classe_id, c.nom as classe_nom
FROM Evaluation_Classes ec
JOIN Classes c ON ec.classe_id = c.id;
```

### Test 2 : Tester l'Endpoint avec curl
```bash
# 1. Login
curl -X POST https://equizz-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"matricule":"ING4-2024-001","motDePasse":"Etudiant123!"}'

# 2. Récupérer les quiz (remplacer TOKEN)
curl https://equizz-production.up.railway.app/api/student/quizzes \
  -H "Authorization: Bearer TOKEN"

# 3. Debug (si endpoint créé)
curl https://equizz-production.up.railway.app/api/student/debug/user-info \
  -H "Authorization: Bearer TOKEN"
```

## 📝 Checklist de Correction

- [ ] Modifier `/api/auth/login` pour retourner toutes les informations
- [ ] Vérifier que l'étudiant a bien une classe assignée dans la DB
- [ ] Vérifier que les évaluations sont associées aux bonnes classes
- [ ] Mettre à jour les dates des évaluations (ou utiliser des dates dynamiques)
- [ ] Vérifier que le statut des évaluations est "PUBLIEE"
- [ ] Tester l'endpoint `/api/student/quizzes` avec curl
- [ ] Ajouter des logs dans le backend pour faciliter le débogage
- [ ] Créer un endpoint de debug si nécessaire

## 🎯 Résultat Attendu

Après ces corrections, l'endpoint `/api/student/quizzes` devrait retourner :

```json
[
  {
    "id": "...",
    "titre": "Évaluation Mi-Parcours - Bases de Données",
    "dateDebut": "2025-11-05T00:00:00.000Z",
    "dateFin": "2025-11-19T23:59:59.000Z",
    "statut": "En cours",
    "nombreQuestions": 5,
    "Cours": {
      "nom": "Bases de Données Avancées"
    },
    "Classes": [
      { "nom": "ING4 ISI FR" },
      { "nom": "ING4 ISI EN" }
    ]
  }
]
```

---

**Note** : L'application mobile fonctionne correctement. Le problème est uniquement côté backend.
