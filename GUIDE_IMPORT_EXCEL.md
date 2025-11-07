# Guide d'Utilisation - Import de Quiz depuis Excel

## Vue d'Ensemble

L'application EQuizz permet maintenant de créer des quiz de deux façons:
1. **Création manuelle** via un formulaire
2. **Import depuis Excel** pour importer plusieurs questions en une fois

## Accès à la Fonctionnalité

### Depuis la Page Évaluations
1. Naviguez vers `/evaluation`
2. Cliquez sur le bouton **"Générer un Quiz"** (en haut à droite)
3. Choisissez votre méthode de création

## Option 1: Création Manuelle

### Étapes
1. Dans le modal "Générer un Quiz", cliquez sur **"Créer manuellement"**
2. Remplissez le formulaire avec:
   - Titre du quiz
   - Unité d'Enseignement (UE)
   - Type d'évaluation (Mi-parcours, Fin de semestre, Fin de parcours)
   - Date de fin
   - Classes concernées
   - Nombre de questions
   - Statut initial (Brouillon ou Publier immédiatement)
3. Cliquez sur **"Créer le Quiz"**

### Avantages
- Contrôle total sur chaque champ
- Validation en temps réel
- Idéal pour les quiz simples

## Option 2: Import depuis Excel

### Étapes

#### 1. Préparer le Fichier Excel

**Format Requis:**
| Colonne A | Colonne B | Colonne C | Colonne D | Colonne E | Colonne F |
|-----------|-----------|-----------|-----------|-----------|-----------|
| Type | Question | Option 1 | Option 2 | Option 3 | Option 4 |

**Types de Questions:**
- `multiple` : Question à choix multiple (QCM)
- `close` : Question fermée (Vrai/Faux)
- `open` : Question ouverte

**Exemple:**
```
Type      | Question                                    | Option 1  | Option 2  | Option 3 | Option 4
----------|---------------------------------------------|-----------|-----------|----------|----------
multiple  | Quelle est la capitale de la France?        | Paris     | Londres   | Berlin   | Madrid
close     | La Terre est ronde                          | Vrai      | Faux      |          |
open      | Expliquez le concept de polymorphisme       |           |           |          |
multiple  | Quel est le langage de programmation web?   | JavaScript| Python    | Java     | C++
```

#### 2. Télécharger le Template (Optionnel)

1. Dans le modal "Générer un Quiz", cliquez sur **"Importer un fichier"**
2. Cliquez sur **"Télécharger le modèle Excel"**
3. Utilisez ce template comme base pour vos questions

#### 3. Importer le Fichier

1. Dans le modal d'import, **glissez-déposez** votre fichier Excel
   - OU cliquez sur **"Choisir un fichier"** pour parcourir
2. Le système analyse automatiquement le fichier
3. Une prévisualisation s'affiche avec:
   - Nom du fichier
   - Nombre de questions détectées
   - Nombre de questions valides/invalides
   - Tableau de prévisualisation

#### 4. Vérifier et Corriger

**Indicateurs de Validation:**
- ✅ **Ligne verte** : Question valide
- ❌ **Ligne rouge** : Question invalide (erreur)

**Erreurs Courantes:**
- Question vide
- Type de question invalide
- Moins de 2 options pour un QCM

**Actions:**
- Si des erreurs sont détectées, cliquez sur **"Retour"**
- Corrigez votre fichier Excel
- Réimportez le fichier

#### 5. Importer les Questions

1. Vérifiez que toutes les questions sont correctes
2. Cliquez sur **"Importer"**
3. Les questions valides sont importées
4. Les questions invalides sont ignorées

### Avantages
- Import en masse de questions
- Gain de temps considérable
- Réutilisation de questions existantes
- Partage facile entre enseignants

## Règles de Validation

### Questions à Choix Multiple (QCM)
- ✅ Type: `multiple`
- ✅ Question non vide
- ✅ Au moins 2 options
- ✅ Maximum 4 options

### Questions Fermées
- ✅ Type: `close`
- ✅ Question non vide
- ✅ Exactement 2 options (généralement Vrai/Faux)

### Questions Ouvertes
- ✅ Type: `open`
- ✅ Question non vide
- ✅ Pas d'options requises

## Conseils et Bonnes Pratiques

### Préparation du Fichier Excel
1. **Utilisez le template fourni** pour éviter les erreurs de format
2. **Vérifiez l'orthographe** avant l'import
3. **Testez avec un petit fichier** d'abord (5-10 questions)
4. **Sauvegardez votre fichier** en .xlsx (format recommandé)

### Organisation des Questions
1. **Groupez par thème** dans des feuilles séparées
2. **Numérotez vos questions** pour faciliter le suivi
3. **Utilisez des noms de fichiers descriptifs** (ex: `questions_algorithmique_L1.xlsx`)

### Validation
1. **Prévisualisez toujours** avant d'importer
2. **Corrigez les erreurs** immédiatement
3. **Vérifiez le nombre de questions** importées

## Dépannage

### Le fichier ne s'importe pas
- ✅ Vérifiez le format (.xlsx ou .xls)
- ✅ Assurez-vous que le fichier n'est pas corrompu
- ✅ Vérifiez que les colonnes sont dans le bon ordre

### Questions marquées comme invalides
- ✅ Vérifiez que le type est bien écrit (multiple/close/open)
- ✅ Assurez-vous que la question n'est pas vide
- ✅ Pour les QCM, vérifiez qu'il y a au moins 2 options

### Le template ne se télécharge pas
- ✅ Vérifiez votre connexion internet
- ✅ Autorisez les téléchargements dans votre navigateur
- ✅ Contactez l'administrateur si le problème persiste

## Intégration Future avec xlsx

Pour la production, l'application utilisera la bibliothèque `xlsx` pour:
- Parser les fichiers Excel réels
- Générer des templates téléchargeables
- Supporter plusieurs feuilles Excel
- Gérer les formats complexes

### Installation (Pour les Développeurs)
```bash
npm install xlsx
npm install --save-dev @types/xlsx
```

## Support

Pour toute question ou problème:
1. Consultez ce guide
2. Vérifiez les exemples fournis
3. Téléchargez et utilisez le template
4. Contactez le support technique

## Mises à Jour Futures

Fonctionnalités prévues:
- [ ] Support de plusieurs feuilles Excel
- [ ] Import de réponses correctes
- [ ] Import de points par question
- [ ] Export de quiz vers Excel
- [ ] Historique des imports
- [ ] Validation avancée avec suggestions
