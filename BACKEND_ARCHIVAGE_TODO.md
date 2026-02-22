# 🔧 Backend - Implémentation de l'Archivage

## 📋 Checklist Complète

### Étape 1: Migration Base de Données ⏳

#### Créer le fichier de migration
```bash
cd backend
touch migrations/$(date +%Y%m%d%H%M%S)-add-est-archive-to-tables.js
```

#### Contenu de la migration

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter estArchive à Classe
    await queryInterface.addColumn('Classe', 'est_archive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    // Ajouter estArchive à Evaluation
    await queryInterface.addColumn('Evaluation', 'est_archive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    // Note: Cours a déjà le champ estArchive
    console.log('✅ Colonnes est_archive ajoutées avec succès');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Classe', 'est_archive');
    await queryInterface.removeColumn('Evaluation', 'est_archive');
    console.log('✅ Colonnes est_archive supprimées');
  }
};
```

#### Exécuter la migration
```bash
npx sequelize-cli db:migrate
```

---

### Étape 2: Modifier les Modèles ⏳

#### 1. Modifier `backend/src/models/Classe.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Classe = sequelize.define('Classe', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  niveau: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  anneeAcademiqueId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'annee_academique_id'
  },

  estArchive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'est_archive'
  }
}, {
  freezeTableName: true,
  timestamps: true,
  underscored: true,
  
  // Scopes pour filtrer automatiquement
  defaultScope: {
    where: { estArchive: false }
  },
  scopes: {
    archived: { 
      where: { estArchive: true } 
    },
    all: { 
      where: {} 
    }
  }
});

module.exports = Classe;
```

#### 2. Modifier `backend/src/models/Evaluation.js`

Ajouter le champ et les scopes:

```javascript
// Dans la définition du modèle, ajouter:
estArchive: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  allowNull: false,
  field: 'est_archive'
}

// Dans les options du modèle, ajouter:
{
  // ... autres options
  defaultScope: {
    where: { estArchive: false }
  },
  scopes: {
    archived: { 
      where: { estArchive: true } 
    },
    all: { 
      where: {} 
    }
  }
}
```

#### 3. Vérifier `backend/src/models/Cours.js`

Le champ `estArchive` existe déjà. Vérifier que les scopes sont présents:

```javascript
// Devrait déjà avoir:
estArchive: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  allowNull: false,
}

// Ajouter les scopes si absents:
{
  defaultScope: {
    where: { estArchive: false }
  },
  scopes: {
    archived: { where: { estArchive: true } },
    all: { where: {} }
  }
}
```

---

### Étape 3: Modifier les Services ⏳

#### 1. Modifier `backend/src/services/classe.service.js`

```javascript
class ClasseService {
  // Modifier findAll pour supporter includeArchived
  async findAll(includeArchived = false) {
    const scope = includeArchived ? 'all' : 'defaultScope';
    
    return db.Classe.scope(scope).findAll({
      include: [
        {
          model: db.AnneeAcademique,
          attributes: ['libelle', 'estCourante']
        },
        {
          model: db.Etudiant,
          attributes: ['id', 'matricule']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  // Ajouter méthode d'archivage
  async archive(id) {
    const classe = await db.Classe.scope('all').findByPk(id);
    if (!classe) {
      throw AppError.notFound('Classe non trouvée', 'CLASSE_NOT_FOUND');
    }
    
    await classe.update({ estArchive: true });
    return classe;
  }

  // Ajouter méthode de restauration
  async restore(id) {
    const classe = await db.Classe.scope('all').findByPk(id);
    if (!classe) {
      throw AppError.notFound('Classe non trouvée', 'CLASSE_NOT_FOUND');
    }
    
    await classe.update({ estArchive: false });
    return classe;
  }

  // Modifier update pour supporter estArchive
  async update(id, data) {
    const classe = await db.Classe.scope('all').findByPk(id);
    if (!classe) {
      throw AppError.notFound('Classe non trouvée', 'CLASSE_NOT_FOUND');
    }

    // Permettre la mise à jour de estArchive
    const allowedFields = ['nom', 'niveau', 'anneeAcademiqueId', 'estArchive'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    await classe.update(updateData);
    return this.findOne(id);
  }
}
```

#### 2. Modifier `backend/src/services/evaluation.service.js`

```javascript
class EvaluationService {
  // Modifier findAll
  async findAll(includeArchived = false) {
    const scope = includeArchived ? 'all' : 'defaultScope';
    
    return db.Evaluation.scope(scope).findAll({
      include: [
        // ... includes existants
      ],
      order: [['dateCreation', 'DESC']]
    });
  }

  // Ajouter méthode d'archivage
  async archive(id) {
    const evaluation = await db.Evaluation.scope('all').findByPk(id);
    if (!evaluation) {
      throw AppError.notFound('Évaluation non trouvée', 'EVALUATION_NOT_FOUND');
    }
    
    await evaluation.update({ estArchive: true });
    return evaluation;
  }

  // Ajouter méthode de restauration
  async restore(id) {
    const evaluation = await db.Evaluation.scope('all').findByPk(id);
    if (!evaluation) {
      throw AppError.notFound('Évaluation non trouvée', 'EVALUATION_NOT_FOUND');
    }
    
    await evaluation.update({ estArchive: false });
    return evaluation;
  }

  // Modifier update pour supporter estArchive
  async update(id, data) {
    const evaluation = await db.Evaluation.scope('all').findByPk(id);
    if (!evaluation) {
      throw AppError.notFound('Évaluation non trouvée', 'EVALUATION_NOT_FOUND');
    }

    // Permettre la mise à jour de estArchive
    const allowedFields = ['titre', 'description', 'dateDebut', 'dateFin', 'estArchive'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    await evaluation.update(updateData);
    return this.findOne(id);
  }
}
```

#### 3. Vérifier `backend/src/services/cours.service.js`

Vérifier que les méthodes archive/restore existent déjà.

---

### Étape 4: Modifier les Contrôleurs ⏳

#### 1. Modifier `backend/src/controllers/classe.controller.js`

```javascript
class ClasseController {
  // Modifier getAll pour supporter query param
  async getAll(req, res, next) {
    try {
      const includeArchived = req.query.includeArchived === 'true';
      const classes = await classeService.findAll(includeArchived);
      
      res.json({
        success: true,
        data: classes
      });
    } catch (error) {
      next(error);
    }
  }

  // Ajouter endpoint d'archivage
  async archive(req, res, next) {
    try {
      const classe = await classeService.archive(req.params.id);
      
      res.json({
        success: true,
        message: 'Classe archivée avec succès',
        data: classe
      });
    } catch (error) {
      next(error);
    }
  }

  // Ajouter endpoint de restauration
  async restore(req, res, next) {
    try {
      const classe = await classeService.restore(req.params.id);
      
      res.json({
        success: true,
        message: 'Classe restaurée avec succès',
        data: classe
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClasseController();
```

#### 2. Modifier `backend/src/controllers/evaluation.controller.js`

Même pattern que pour les classes.

---

### Étape 5: Ajouter les Routes ⏳

#### 1. Modifier `backend/src/routes/classe.routes.js`

```javascript
const router = require('express').Router();
const classeController = require('../controllers/classe.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes existantes...

// Nouvelles routes d'archivage
router.put('/:id/archive', authMiddleware, classeController.archive);
router.put('/:id/restore', authMiddleware, classeController.restore);

module.exports = router;
```

#### 2. Modifier `backend/src/routes/evaluation.routes.js`

```javascript
// Ajouter les routes d'archivage
router.put('/:id/archive', authMiddleware, evaluationController.archive);
router.put('/:id/restore', authMiddleware, evaluationController.restore);
```

#### 3. Vérifier `backend/src/routes/cours.routes.js`

Vérifier que les routes d'archivage existent déjà.

---

### Étape 6: Tests ⏳

#### Tests avec Postman/Thunder Client

**1. Archiver une classe**
```
PUT http://localhost:3000/api/classes/:id/archive
Authorization: Bearer <token>
```

**2. Restaurer une classe**
```
PUT http://localhost:3000/api/classes/:id/restore
Authorization: Bearer <token>
```

**3. Lister avec archivés**
```
GET http://localhost:3000/api/classes?includeArchived=true
Authorization: Bearer <token>
```

**4. Lister sans archivés (défaut)**
```
GET http://localhost:3000/api/classes
Authorization: Bearer <token>
```

Répéter pour évaluations et cours.

---

## 📝 Commandes Rapides

```bash
# 1. Créer la migration
cd backend
touch migrations/$(date +%Y%m%d%H%M%S)-add-est-archive-to-tables.js

# 2. Exécuter la migration
npx sequelize-cli db:migrate

# 3. Redémarrer le serveur
npm run dev

# 4. Tester avec curl
curl -X PUT http://localhost:3000/api/classes/:id/archive \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Checklist Finale

- [ ] Migration créée et exécutée
- [ ] Modèle Classe modifié avec scopes
- [ ] Modèle Evaluation modifié avec scopes
- [ ] Modèle Cours vérifié
- [ ] Service Classe modifié
- [ ] Service Evaluation modifié
- [ ] Service Cours vérifié
- [ ] Contrôleur Classe modifié
- [ ] Contrôleur Evaluation modifié
- [ ] Routes Classe ajoutées
- [ ] Routes Evaluation ajoutées
- [ ] Tests Postman réussis
- [ ] Tests frontend réussis
- [ ] Documentation mise à jour

---

**Temps estimé:** 1-2 heures
**Difficulté:** Moyenne
**Priorité:** Haute
