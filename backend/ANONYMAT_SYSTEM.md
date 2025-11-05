# Système d'Anonymat des Réponses

## 🎯 Objectif
Permettre aux étudiants de savoir quels quizz sont "nouveau", "en cours" ou "terminé" tout en gardant leurs réponses complètement anonymes dans la base de données.

## 🔐 Architecture

### Tables impliquées

1. **SessionToken** (table de mapping séparée)
   - `etudiantId` : UUID de l'étudiant
   - `evaluationId` : UUID de l'évaluation
   - `tokenAnonyme` : Hash SHA-256 unique et anonyme
   - **Accès restreint** : Seul le backend peut lire cette table

2. **SessionReponse** (table anonyme)
   - `tokenAnonyme` : Token anonyme (pas de lien direct avec l'étudiant)
   - `statut` : 'EN_COURS' ou 'TERMINE'
   - `dateDebut` / `dateFin` : Timestamps
   - **Anonyme** : Aucune référence directe à l'étudiant

3. **ReponseEtudiant** (table anonyme)
   - `session_reponse_id` : Lien vers SessionReponse
   - `question_id` : Lien vers la question
   - `contenu` : La réponse textuelle
   - **Anonyme** : Aucune référence directe à l'étudiant

## 🔄 Flux de données

### 1. Récupération des quizz disponibles
```
Étudiant → Backend → SessionToken (mapping) → SessionReponse (anonyme)
                  ↓
            Retourne le statut sans révéler l'identité
```

### 2. Soumission de réponses
```
Étudiant + Réponses → Backend
                    ↓
            Crée/Récupère SessionToken
                    ↓
            Crée/Met à jour SessionReponse (avec tokenAnonyme)
                    ↓
            Sauvegarde ReponseEtudiant (anonyme)
```

## 🛡️ Garanties d'anonymat

1. **Base de données** : Les tables `SessionReponse` et `ReponseEtudiant` ne contiennent AUCUNE référence directe à l'étudiant

2. **Token anonyme** : Généré via SHA-256, impossible de retrouver l'étudiant sans accès à `SessionToken`

3. **Séparation des données** :
   - Administrateurs : Voient les réponses anonymes
   - Backend : Seul composant ayant accès au mapping
   - Étudiants : Voient leur propre statut via le backend

## 📊 API Endpoints

### GET /api/student/quizzes
Retourne les quizz avec leur statut pour l'étudiant connecté :
```json
{
  "statutEtudiant": "EN_COURS",  // NOUVEAU, EN_COURS, TERMINE
  "tokenAnonyme": "abc123...",   // Token pour continuer la session
  "dateDebutSession": "2025-11-05T10:00:00Z"
}
```

### POST /api/student/quizzes/:id/submit
Soumet les réponses de manière anonyme :
```json
{
  "reponses": [
    { "question_id": "uuid", "contenu": "Ma réponse" }
  ],
  "estFinal": true  // false pour sauvegarder sans terminer
}
```

## 🔍 Avantages

✅ **Anonymat complet** : Les réponses ne peuvent pas être tracées dans la DB  
✅ **Tracking du statut** : L'étudiant sait où il en est  
✅ **Reprise possible** : Peut continuer un quizz en cours  
✅ **Conformité RGPD** : Séparation des données personnelles et anonymes
