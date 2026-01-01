# 🎨 Guide du Système de Thèmes - EQuizz Admin

## Vue d'ensemble

Le système de thèmes d'EQuizz Admin offre une expérience utilisateur personnalisable avec support pour :
- **Thème clair** : Interface lumineuse et moderne
- **Thème sombre** : Interface sombre pour réduire la fatigue oculaire
- **Thème automatique** : Suit automatiquement les préférences système de l'utilisateur

## 🚀 Fonctionnalités

### Toggle de Thème
- **Emplacement** : À côté de la barre de recherche dans le header
- **Icônes dynamiques** : 
  - 🌞 `light_mode` pour le thème clair
  - 🌙 `dark_mode` pour le thème sombre  
  - 🔄 `brightness_auto` pour le thème automatique
- **Menu déroulant** : Sélection facile entre les 3 options

### Persistance
- **Stockage local** : Les préférences sont sauvegardées dans `localStorage`
- **Clé de stockage** : `equizz-theme`
- **Valeurs possibles** : `'light'`, `'dark'`, `'auto'`

### Détection Système
- **Media Query** : `(prefers-color-scheme: dark)`
- **Écoute des changements** : Mise à jour automatique si l'utilisateur change ses préférences système
- **Fallback** : Thème clair par défaut si la détection échoue

## 🎯 Architecture Technique

### Service ThemeService
```typescript
// Injection du service
constructor(private themeService: ThemeService) {}

// Méthodes principales
themeService.setTheme('dark');           // Définir un thème
themeService.toggleTheme();              // Basculer entre les thèmes
themeService.getSelectedTheme();         // Obtenir le thème sélectionné
themeService.currentTheme();             // Signal du thème actuel (résolu)
```

### Variables CSS
Toutes les couleurs utilisent des variables CSS personnalisées :

```scss
// Couleurs principales
--primary-color: #1976d2;
--text-primary: #212121;
--background-primary: #ffffff;

// Utilisation dans les composants
.my-component {
  color: var(--text-primary);
  background: var(--background-primary);
}
```

### Transitions Fluides
```scss
// Transition automatique pour tous les éléments
* {
  transition: background-color var(--theme-transition),
              color var(--theme-transition),
              border-color var(--theme-transition);
}
```

## 🎨 Palette de Couleurs

### Thème Clair
- **Primaire** : `#1976d2` (Bleu Material)
- **Fond** : `#ffffff` (Blanc)
- **Texte** : `#212121` (Gris très foncé)
- **Secondaire** : `#f8f9fa` (Gris très clair)

### Thème Sombre
- **Primaire** : `#90caf9` (Bleu clair)
- **Fond** : `#121212` (Noir Material)
- **Texte** : `#ffffff` (Blanc)
- **Secondaire** : `#1e1e1e` (Gris très foncé)

## 🔧 Personnalisation

### Ajouter de Nouvelles Variables
1. **Définir dans `themes.scss`** :
```scss
.light-theme {
  --my-custom-color: #ff5722;
}

.dark-theme {
  --my-custom-color: #ff8a65;
}
```

2. **Utiliser dans les composants** :
```scss
.my-element {
  color: var(--my-custom-color);
}
```

### Créer un Nouveau Thème
1. **Étendre le type Theme** :
```typescript
export type Theme = 'light' | 'dark' | 'auto' | 'custom';
```

2. **Ajouter les variables CSS** :
```scss
.custom-theme {
  --primary-color: #purple;
  // ... autres variables
}
```

3. **Mettre à jour le service** :
```typescript
getThemeIcon(): string {
  // Ajouter le cas 'custom'
  case 'custom': return 'palette';
}
```

## 📱 Responsive Design

### Mobile
- **Meta theme-color** : Mise à jour automatique de la couleur de la barre d'état
- **Transitions optimisées** : Performance maintenue sur mobile
- **Touch-friendly** : Boutons de taille appropriée

### Desktop
- **Raccourcis clavier** : Possibilité d'ajouter des raccourcis
- **Hover states** : Effets visuels au survol
- **Menu contextuel** : Interface riche pour la sélection

## 🚀 Utilisation dans les Composants

### Composant Standalone
```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [ThemeToggleComponent], // Si besoin du toggle
  template: `
    <div class="themed-container">
      <app-theme-toggle></app-theme-toggle>
    </div>
  `,
  styleUrls: ['./my-component.scss']
})
export class MyComponent {
  constructor(private themeService: ThemeService) {}
  
  // Accès aux signaux du thème
  currentTheme = this.themeService.currentTheme;
  isAutoTheme = this.themeService.isAutoTheme;
}
```

### Styles SCSS
```scss
.themed-container {
  background: var(--surface-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  
  // Transitions automatiques
  transition: background-color var(--theme-transition),
              color var(--theme-transition),
              border-color var(--theme-transition);
  
  &:hover {
    background: var(--hover-background);
  }
}
```

## 🎯 Bonnes Pratiques

### ✅ À Faire
- Utiliser les variables CSS pour toutes les couleurs
- Tester les deux thèmes lors du développement
- Prévoir des fallbacks pour les couleurs critiques
- Utiliser les transitions pour une expérience fluide

### ❌ À Éviter
- Couleurs codées en dur dans le CSS
- Transitions trop longues (> 300ms)
- Oublier de tester le thème automatique
- Ignorer les contrastes d'accessibilité

## 🔍 Débogage

### Vérifier le Thème Actuel
```typescript
// Dans la console du navigateur
console.log('Thème sélectionné:', localStorage.getItem('equizz-theme'));
console.log('Classe body:', document.body.className);
```

### Forcer un Thème
```typescript
// Forcer le thème sombre
document.body.className = 'dark-theme';

// Ou via le service
themeService.setTheme('dark');
```

### Variables CSS Actives
```javascript
// Voir toutes les variables CSS actives
const styles = getComputedStyle(document.documentElement);
console.log('Primary color:', styles.getPropertyValue('--primary-color'));
```

## 🚀 Évolutions Futures

### Fonctionnalités Prévues
- **Thèmes personnalisés** : Création de thèmes par l'utilisateur
- **Thèmes par organisation** : Branding personnalisé
- **Mode haute contraste** : Accessibilité renforcée
- **Thèmes saisonniers** : Changements automatiques selon la période

### Améliorations Techniques
- **Lazy loading** des thèmes non utilisés
- **Préchargement** du thème préféré
- **API de thèmes** : Gestion centralisée
- **Analytics** : Suivi des préférences utilisateur

---

## 📞 Support

Pour toute question ou suggestion concernant le système de thèmes :
- **Documentation** : Ce guide
- **Code source** : `src/app/core/services/theme.service.ts`
- **Composant** : `src/app/presentation/shared/components/theme-toggle/`
- **Styles** : `src/styles/themes.scss`