# Guide d'Intégration des Notifications

## 🎯 Objectif

Ce guide explique comment intégrer le système de notifications global dans votre application Angular.

## 📋 Étapes d'Intégration

### 1. Ajouter le Conteneur de Notifications

Dans votre composant principal (app.component.html), ajoutez :

```html
<!-- Votre contenu existant -->
<router-outlet></router-outlet>

<!-- Conteneur de notifications global -->
<app-notification-container></app-notification-container>
```

### 2. Importer les Services

Dans votre app.config.ts ou module principal :

```typescript
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { NotificationService } from './core/services/notification.service';
import { ErrorHandlerService } from './core/services/error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Vos providers existants
    provideHttpClient(
      withInterceptors([ErrorInterceptor])
    ),
    NotificationService,
    ErrorHandlerService,
    // ...
  ]
};
```

### 3. Utilisation dans les Composants

```typescript
import { NotificationService } from '../core/services/notification.service';

export class MonComposant {
  constructor(private notificationService: NotificationService) {}

  onSuccess() {
    this.notificationService.showSuccess('Succès', 'Opération réussie !');
  }

  onError(error: any) {
    this.notificationService.showHttpError(error, 'Erreur lors de l\'opération');
  }

  onConfirmation() {
    this.notificationService.showConfirmation(
      'Confirmer l\'action',
      'Êtes-vous sûr de vouloir continuer ?',
      () => {
        // Action confirmée
        console.log('Action confirmée');
      }
    );
  }
}
```

### 4. Styles Globaux

Ajoutez dans votre styles.scss global :

```scss
// Variables pour les notifications
:root {
  --color-success: #059669;
  --color-error: #dc2626;
  --color-warning: #d97706;
  --color-info: #2563eb;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
}

// Styles pour les états d'erreur
.form-input.error,
.form-select.error {
  border-color: var(--color-error) !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1) !important;
}

.field-error {
  color: var(--color-error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}
```

## 🔧 Configuration Avancée

### Personnalisation des Notifications

```typescript
// Notification avec durée personnalisée
this.notificationService.showSuccess('Titre', 'Message', 10000); // 10 secondes

// Notification persistante
this.notificationService.showError('Erreur critique', 'Message', true);

// Notification avec actions personnalisées
this.notificationService.showWithActions(
  'warning',
  'Action requise',
  'Voulez-vous sauvegarder avant de quitter ?',
  [
    {
      label: 'Sauvegarder',
      action: () => this.save(),
      style: 'primary'
    },
    {
      label: 'Ignorer',
      action: () => this.discard(),
      style: 'secondary'
    }
  ]
);
```

### Gestion des Erreurs HTTP

L'intercepteur d'erreurs est automatiquement configuré et gère :

- **401/403** : Redirection vers login
- **404** : Message "Ressource non trouvée"
- **500** : Message "Erreur serveur"
- **0** : Message "Problème de connexion"

## 📱 Responsive et Accessibilité

Les notifications sont automatiquement :
- **Responsive** : S'adaptent aux écrans mobiles
- **Accessibles** : Compatibles lecteurs d'écran
- **Animées** : Transitions fluides
- **Empilables** : Plusieurs notifications simultanées

## 🎨 Personnalisation Visuelle

### Modifier les Couleurs

```scss
:root {
  --notification-success-bg: rgba(34, 197, 94, 0.05);
  --notification-success-border: rgba(34, 197, 94, 0.2);
  --notification-success-text: #059669;
  
  --notification-error-bg: rgba(239, 68, 68, 0.05);
  --notification-error-border: rgba(239, 68, 68, 0.2);
  --notification-error-text: #dc2626;
}
```

### Modifier la Position

```scss
.notification-container {
  // Position par défaut : top-right
  top: 1rem;
  right: 1rem;
  
  // Pour bottom-right :
  // bottom: 1rem;
  // right: 1rem;
  // top: auto;
  
  // Pour center-top :
  // top: 1rem;
  // left: 50%;
  // right: auto;
  // transform: translateX(-50%);
}
```

## 🧪 Tests

### Test Manuel

1. **Notifications de succès**
   ```typescript
   this.notificationService.showSuccess('Test', 'Notification de succès');
   ```

2. **Notifications d'erreur**
   ```typescript
   this.notificationService.showError('Test', 'Notification d\'erreur');
   ```

3. **Confirmations**
   ```typescript
   this.notificationService.showConfirmation(
     'Test',
     'Confirmation test',
     () => console.log('Confirmé')
   );
   ```

### Vérifications

- [ ] Les notifications apparaissent correctement
- [ ] Les animations fonctionnent
- [ ] Les actions sont exécutées
- [ ] L'auto-dismiss fonctionne
- [ ] Le responsive est correct
- [ ] Les erreurs HTTP sont interceptées

## 🔍 Debugging

### Logs de Debug

```typescript
// Activer les logs détaillés
console.log('Notifications actives:', this.notificationService.getNotifications()());

// Vérifier l'intercepteur
console.log('Erreur interceptée:', error);
```

### Problèmes Courants

1. **Notifications non visibles**
   - Vérifier le z-index du conteneur
   - Vérifier l'import du composant

2. **Styles non appliqués**
   - Vérifier l'import des styles globaux
   - Vérifier les variables CSS

3. **Intercepteur non actif**
   - Vérifier la configuration des providers
   - Vérifier l'ordre des intercepteurs

## 📚 API Complète

### NotificationService

```typescript
// Méthodes principales
showSuccess(title: string, message: string, duration?: number): string
showError(title: string, message: string, persistent?: boolean): string
showWarning(title: string, message: string, duration?: number): string
showInfo(title: string, message: string, duration?: number): string

// Méthodes avancées
showWithActions(type, title, message, actions, persistent?): string
showConfirmation(title, message, onConfirm, onCancel?, confirmLabel?, cancelLabel?): string
showHttpError(error: any, fallbackMessage?: string): string
showLoading(message?: string): string

// Gestion
dismiss(id: string): void
dismissAll(): void
dismissByType(type: 'success' | 'error' | 'warning' | 'info'): void
updateNotification(id: string, updates: Partial<Notification>): void
```

### ErrorHandlerService

```typescript
// Méthodes principales
handleHttpError(error: HttpErrorResponse): Observable<never>
formatErrorMessage(error: UserFriendlyError): string
requiresReauth(error: ErrorInfo): boolean
isRecoverable(error: UserFriendlyError): boolean
generateErrorId(): string
```

---

**Note** : Assurez-vous de tester l'intégration sur différents navigateurs et tailles d'écran.