# 🔧 Guide de Résolution des Erreurs TypeScript

## 🎯 Erreur Résolue : Incompatibilité de Types Date/String

### **Problème Initial**
```
TS2345: Argument of type '{ dateDebut: string; dateFin: string; ... }' 
is not assignable to parameter of type 'Partial<Evaluation>'.
Types of property 'dateDebut' are incompatible.
Type 'string' is not assignable to type 'Date'.
```

### **Cause**
L'interface `Evaluation` définit les dates comme des objets `Date`, mais l'API attend des chaînes ISO.

### **Solution Appliquée**
Création d'une interface spécifique pour les données d'API :

```typescript
// Interface pour les entités (avec Date objects)
export interface Evaluation {
  dateDebut: Date;
  dateFin: Date;
  // ...
}

// Interface pour les données d'API (avec strings)
export interface EvaluationApiData {
  dateDebut: string | Date;
  dateFin: string | Date;
  // ...
}
```

## 🛠️ Patterns de Résolution TypeScript

### **1. Séparation des Interfaces**

#### **Problème Courant**
```typescript
// ❌ Une seule interface pour tout
interface User {
  id: number;
  createdAt: Date;  // Problème : API renvoie string
}
```

#### **Solution**
```typescript
// ✅ Interface pour l'entité métier
interface User {
  id: number;
  createdAt: Date;
}

// ✅ Interface pour les données d'API
interface UserApiData {
  id: number;
  createdAt: string;
}
```

### **2. Types Union pour la Flexibilité**

```typescript
// ✅ Accepte les deux formats
interface FlexibleData {
  date: string | Date;
  id: string | number;
}
```

### **3. Transformation des Données**

```typescript
// ✅ Fonction de transformation
function apiDataToEntity(apiData: UserApiData): User {
  return {
    ...apiData,
    createdAt: new Date(apiData.createdAt)
  };
}
```

## 🔍 Erreurs TypeScript Fréquentes et Solutions

### **1. Erreur : Property does not exist**

#### **Problème**
```typescript
// ❌ Propriété manquante dans l'interface
user.email; // Property 'email' does not exist
```

#### **Solutions**
```typescript
// ✅ Option 1 : Ajouter la propriété
interface User {
  name: string;
  email: string; // Ajouté
}

// ✅ Option 2 : Propriété optionnelle
interface User {
  name: string;
  email?: string; // Optionnelle
}

// ✅ Option 3 : Index signature
interface User {
  name: string;
  [key: string]: any; // Propriétés dynamiques
}
```

### **2. Erreur : Cannot find module**

#### **Problème**
```typescript
// ❌ Module non trouvé
import { SomeService } from './some-service';
```

#### **Solutions**
```typescript
// ✅ Vérifier le chemin
import { SomeService } from './services/some-service';

// ✅ Extension explicite si nécessaire
import { SomeService } from './some-service.ts';

// ✅ Import relatif correct
import { SomeService } from '../services/some-service';
```

### **3. Erreur : Type 'any' is not assignable**

#### **Problème**
```typescript
// ❌ Type trop strict
const data: SpecificType = apiResponse; // any not assignable
```

#### **Solutions**
```typescript
// ✅ Type assertion
const data = apiResponse as SpecificType;

// ✅ Type guard
function isSpecificType(obj: any): obj is SpecificType {
  return obj && typeof obj.property === 'string';
}

// ✅ Partial type
const data: Partial<SpecificType> = apiResponse;
```

## 🎯 Bonnes Pratiques TypeScript

### **1. Interfaces Séparées par Contexte**

```typescript
// ✅ Séparation claire des responsabilités
interface UserEntity {        // Pour la logique métier
  id: string;
  name: string;
  createdAt: Date;
}

interface UserApiRequest {    // Pour les requêtes API
  name: string;
  email: string;
}

interface UserApiResponse {   // Pour les réponses API
  id: string;
  name: string;
  email: string;
  created_at: string;
}
```

### **2. Types Utilitaires**

```typescript
// ✅ Utilisation des types utilitaires TypeScript
type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;
type UpdateUserRequest = Partial<Pick<User, 'name' | 'email'>>;
type UserSummary = Pick<User, 'id' | 'name'>;
```

### **3. Validation de Types Runtime**

```typescript
// ✅ Validation avec type guards
function isValidUser(obj: any): obj is User {
  return obj && 
         typeof obj.id === 'string' &&
         typeof obj.name === 'string' &&
         obj.createdAt instanceof Date;
}

// ✅ Utilisation
if (isValidUser(apiData)) {
  // TypeScript sait que apiData est de type User
  console.log(apiData.name);
}
```

## 🔧 Configuration TypeScript Optimale

### **tsconfig.json Recommandé**
```json
{
  "compilerOptions": {
    "strict": true,                    // Mode strict
    "noImplicitAny": true,            // Pas de any implicite
    "strictNullChecks": true,         // Vérification null/undefined
    "noImplicitReturns": true,        // Toutes les branches retournent
    "noFallthroughCasesInSwitch": true, // Switch complets
    "exactOptionalPropertyTypes": true, // Propriétés optionnelles exactes
    "lib": ["ES2022", "DOM"],         // Librairies disponibles
    "moduleResolution": "bundler",     // Résolution moderne
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 🚨 Erreurs à Éviter

### **1. Utilisation Excessive de 'any'**
```typescript
// ❌ Éviter
function processData(data: any): any {
  return data.whatever;
}

// ✅ Préférer
function processData<T>(data: T): T {
  return data;
}
```

### **2. Interfaces Trop Génériques**
```typescript
// ❌ Trop générique
interface ApiResponse {
  data: any;
  status: number;
}

// ✅ Spécifique
interface UserApiResponse {
  data: User[];
  status: number;
  message?: string;
}
```

### **3. Oubli des Types Union**
```typescript
// ❌ Trop restrictif
interface Config {
  port: number; // Et si c'est une string ?
}

// ✅ Flexible
interface Config {
  port: number | string;
}
```

## 🎯 Checklist de Résolution d'Erreurs

### **Avant de Coder**
- [ ] Définir les interfaces pour chaque contexte (API, Entity, UI)
- [ ] Utiliser des types union pour la flexibilité
- [ ] Prévoir les transformations de données

### **Pendant le Développement**
- [ ] Lire attentivement les messages d'erreur TypeScript
- [ ] Vérifier les types attendus vs fournis
- [ ] Utiliser l'auto-complétion de l'IDE

### **Après une Erreur**
- [ ] Identifier la cause racine (interface, type, import)
- [ ] Appliquer la solution la plus spécifique
- [ ] Tester que la solution ne casse pas d'autres parties
- [ ] Documenter si c'est un pattern récurrent

## 🔮 Outils Utiles

### **Extensions VS Code**
- TypeScript Importer
- TypeScript Hero
- Error Lens (affichage des erreurs inline)

### **Commandes Utiles**
```bash
# Vérification TypeScript
npx tsc --noEmit

# Vérification avec détails
npx tsc --noEmit --pretty

# Watch mode
npx tsc --watch --noEmit
```

---

**Résultat** : Une approche systématique pour résoudre les erreurs TypeScript en séparant clairement les interfaces par contexte d'utilisation et en utilisant les bonnes pratiques de typage.