# Guide de Test - Import Excel et Système de Matricule/UUID

Ce document décrit les étapes pour tester l'import Excel d'étudiants et le système d'identification par UUID et matricule.

---

## Fonctionnalités testées

1. Import/création d'étudiants depuis Excel
2. Mise à jour d'étudiants existants (UPSERT)
3. Génération automatique d'UUID pour chaque étudiant
4. Génération automatique de matricule si non fourni
5. Utilisation du matricule fourni dans le fichier Excel
6. Création automatique de l'historique étudiant
7. Validation du fichier avant import (dry-run)

---

## Prérequis

- Serveur backend démarré
- Compte administrateur actif
- Postman ou Insomnia installé
- Au moins une classe existante en base de données

---

## Tests Manuels - Étapes détaillées

### ÉTAPE 1 : Démarrer le serveur

```bash
cd backend
npm run dev
```

Attendre le message de confirmation du démarrage.

---

### ÉTAPE 2 : Créer le fichier Excel de test

```bash
node create-exemple-import.js
```

Cela génère `backend/exemple-import-etudiants.xlsx` avec 3 étudiants :
- Jean Dupont (avec matricule 2025001)
- Marie Martin (avec matricule 2025002)
- Paul Durand (sans matricule, sera généré)

---

### ÉTAPE 3 : Authentification

**Requête :**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@saintjeaningenieur.org",
  "password": "Admin123!"
}
```

**Réponse attendue :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-admin",
    "email": "admin@saintjeaningenieur.org",
    "role": "ADMINISTRATEUR"
  }
}
```

Copier le token pour les requêtes suivantes.

---

### ÉTAPE 4 : Récupérer l'ID d'une classe

**Requête :**
```http
GET http://localhost:3000/api/academic/classes
Authorization: Bearer VOTRE_TOKEN
```

**Réponse attendue :**
```json
[
  {
    "id": "classe-uuid-123",
    "nom": "L1-INFO",
    "niveau": "L1",
    ...
  }
]
```

Noter l'ID d'une classe pour l'import.

---

### ÉTAPE 5 : Validation du fichier Excel (optionnel)

**Configuration Postman/Insomnia :**
- Méthode : POST
- URL : `http://localhost:3000/api/academic/etudiants/validate`
- Headers : `Authorization: Bearer VOTRE_TOKEN`
- Body : form-data
  - Clé : `file` (type: File) - Sélectionner `exemple-import-etudiants.xlsx`
  - Clé : `classeId` (type: Text) - ID de classe (optionnel)

**Réponse attendue :**
```json
{
  "message": "Validation: 3 ligne(s) valide(s), 0 erreur(s)",
  "valid": [
    {
      "row": 2,
      "data": {
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean.dupont@saintjeaningenieur.org",
        "matricule": "2025001",
        "idCarte": "CARD001",
        "classeNom": "L1-INFO",
        "action": "CREATE"
      }
    },
    ...
  ],
  "errors": [],
  "warnings": []
}
```

---

### ÉTAPE 6 : Import du fichier Excel

**Configuration Postman/Insomnia :**
- Méthode : POST
- URL : `http://localhost:3000/api/academic/etudiants/import`
- Headers : `Authorization: Bearer VOTRE_TOKEN`
- Body : form-data
  - Clé : `file` (type: File) - Sélectionner `exemple-import-etudiants.xlsx`
  - Clé : `classeId` (type: Text) - ID de classe (optionnel si classe dans Excel)

**Réponse attendue :**
```json
{
  "message": "Import terminé: 3 créé(s), 0 mis à jour, 0 erreur(s)",
  "created": [
    {
      "id": "uuid-generated-1",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@saintjeaningenieur.org",
      "matricule": "2025001",
      "idCarte": "CARD001",
      "classe": "L1-INFO"
    },
    {
      "id": "uuid-generated-2",
      "nom": "Martin",
      "prenom": "Marie",
      "email": "marie.martin@saintjeaningenieur.org",
      "matricule": "2025002",
      "idCarte": "CARD002",
      "classe": "L1-INFO"
    },
    {
      "id": "uuid-generated-3",
      "nom": "Durand",
      "prenom": "Paul",
      "email": "paul.durand@saintjeaningenieur.org",
      "matricule": "AUTO-GENERATED",
      "idCarte": null,
      "classe": "L2-MATH"
    }
  ],
  "updated": [],
  "errors": [],
  "stats": {
    "totalRows": 3,
    "created": 3,
    "updated": 0,
    "errors": 0,
    "skipped": 0
  }
}
```

**Points à vérifier :**
- Chaque étudiant a un UUID unique généré
- Les matricules fournis (2025001, 2025002) sont conservés
- Le matricule de Paul Durand est généré automatiquement
- L'idCarte est optionnel (null pour Paul Durand)

---

### ÉTAPE 7 : Vérifier les étudiants créés

**Requête :**
```http
GET http://localhost:3000/api/academic/etudiants
Authorization: Bearer VOTRE_TOKEN
```

**Vérifications :**
- Les 3 étudiants apparaissent dans la liste
- Chaque étudiant a un UUID unique
- Les matricules sont corrects
- Les classes sont assignées

---

### ÉTAPE 8 : Vérifier l'historique d'un étudiant

**Requête :**
```http
GET http://localhost:3000/api/academic/etudiants/{UUID_ETUDIANT}/historique
Authorization: Bearer VOTRE_TOKEN
```

**Réponse attendue :**
```json
[
  {
    "id": "historique-uuid",
    "etudiant_id": "uuid-etudiant",
    "matricule": "2025001",
    "ecole_id": "ecole-uuid",
    "classe_id": "classe-uuid",
    "dateDebut": "2026-02-15T10:00:00.000Z",
    "dateFin": null,
    "estPeriodeActuelle": true,
    "Ecole": {
      "id": "ecole-uuid",
      "nom": "École Test"
    },
    "Classe": {
      "id": "classe-uuid",
      "nom": "L1-INFO"
    }
  }
]
```

**Vérifications :**
- Une entrée d'historique existe
- `estPeriodeActuelle` est true
- `dateFin` est null
- Le matricule correspond

---

### ÉTAPE 9 : Test de mise à jour (UPSERT)

Modifier le fichier Excel :
1. Ouvrir `exemple-import-etudiants.xlsx`
2. Changer "Jean" en "Jacques" (ligne 2)
3. Garder le même email
4. Changer l'action en "UPSERT"
5. Sauvegarder

Réimporter le fichier (répéter ÉTAPE 6)

**Réponse attendue :**
```json
{
  "message": "Import terminé: 0 créé(s), 1 mis à jour, 0 erreur(s)",
  "created": [],
  "updated": [
    {
      "id": "même-uuid-qu-avant",
      "nom": "Dupont",
      "prenom": "Jacques",
      "email": "jean.dupont@saintjeaningenieur.org",
      "matricule": "2025001",
      "idCarte": "CARD001",
      "classe": "L1-INFO"
    }
  ],
  "errors": [],
  "stats": {
    "totalRows": 1,
    "created": 0,
    "updated": 1,
    "errors": 0
  }
}
```

**Vérifications :**
- L'UUID reste identique
- Le prénom est mis à jour
- Le matricule reste identique
- Aucun doublon créé

---

### ÉTAPE 10 : Test des erreurs

#### Test 1 : Email dupliqué avec action CREATE

Modifier le fichier Excel :
- Utiliser un email existant
- Action : CREATE

**Réponse attendue :**
```json
{
  "message": "Import terminé: 0 créé(s), 0 mis à jour, 1 erreur(s)",
  "created": [],
  "updated": [],
  "errors": [
    {
      "row": 2,
      "error": "L'étudiant existe déjà (utilisez UPDATE ou UPSERT)"
    }
  ],
  "stats": {
    "totalRows": 1,
    "created": 0,
    "updated": 0,
    "errors": 1
  }
}
```

#### Test 2 : Classe inexistante

Modifier le fichier Excel :
- Mettre un nom de classe qui n'existe pas
- Exemple : "CLASSE-INEXISTANTE"

**Réponse attendue :**
```json
{
  "errors": [
    {
      "row": 2,
      "error": "Classe non trouvée: CLASSE-INEXISTANTE"
    }
  ]
}
```

#### Test 3 : Champs obligatoires manquants

Modifier le fichier Excel :
- Laisser le champ "Email" vide

**Réponse attendue :**
```json
{
  "errors": [
    {
      "row": 2,
      "error": "Les colonnes Nom, Prenom et Email sont obligatoires"
    }
  ]
}
```

---

## Tests Unitaires

### Exécution des tests

```bash
cd backend
npm test -- etudiant-import.test.js
```

### Tests implémentés

#### Test 1 : Import de nouveaux étudiants
```javascript
it('devrait créer de nouveaux étudiants', async () => {
  // Vérifie que les étudiants sont créés avec UUID et matricule
});
```

**Vérifications :**
- UUID généré automatiquement
- Matricule utilisé ou généré
- Utilisateur créé
- Étudiant créé
- Historique créé

#### Test 2 : Rejet fichier Excel vide
```javascript
it('devrait rejeter un fichier Excel vide', async () => {
  // Vérifie qu'une erreur est levée pour un fichier vide
});
```

**Vérifications :**
- Exception levée
- Message d'erreur approprié

#### Test 3 : Validation des champs obligatoires
```javascript
it('devrait valider les champs obligatoires', async () => {
  // Vérifie que les champs manquants sont détectés
});
```

**Vérifications :**
- Erreur pour champ Nom manquant
- Erreur pour champ Prenom manquant
- Erreur pour champ Email manquant

#### Test 4 : Validation du fichier (dry-run)
```javascript
it('devrait valider un fichier Excel correct', async () => {
  // Vérifie la validation sans import
});
```

**Vérifications :**
- Lignes valides identifiées
- Aucune erreur détectée
- Aucun import effectué

#### Test 5 : Détection des erreurs de validation
```javascript
it('devrait détecter les erreurs de validation', async () => {
  // Vérifie que les erreurs sont détectées
});
```

**Vérifications :**
- Email invalide détecté
- Champs manquants détectés
- Actions invalides détectées

---

## Vérification en Base de Données

### Requête SQL : Voir tous les étudiants avec UUID et matricule

```sql
SELECT 
  u.id as uuid,
  u.nom,
  u.prenom,
  u.email,
  e.matricule,
  e.idCarte,
  c.nom as classe
FROM Utilisateurs u
JOIN Etudiants e ON e.id = u.id
JOIN Classes c ON c.id = e.classe_id
ORDER BY u.createdAt DESC;
```

### Requête SQL : Voir l'historique d'un étudiant

```sql
SELECT 
  h.id,
  h.etudiant_id,
  h.matricule,
  h.dateDebut,
  h.dateFin,
  h.estPeriodeActuelle,
  e.nom as ecole,
  c.nom as classe
FROM HistoriqueEtudiants h
JOIN Ecoles e ON e.id = h.ecole_id
JOIN Classes c ON c.id = h.classe_id
WHERE h.etudiant_id = 'UUID_ETUDIANT'
ORDER BY h.dateDebut DESC;
```

### Requête SQL : Vérifier l'unicité des UUID

```sql
SELECT id, COUNT(*) as count
FROM Utilisateurs
GROUP BY id
HAVING count > 1;
```

Résultat attendu : Aucune ligne (tous les UUID sont uniques)

### Requête SQL : Vérifier l'unicité des matricules

```sql
SELECT matricule, COUNT(*) as count
FROM Etudiants
GROUP BY matricule
HAVING count > 1;
```

Résultat attendu : Aucune ligne (tous les matricules sont uniques)

---

## Checklist de validation

### Fonctionnalités UUID

- [ ] Chaque étudiant a un UUID unique
- [ ] L'UUID est généré automatiquement à la création
- [ ] L'UUID ne change jamais (même lors de mise à jour)
- [ ] L'UUID est utilisé comme clé primaire
- [ ] L'UUID est utilisé dans les relations (historique, etc.)

### Fonctionnalités Matricule

- [ ] Le matricule fourni dans Excel est utilisé
- [ ] Le matricule est généré automatiquement si non fourni
- [ ] Le matricule est unique par étudiant
- [ ] Le matricule change lors d'un transfert d'école
- [ ] Le matricule reste identique lors d'un changement de classe (même école)
- [ ] L'ancien matricule est conservé dans l'historique

### Fonctionnalités Import Excel

- [ ] Import de nouveaux étudiants (CREATE)
- [ ] Mise à jour d'étudiants existants (UPDATE)
- [ ] Création ou mise à jour automatique (UPSERT)
- [ ] Validation avant import (dry-run)
- [ ] Gestion des erreurs par ligne
- [ ] Rapport détaillé après import
- [ ] Support de l'idCarte optionnel
- [ ] Assignation automatique à une classe

### Fonctionnalités Historique

- [ ] Création automatique de l'historique à l'import
- [ ] Une seule période actuelle par étudiant
- [ ] Clôture automatique lors d'un transfert
- [ ] Conservation de tous les matricules historiques
- [ ] Dates de début et fin correctes

---

## Cas d'usage réels

### Cas 1 : Import initial d'une promotion

1. Préparer un fichier Excel avec 30 étudiants
2. Ne pas fournir de matricules (génération automatique)
3. Action : CREATE
4. Résultat : 30 étudiants créés avec UUID et matricule uniques

### Cas 2 : Mise à jour des informations

1. Exporter la liste des étudiants
2. Modifier les emails ou noms
3. Action : UPDATE
4. Résultat : Informations mises à jour, UUID et matricule inchangés

### Cas 3 : Import avec correction d'erreurs

1. Premier import avec quelques erreurs
2. Corriger les lignes en erreur
3. Action : UPSERT
4. Résultat : Lignes corrigées importées, pas de doublons

### Cas 4 : Transfert d'école via Excel

1. Modifier la classe d'un étudiant vers une autre école
2. Action : UPSERT
3. Résultat : Nouveau matricule généré, historique mis à jour

---

## Dépannage

### Problème : "Classe non trouvée"

**Solution :**
- Vérifier que le nom de classe dans Excel existe exactement en base
- Ou fournir le paramètre `classeId` dans le body de la requête

### Problème : "Email existe déjà"

**Solution :**
- Utiliser l'action UPSERT au lieu de CREATE
- Ou vérifier que l'email n'est pas déjà utilisé

### Problème : "Aucun fichier fourni"

**Solution :**
- Vérifier que la clé s'appelle bien `file` dans form-data
- Vérifier que le type est bien "File" et non "Text"

### Problème : "Matricule existe déjà"

**Solution :**
- Laisser le champ matricule vide pour génération automatique
- Ou vérifier l'unicité du matricule fourni

### Problème : UUID non généré

**Solution :**
- Vérifier que le modèle Utilisateur a `defaultValue: DataTypes.UUIDV4`
- Vérifier que la base de données supporte les UUID

---

## Résumé des endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/academic/etudiants/import` | Importer des étudiants depuis Excel |
| POST | `/api/academic/etudiants/validate` | Valider un fichier Excel sans import |
| GET | `/api/academic/etudiants` | Lister tous les étudiants |
| GET | `/api/academic/etudiants/:id` | Obtenir un étudiant par UUID |
| GET | `/api/academic/etudiants/:id/historique` | Obtenir l'historique d'un étudiant |
| POST | `/api/academic/etudiants/:id/transfert` | Transférer un étudiant |

---

## Format du fichier Excel

| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| Nom | Texte | Oui | Nom de famille |
| Prenom | Texte | Oui | Prénom |
| Email | Texte | Oui | Email unique |
| Matricule | Texte | Non | Généré si vide |
| IdCarte | Texte | Non | Identifiant carte |
| Classe | Texte | Non* | Nom de la classe |
| Action | Texte | Non | CREATE/UPDATE/UPSERT (défaut: UPSERT) |

*Obligatoire si `classeId` non fourni dans la requête

---

## Conclusion

Ce guide couvre tous les aspects du test de l'import Excel et du système UUID/matricule. Les tests manuels et unitaires garantissent le bon fonctionnement des fonctionnalités.

Pour toute question ou problème, consulter les logs du serveur ou exécuter les tests unitaires pour identifier la source du problème.
