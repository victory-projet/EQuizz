#  Guide d'Intégration Backend pour l'Équipe Frontend

Ce document résume les modifications majeures apportées au backend d'EQuizz pour faciliter l'intégration des applications Web et Mobiles. **Dernière mise à jour : 18 Mars 2026** (Intégration Secrets & MySQL).

## Points Clés de la Mise à Jour

### 1. Standardisation des Erreurs
Le backend renvoie désormais un format d'erreur unifié pour une capture facile côté frontend :
```json
{
  "status": "error",
  "message": "Description lisible de l'erreur",
  "code": "ERROR_CODE_UNIQUE",
  "details": {} 
}
```

### 2. Signature de l'Équipe
Toutes les réponses API incluent désormais un header de signature :
`X-Developed-By: EQuizz-Team-SJI-KMPEVCPBA-ISI2026`

### 3. Gestion de l'Identifiant Unique Université
Pour le suivi historique (même si l'étudiant change d'école), utilisez le champ `matriculeUniv` (ex: `UNIV-2024-XXX`). C'est l'identifiant stable à privilégier pour les recherches globales.

---

## Nouvelles Fonctionnalités & Endpoints

### Statistiques Détaillées
Disponibles via `ReportController` :
- `GET /api/reports/stats/ue` : Statistiques agrégées par Unité d'Enseignement.
- `GET /api/reports/stats/school` : Statistiques agrégées par école.
- **Détails Questions** : Les rapports incluent maintenant la répartition exacte des choix multiples et l'analyse sémantique des réponses ouvertes.

### Historique Étudiant
- `GET /api/student/history` : Renvoie la liste chronologique des évaluations passées, les classes fréquentées et les écoles au sein de l'université.

### Analyse des Sentiments (Enrichie)
Pour les réponses de type `REPONSE_OUVERTE`, l'objet `AnalyseReponse` est désormais beaucoup plus complet :
- `sentiment` : `POSITIF`, `NEUTRE`, `NEGATIF`.
- `explication` : Une phrase expliquant pourquoi l'IA a choisi ce sentiment.
- `categorie` : `PEDAGOGIE`, `INFRASTRUCTURE`, `CONTENU`, `CLIMAT`, `AUTRE`.
- `motsCles` : Liste des points saillants extraits.

---

## Sécurité & Performance

- **Performance MySQL (Load Tested)** : Le backend a été validé pour supporter des pics de charge de **500+ requêtes par seconde** (testé sur 5000 utilisateurs simultanés). La latence moyenne reste sous les 200ms pour les opérations standards.
- **Docker Secrets** : Pour la production, les clés sensibles (`JWT_SECRET`, `FIREBASE_KEY`) ne sont plus dans le `.env` mais injectées via Docker Secrets. En développement local, continuez d'utiliser le fichier `.env`.
- **Rate Limiting** : Si vous recevez une erreur `429`, demandez à l'utilisateur de patienter. La limite est fixée à **100 requêtes par 15 minutes par IP**.
- **Push Notifications** : L'intégration Firebase Admin SDK est désormais stabilisée et supporte l'injection sécurisée des credentials. Utilisez l'endpoint `POST /api/push-notifications/register-token` pour enregistrer les devices.
- **Sanitisation XSS** : Toutes les entrées textuelles sont nettoyées côté serveur. Vous n'avez pas besoin de filtrer le HTML avant l'envoi, mais restez vigilants lors de l'affichage (utilisez les méthodes de rendu sécurisées de vos frameworks).
- **Format des Tables** : Le schéma de base de données est normalisé via Sequelize (plural_underscored).

## Importation des Données
Les endpoints d'import Excel (`/import/enseignants`, `/import/etudiants`) ont été renforcés pour gérer les doublons et valider les domaines d'email (Super-Admins uniquement en `@universitesaintjean.org`).

---
*Note : Le serveur tourne par défaut sur le port 3000. Assurez-vous d'avoir une clé `GOOGLE_AI_API_KEY` et un fichier de service account Firebase valide ou injecté via secrets pour activer toutes les fonctionnalités.*
