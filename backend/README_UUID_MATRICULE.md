# Implémentation UUID et Matricule - Documentation

## Vue d'ensemble

Ce document décrit l'implémentation du système d'identification des étudiants utilisant à la fois un UUID (identifiant unique universel) et un matricule (numéro d'étudiant).

## Architecture

### Champs d'identification

Chaque étudiant possède deux identifiants distincts :

1. **UUID** : Identifiant unique généré automatiquement par le système
   - Type : STRING (36 caractères)
   - Format : UUID v4 (ex: `550e8400-e29b-41d4-a716-446655440000`)
   - Génération : Automatique via `uuidv4()`
   - Usage : Identification interne et sécurisée

2. **Matricule** : Numéro d'étudiant fourni par l'établissement
   - Type : STRING
   - Format : Variable selon l'établissement
   - Génération : Fourni lors de l'import ou la création
   - Usage : Identification académique et administrative

### Modèle de données

```javascript
// Modèle Etudiant
{
  id: INTEGER (Primary Key, Auto-increment),
  uuid: STRING (36) - UNIQUE, NOT NULL,
  matricule: STRING - UNIQUE, NOT NULL,
  nom: STRING,
  prenom: STRING,
  email: STRING,
  // ... autres champs
}
```

## Implémentation

### 1. Génération de l'UUID

L'UUID est généré automatiquement lors de la création d'un étudiant :

```javascript
const { v4: uuidv4 } = require('uuid');

// Dans le modèle ou le service
const etudiant = await Etudiant.create({
  uuid: uuidv4(),
  matricule: matriculeValue,
  nom: nomValue,
  prenom: prenomValue,
  // ...
});
```

### 2. Validation du matricule

Le matricule doit être unique et non vide :

```javascript
// Validation avant création
if (!matricule || matricule.trim() === '') {
  throw new Error('Le matricule est obligatoire');
}

// Vérification d'unicité
const existingStudent = await Etudiant.findOne({ 
  where: { matricule } 
});

if (existingStudent) {
  throw new Error('Ce matricule existe déjà');
}
```

### 3. Recherche d'étudiants

Les étudiants peuvent être recherchés par UUID ou matricule :

```javascript
// Recherche par UUID
const etudiant = await Etudiant.findOne({ 
  where: { uuid: uuidValue } 
});

// Recherche par matricule
const etudiant = await Etudiant.findOne({ 
  where: { matricule: matriculeValue } 
});
```

## Tests unitaires

### Test 1 : Génération automatique de l'UUID

```javascript
describe('UUID Generation', () => {
  test('should automatically generate UUID on student creation', async () => {
    const etudiant = await Etudiant.create({
      matricule: 'TEST001',
      nom: 'Dupont',
      prenom: 'Jean'
    });
    
    expect(etudiant.uuid).toBeDefined();
    expect(etudiant.uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
```

### Test 2 : Unicité de l'UUID

```javascript
describe('UUID Uniqueness', () => {
  test('should ensure UUID is unique', async () => {
    const etudiant1 = await Etudiant.create({
      matricule: 'TEST001',
      nom: 'Dupont',
      prenom: 'Jean'
    });
    
    const etudiant2 = await Etudiant.create({
      matricule: 'TEST002',
      nom: 'Martin',
      prenom: 'Marie'
    });
    
    expect(etudiant1.uuid).not.toBe(etudiant2.uuid);
  });
});
```

### Test 3 : Validation du matricule obligatoire

```javascript
describe('Matricule Validation', () => {
  test('should require matricule field', async () => {
    await expect(
      Etudiant.create({
        nom: 'Dupont',
        prenom: 'Jean'
      })
    ).rejects.toThrow();
  });
  
  test('should reject empty matricule', async () => {
    await expect(
      Etudiant.create({
        matricule: '',
        nom: 'Dupont',
        prenom: 'Jean'
      })
    ).rejects.toThrow();
  });
});
```

### Test 4 : Unicité du matricule

```javascript
describe('Matricule Uniqueness', () => {
  test('should ensure matricule is unique', async () => {
    await Etudiant.create({
      matricule: 'TEST001',
      nom: 'Dupont',
      prenom: 'Jean'
    });
    
    await expect(
      Etudiant.create({
        matricule: 'TEST001',
        nom: 'Martin',
        prenom: 'Marie'
      })
    ).rejects.toThrow();
  });
});
```

### Test 5 : Recherche par UUID

```javascript
describe('Find by UUID', () => {
  test('should find student by UUID', async () => {
    const created = await Etudiant.create({
      matricule: 'TEST001',
      nom: 'Dupont',
      prenom: 'Jean'
    });
    
    const found = await Etudiant.findOne({ 
      where: { uuid: created.uuid } 
    });
    
    expect(found).toBeDefined();
    expect(found.id).toBe(created.id);
    expect(found.matricule).toBe('TEST001');
  });
});
```

### Test 6 : Recherche par matricule

```javascript
describe('Find by Matricule', () => {
  test('should find student by matricule', async () => {
    const created = await Etudiant.create({
      matricule: 'TEST001',
      nom: 'Dupont',
      prenom: 'Jean'
    });
    
    const found = await Etudiant.findOne({ 
      where: { matricule: 'TEST001' } 
    });
    
    expect(found).toBeDefined();
    expect(found.uuid).toBe(created.uuid);
    expect(found.nom).toBe('Dupont');
  });
});
```

### Test 7 : Import en masse avec UUID

```javascript
describe('Bulk Import with UUID', () => {
  test('should generate unique UUIDs for bulk import', async () => {
    const students = [
      { matricule: 'TEST001', nom: 'Dupont', prenom: 'Jean' },
      { matricule: 'TEST002', nom: 'Martin', prenom: 'Marie' },
      { matricule: 'TEST003', nom: 'Durand', prenom: 'Paul' }
    ];
    
    const created = await Etudiant.bulkCreate(
      students.map(s => ({ ...s, uuid: uuidv4() }))
    );
    
    const uuids = created.map(e => e.uuid);
    const uniqueUuids = new Set(uuids);
    
    expect(uniqueUuids.size).toBe(students.length);
  });
});
```

### Test 8 : Mise à jour sans modifier l'UUID

```javascript
describe('Update without changing UUID', () => {
  test('should keep UUID unchanged on update', async () => {
    const etudiant = await Etudiant.create({
      matricule: 'TEST001',
      nom: 'Dupont',
      prenom: 'Jean'
    });
    
    const originalUuid = etudiant.uuid;
    
    await etudiant.update({ nom: 'Dupont-Martin' });
    
    expect(etudiant.uuid).toBe(originalUuid);
  });
});
```

## Migration de base de données

### Ajout des colonnes UUID et matricule

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Etudiants', 'uuid', {
      type: Sequelize.STRING(36),
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.UUIDV4
    });
    
    await queryInterface.addColumn('Etudiants', 'matricule', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Etudiants', 'uuid');
    await queryInterface.removeColumn('Etudiants', 'matricule');
  }
};
```

### Migration de la table des transferts (Historique Etudiant)

La table `HistoriqueEtudiant` stocke l'historique complet des transferts d'étudiants entre classes et écoles.

#### Structure de la table

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('HistoriqueEtudiants', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      etudiant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Etudiants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      matricule: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ecole_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Ecoles',
          key: 'id'
        }
      },
      classe_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Classes',
          key: 'id'
        }
      },
      date_debut: {
        type: Sequelize.DATE,
        allowNull: false
      },
      date_fin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      est_periode_actuelle: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Index pour améliorer les performances
    await queryInterface.addIndex('HistoriqueEtudiants', ['etudiant_id']);
    await queryInterface.addIndex('HistoriqueEtudiants', ['matricule']);
    await queryInterface.addIndex('HistoriqueEtudiants', ['ecole_id']);
    await queryInterface.addIndex('HistoriqueEtudiants', ['classe_id']);
    await queryInterface.addIndex('HistoriqueEtudiants', ['est_periode_actuelle']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('HistoriqueEtudiants');
  }
};
```

### Exécution des migrations selon l'environnement

#### Sur Windows (CMD)

```cmd
REM Exécuter toutes les migrations en attente
npm run migrate

REM Annuler la dernière migration
npm run migrate:undo

REM Annuler toutes les migrations
npx sequelize-cli db:migrate:undo:all

REM Créer une nouvelle migration
npx sequelize-cli migration:generate --name add-historique-etudiant

REM Vérifier le statut des migrations
npx sequelize-cli db:migrate:status
```

#### Sur Windows (PowerShell)

```powershell
# Exécuter toutes les migrations en attente
npm run migrate

# Annuler la dernière migration
npm run migrate:undo

# Annuler toutes les migrations
npx sequelize-cli db:migrate:undo:all

# Créer une nouvelle migration
npx sequelize-cli migration:generate --name add-historique-etudiant

# Vérifier le statut des migrations
npx sequelize-cli db:migrate:status
```

#### Sur Linux/Mac (Bash)

```bash
# Exécuter toutes les migrations en attente
npm run migrate

# Annuler la dernière migration
npm run migrate:undo

# Annuler toutes les migrations
npx sequelize-cli db:migrate:undo:all

# Créer une nouvelle migration
npx sequelize-cli migration:generate --name add-historique-etudiant

# Vérifier le statut des migrations
npx sequelize-cli db:migrate:status

# Rendre le script exécutable (si nécessaire)
chmod +x test-transfert-manuel.sh
```

### Scripts de test des transferts selon l'environnement

#### Windows - test-transfert-manuel.bat

```batch
@echo off
REM Script de test manuel pour l'endpoint de transfert d'étudiant (Windows)

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:3000
set ADMIN_TOKEN=votre-token-admin-ici

echo Test de transfert d'etudiant
echo ========================================

REM Créer un étudiant
curl -X POST "%BASE_URL%/api/academic/etudiants" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"Test\",\"prenom\":\"Transfert\",\"matricule\":\"TEST001\"}"

REM Transférer l'étudiant
curl -X POST "%BASE_URL%/api/academic/etudiants/ETUDIANT_ID/transfert" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"nouvelleClasseId\":\"CLASSE_ID_2\"}"

REM Consulter l'historique
curl -X GET "%BASE_URL%/api/academic/etudiants/ETUDIANT_ID/historique" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%"

endlocal
```

Exécution :
```cmd
test-transfert-manuel.bat
```

#### Linux/Mac - test-transfert-manuel.sh

```bash
#!/bin/bash
# Script de test manuel pour l'endpoint de transfert d'étudiant

BASE_URL="http://localhost:3000"
ADMIN_TOKEN="votre-token-admin-ici"

echo "Test de transfert d'étudiant"
echo "========================================"

# Créer un étudiant
ETUDIANT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/academic/etudiants" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "Transfert",
    "matricule": "TEST001"
  }')

ETUDIANT_ID=$(echo $ETUDIANT_RESPONSE | jq -r '.id')

# Transférer l'étudiant
curl -s -X POST "$BASE_URL/api/academic/etudiants/$ETUDIANT_ID/transfert" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nouvelleClasseId": "CLASSE_ID_2"
  }'

# Consulter l'historique
curl -s -X GET "$BASE_URL/api/academic/etudiants/$ETUDIANT_ID/historique" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Exécution :
```bash
chmod +x test-transfert-manuel.sh
./test-transfert-manuel.sh
```

### Configuration de l'environnement

#### Fichier .env

```env
# Configuration de la base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nom_base_donnees
DB_USER=utilisateur
DB_PASSWORD=mot_de_passe
DB_DIALECT=mysql

# Configuration JWT
JWT_SECRET=votre_secret_jwt
JWT_REFRESH_SECRET=votre_secret_refresh

# Configuration serveur
PORT=3000
NODE_ENV=development
```

#### Vérification de l'environnement

```javascript
// Vérifier la configuration avant migration
const config = require('./config/config.js');
const env = process.env.NODE_ENV || 'development';

console.log('Environnement:', env);
console.log('Base de données:', config[env].database);
console.log('Hôte:', config[env].host);
```

### Workflow complet de migration

#### 1. Développement local

```bash
# Windows (CMD)
npm run migrate
npm run test

# Linux/Mac
npm run migrate
npm test
```

#### 2. Environnement de test

```bash
# Définir l'environnement
set NODE_ENV=test        # Windows CMD
$env:NODE_ENV="test"     # Windows PowerShell
export NODE_ENV=test     # Linux/Mac

# Exécuter les migrations
npm run migrate

# Exécuter les tests
npm test
```

#### 3. Production

```bash
# Sauvegarder la base de données
mysqldump -u user -p database > backup.sql    # Linux/Mac
# Ou utiliser un outil GUI sur Windows

# Exécuter les migrations
set NODE_ENV=production  # Windows
export NODE_ENV=production  # Linux/Mac
npm run migrate

# Vérifier l'intégrité
npm run test
```

### Rollback en cas de problème

```bash
# Annuler la dernière migration
npm run migrate:undo

# Restaurer depuis une sauvegarde (si nécessaire)
mysql -u user -p database < backup.sql    # Linux/Mac
# Ou utiliser un outil GUI sur Windows
```

## Bonnes pratiques

### 1. Utilisation de l'UUID

- Utiliser l'UUID pour les API publiques et les URLs
- Ne jamais exposer l'ID numérique interne
- Utiliser l'UUID pour les relations entre tables sensibles

### 2. Utilisation du matricule

- Utiliser le matricule pour l'affichage utilisateur
- Permettre la recherche par matricule dans l'interface admin
- Valider le format du matricule selon les règles de l'établissement

### 3. Sécurité

- Ne pas utiliser l'ID séquentiel dans les URLs publiques
- Utiliser l'UUID pour éviter l'énumération des ressources
- Indexer les colonnes uuid et matricule pour les performances

## Exemples d'utilisation

### Création d'un étudiant

```javascript
const nouvelEtudiant = await Etudiant.create({
  uuid: uuidv4(),
  matricule: '2024001',
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@example.com'
});
```

### Recherche d'un étudiant

```javascript
// Par UUID (pour API)
const etudiant = await Etudiant.findOne({ 
  where: { uuid: req.params.uuid } 
});

// Par matricule (pour interface admin)
const etudiant = await Etudiant.findOne({ 
  where: { matricule: req.body.matricule } 
});
```

### Import CSV avec matricule

```javascript
const csvData = parseCsv(fileContent);

for (const row of csvData) {
  await Etudiant.create({
    uuid: uuidv4(),
    matricule: row.matricule,
    nom: row.nom,
    prenom: row.prenom,
    email: row.email
  });
}
```

## Commandes de test

### Exécuter tous les tests

```bash
npm test
```

### Exécuter les tests UUID/Matricule uniquement

```bash
npm test -- --testNamePattern="UUID|Matricule"
```

### Exécuter les tests avec couverture

```bash
npm test -- --coverage
```

## Dépannage

### Problème : UUID non généré

Vérifier que le package uuid est installé :
```bash
npm install uuid
```

### Problème : Erreur de duplication de matricule

Vérifier l'unicité avant l'insertion :
```javascript
const exists = await Etudiant.findOne({ where: { matricule } });
if (exists) {
  throw new Error('Matricule déjà utilisé');
}
```

### Problème : Performance des recherches

Ajouter des index sur les colonnes :
```javascript
await queryInterface.addIndex('Etudiants', ['uuid']);
await queryInterface.addIndex('Etudiants', ['matricule']);
```

## Conclusion

L'implémentation du système UUID/Matricule offre :

- Identification unique et sécurisée via UUID
- Compatibilité avec les systèmes académiques via matricule
- Flexibilité pour les API et interfaces utilisateur
- Sécurité renforcée contre l'énumération
- Tests complets garantissant la fiabilité du système
