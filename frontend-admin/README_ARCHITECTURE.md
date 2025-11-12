# 🏗️ EQuizz - Clean Architecture

## 📖 Documentation Complète

Cette application suit les principes de **Clean Architecture** pour garantir :
- ✅ **Testabilité** maximale
- ✅ **Maintenabilité** à long terme
- ✅ **Évolutivité** sans refactoring majeur
- ✅ **Indépendance** du framework et des outils

---

## 📚 Guides Disponibles

### 1. [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md)
**Guide complet des principes**
- Explication détaillée de Clean Architecture
- Principes SOLID appliqués
- Structure des couches
- Règles de dépendance
- Exemples de code

### 2. [ARCHITECTURE_COMPLETE.md](./ARCHITECTURE_COMPLETE.md)
**Vue d'ensemble de l'application**
- Architecture globale
- Tous les domaines métier
- Flux de données complets
- Plan de migration
- Métriques de qualité

### 3. [CLEAN_ARCHITECTURE_SUMMARY.md](./CLEAN_ARCHITECTURE_SUMMARY.md)
**Résumé de l'implémentation**
- État d'avancement par domaine
- Fichiers créés
- Validation et checklist
- Prochaines étapes

### 4. [HOW_TO_ADD_NEW_FEATURE.md](./HOW_TO_ADD_NEW_FEATURE.md)
**Guide pratique pour développeurs**
- Checklist étape par étape
- Exemples de code complets
- Erreurs courantes à éviter
- Template de feature

---

## 🎯 Quick Start

### Pour comprendre l'architecture
1. Lire [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md)
2. Étudier le code de `academic-year` (référence complète)
3. Consulter [ARCHITECTURE_COMPLETE.md](./ARCHITECTURE_COMPLETE.md)

### Pour ajouter une nouvelle feature
1. Suivre [HOW_TO_ADD_NEW_FEATURE.md](./HOW_TO_ADD_NEW_FEATURE.md)
2. Utiliser `academic-year` comme template
3. Respecter la checklist de validation

### Pour refactorer du code existant
1. Identifier le domaine métier
2. Créer l'entité
3. Définir le repository interface
4. Créer les use cases
5. Implémenter le repository
6. Refactorer le component

---

## 📊 État Actuel

### ✅ Complètement Implémenté
- **Academic Year** : Entités, Use Cases, Repository, UI avec modals
- **Shared Components** : Modals, Toast, Loading, Error handling
- **Infrastructure** : Services, Interceptors, Guards

### 🔄 En Cours
- **Quiz** : Entités et interfaces créées, use cases à compléter
- **Class** : Entités et interfaces créées, use cases à créer
- **Course** : Entités et interfaces créées, use cases à créer
- **Auth** : Entités et interfaces créées, use cases à créer

### 📋 À Faire
- Compléter les repositories (mock data)
- Créer tous les use cases manquants
- Refactorer les components existants
- Intégration avec l'API backend

---

## 🏛️ Architecture en 4 Couches

```
┌─────────────────────────────────────────┐
│     PRESENTATION (Components, UI)       │
│  ↓ depends on                           │
├─────────────────────────────────────────┤
│     APPLICATION (Use Cases)             │
│  ↓ depends on                           │
├─────────────────────────────────────────┤
│     DOMAIN (Entities, Interfaces)       │
│  ↑ implemented by                       │
├─────────────────────────────────────────┤
│     INFRASTRUCTURE (Repositories, API)  │
└─────────────────────────────────────────┘
```

---

## 🎓 Principes Clés

### 1. Dependency Rule
Les dépendances pointent **toujours vers l'intérieur** :
- Presentation → Application → Domain
- Infrastructure → Domain (implémente les interfaces)

### 2. Single Responsibility
Chaque classe a **une seule raison de changer** :
- Entity : Logique métier
- Use Case : Une action métier
- Repository : Accès aux données
- Component : Affichage

### 3. Dependency Inversion
Dépendre d'**abstractions**, pas d'implémentations :
- Use Cases → Repository Interface
- Components → Use Cases
- DI Angular pour l'injection

---

## 📁 Structure des Dossiers

```
src/app/
├── core/
│   ├── domain/                    # DOMAIN LAYER
│   │   ├── entities/              # Entités métier
│   │   ├── repositories/          # Interfaces
│   │   └── use-cases/             # Logique applicative
│   │
│   ├── infrastructure/            # INFRASTRUCTURE LAYER
│   │   └── repositories/          # Implémentations
│   │
│   ├── services/                  # Services techniques
│   ├── guards/                    # Guards Angular
│   └── interceptors/              # Intercepteurs HTTP
│
├── features/                      # PRESENTATION LAYER
│   ├── academic-year/             # ✅ Référence complète
│   ├── quiz-management/           # 🔄 À refactorer
│   ├── class-management/          # 🔄 À refactorer
│   └── ...
│
└── shared/                        # SHARED LAYER
    ├── components/                # Composants réutilisables
    ├── pipes/                     # Pipes
    └── interfaces/                # Interfaces partagées
```

---

## 🔄 Flux de Données Type

```typescript
// 1. USER ACTION
Component.onAction()

// 2. USE CASE
UseCase.execute(dto)
  → Validation
  → Création entité
  → Appel repository

// 3. REPOSITORY
Repository.method()
  → API call / Mock data
  → Return Observable

// 4. RESPONSE
Component receives data
  → Update UI
  → Show toast
```

---

## ✅ Validation

### Checklist Qualité
- [x] Aucune erreur TypeScript
- [x] Principes SOLID respectés
- [x] Séparation des couches
- [x] Dépendances via interfaces
- [x] Logique métier dans entités
- [x] Validation dans use cases
- [x] UI découplée

### Métriques
- **Domaines** : 5 (Academic Year, Quiz, Class, Course, Auth)
- **Entités** : 12+
- **Repository Interfaces** : 7
- **Use Cases** : 6+ (plus à venir)
- **Erreurs TypeScript** : 0

---

## 🚀 Commandes Utiles

```bash
# Développement
npm start

# Build
npm run build

# Tests
npm test

# Linter
npm run lint
```

---

## 👥 Pour les Développeurs

### Nouveau sur le projet ?
1. Lire [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md)
2. Étudier `academic-year` feature
3. Suivre [HOW_TO_ADD_NEW_FEATURE.md](./HOW_TO_ADD_NEW_FEATURE.md)

### Ajouter une feature ?
1. Créer l'entité
2. Définir le repository interface
3. Créer les use cases
4. Implémenter le repository
5. Créer le component

### Refactorer du code ?
1. Identifier le domaine
2. Extraire la logique métier
3. Créer les use cases
4. Simplifier le component

---

## 📞 Support

Pour toute question sur l'architecture :
1. Consulter la documentation
2. Regarder les exemples dans `academic-year`
3. Suivre les patterns établis

---

## 🎯 Objectifs

- ✅ Architecture scalable
- ✅ Code testable
- ✅ Maintenance facilitée
- ✅ Évolution sans refactoring majeur
- ✅ Indépendance du framework

---

## 📝 Licence

Ce projet suit les principes de Clean Architecture tels que définis par Robert C. Martin (Uncle Bob).

---

**Dernière mise à jour** : Novembre 2024
**Version** : 1.0.0
**Status** : ✅ Architecture établie, implémentation en cours
