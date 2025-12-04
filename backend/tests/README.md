# Guide des Tests - Backend EQuizz

## Structure des Tests

```
tests/
├── unit/                    # Tests unitaires
│   ├── services/           # Tests des services métier
│   ├── repositories/       # Tests des repositories
│   └── middleware/         # Tests des middlewares
├── integration/            # Tests d'intégration
│   ├── api/               # Tests des endpoints API
│   └── database/          # Tests des modèles et relations
├── e2e/                   # Tests end-to-end
├── fixtures/              # Données de test
├── helpers/               # Utilitaires pour les tests
└── setup.js              # Configuration globale
```

## Lancer les Tests

### Tous les tests
```bash
npm test
```

### Tests unitaires uniquement
```bash
npm run test:unit
```

### Tests d'intégration uniquement
```bash
npm run test:integration
```

### Tests E2E uniquement
```bash
npm run test:e2e
```

### Avec couverture de code
```bash
npm run test:coverage
```

### En mode watch (développement)
```bash
npm run test:watch
```

## Zones Critiques Testées

### 1. Système d'Anonymat
- Création de tokens anonymes
- Isolation des données étudiantes
- Vérification que les réponses ne peuvent pas être tracées

### 2. Gestion des Erreurs
- Validation des données
- Erreurs de contraintes
- Messages d'erreur en français
- Nettoyage des messages techniques

### 3. Workflow Étudiant
- Authentification
- Récupération des quizz disponibles
- Soumission des réponses
- Gestion des statuts (NOUVEAU, EN_COURS, TERMINE)

### 4. Workflow Enseignant
- Création d'évaluations
- Ajout de questions
- Import Excel
- Publication d'évaluations

## Bonnes Pratiques

1. **Isolation des tests** : Chaque test doit être indépendant
2. **Nettoyage** : Toujours nettoyer après les tests
3. **Mocks** : Utiliser des mocks pour les dépendances externes
4. **Fixtures** : Utiliser des données de test réalistes
5. **Assertions claires** : Messages d'erreur explicites

## Ajouter de Nouveaux Tests

### Test unitaire d'un service
```javascript
describe('MonService', () => {
  it('devrait faire quelque chose', async () => {
    // Arrange
    const input = { ... };
    
    // Act
    const result = await monService.method(input);
    
    // Assert
    expect(result).toEqual(expected);
  });
});
```

### Test d'intégration API
```javascript
describe('POST /api/endpoint', () => {
  it('devrait créer une ressource', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect(201);
      
    expect(response.body).toHaveProperty('id');
  });
});
```

## Dépannage

### Les tests échouent avec "Cannot find module"
```bash
npm install
```

### Timeout des tests
Augmenter le timeout dans `jest.config.js` ou utiliser `jest.setTimeout()`

### Base de données de test
Les tests utilisent SQLite en mémoire pour éviter de toucher à la vraie DB

## Couverture de Code

Objectif : 70% minimum sur toutes les métriques
- Branches
- Fonctions
- Lignes
- Statements

Voir le rapport détaillé : `coverage/lcov-report/index.html`
