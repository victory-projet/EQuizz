# Mise à jour de la gestion des quiz

## Changements implémentés

### 1. Renommage de l'onglet
- L'onglet "Mes Quizz" a été renommé en "Quizz"

### 2. Utilisation d'AsyncStorage
- Remplacement du stockage en mémoire par `@react-native-async-storage/async-storage`
- Installation du package : `npm install @react-native-async-storage/async-storage`

### 3. Gestion du quiz en cours
- **Clé de stockage** : `@current_quiz_state`
- Sauvegarde automatique de l'état du quiz (index de la question, réponses)
- Restauration automatique lors du retour sur le quiz
- L'onglet "Quizz" affiche maintenant le dernier quiz en cours (non terminé)

### 4. Gestion des quiz terminés
- **Clé de stockage** : `@completed_quizzes`
- Une fois qu'un quiz est soumis, il est marqué comme terminé
- Les quiz terminés sont stockés dans une liste
- L'étudiant ne peut plus accéder à un quiz terminé
- Message affiché : "Ce quiz a déjà été soumis. Vous ne pouvez plus y accéder."

### 5. Flux utilisateur

#### Démarrage d'un quiz
1. L'étudiant sélectionne un cours depuis l'onglet "Accueil"
2. Le quiz démarre et l'état est sauvegardé automatiquement
3. Si un autre quiz était en cours, il est remplacé

#### Continuation d'un quiz
1. L'onglet "Quizz" affiche le quiz en cours avec un badge "En cours"
2. L'étudiant peut cliquer pour continuer
3. L'état (question actuelle, réponses) est restauré

#### Soumission d'un quiz
1. L'étudiant soumet ses réponses
2. Le quiz est marqué comme terminé
3. L'état du quiz en cours est supprimé
4. Redirection vers l'onglet "Quizz"
5. Le quiz n'apparaît plus dans la liste des quiz disponibles

### 6. Fichiers modifiés
- `src/app/(tabs)/_layout.tsx` : Renommage de l'onglet
- `src/app/(tabs)/quizzes.tsx` : Affichage du quiz en cours
- `src/app/(tabs)/quizz.tsx` : Gestion AsyncStorage et vérification des quiz terminés
- `package.json` : Ajout de la dépendance AsyncStorage

## Structure de données

### État du quiz en cours
```json
{
  "quizId": "string",
  "currentIndex": 0,
  "answers": [["questionId", ["optionId1", "optionId2"]]],
  "timestamp": "2025-11-05T10:30:00.000Z"
}
```

### Liste des quiz terminés
```json
["quizId1", "quizId2", "quizId3"]
```
