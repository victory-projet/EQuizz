# Composants Partagés - Guide d'utilisation

## 📋 Table des matières
- [Modals](#modals)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Notifications Toast](#notifications-toast)
- [Loading](#loading)

---

## 🪟 Modals

### Modal de base
Composant modal réutilisable avec différentes tailles.

```typescript
import { ModalComponent } from '@shared/components';

// Dans votre template
<app-modal 
  [isOpen]="showModal"
  [title]="'Mon titre'"
  [size]="'medium'"
  (close)="onClose()">
  <p>Contenu du modal</p>
</app-modal>
```

**Props:**
- `isOpen`: boolean - Contrôle l'affichage
- `title`: string - Titre du modal
- `size`: 'small' | 'medium' | 'large' - Taille du modal
- `close`: EventEmitter - Événement de fermeture

---

### Modal de confirmation
Modal pour confirmer des actions dangereuses.

```typescript
import { ConfirmationModalComponent } from '@shared/components';

confirmationData = {
  title: 'Confirmer la suppression',
  message: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  entityName: 'Quiz "Introduction à Angular"',
  confirmText: 'Supprimer',
  cancelText: 'Annuler',
  isDangerous: true
};

// Dans votre template
<app-confirmation-modal
  [isOpen]="showConfirm"
  [data]="confirmationData"
  (confirm)="onConfirm()"
  (cancel)="onCancel()">
</app-confirmation-modal>
```

---

### Modal d'erreur
Modal pour afficher les erreurs avec détails techniques.

```typescript
import { ErrorModalComponent } from '@shared/components';
import { AppError } from '@core/services/error-handler.service';

currentError: AppError = {
  message: 'Impossible de se connecter au serveur',
  code: 'NETWORK_ERROR',
  status: 0,
  details: { /* ... */ },
  timestamp: new Date()
};

// Dans votre template
<app-error-modal
  [isOpen]="showError"
  [error]="currentError"
  title="Une erreur est survenue"
  (close)="closeErrorModal()">
</app-error-modal>
```

---

## ⚠️ Gestion des erreurs

### ErrorHandlerService
Service centralisé pour gérer toutes les erreurs de l'application.

```typescript
import { ErrorHandlerService } from '@core/services/error-handler.service';

constructor(private errorHandler: ErrorHandlerService) {}

// Gérer une erreur HTTP
this.http.get('/api/data').pipe(
  catchError(error => this.errorHandler.handleError(error))
).subscribe();

// Récupérer l'historique des erreurs
const errors = this.errorHandler.getErrorLog();

// Nettoyer l'historique
this.errorHandler.clearErrorLog();
```

### Intercepteur d'erreurs
L'intercepteur `errorInterceptor` gère automatiquement les erreurs HTTP et affiche des toasts appropriés.

**Erreurs gérées automatiquement:**
- 400: Requête invalide
- 401: Non autorisé (géré par authInterceptor)
- 403: Accès refusé
- 404: Ressource non trouvée
- 409: Conflit
- 422: Données invalides
- 500: Erreur serveur
- 503: Service indisponible
- 0: Pas de connexion

---

## 🔔 Notifications Toast

### ToastService
Service pour afficher des notifications toast.

```typescript
import { ToastService } from '@core/services/toast.service';

constructor(private toastService: ToastService) {}

// Toast de succès
this.toastService.success('Opération réussie !');

// Toast d'erreur
this.toastService.error('Une erreur est survenue');

// Toast d'avertissement
this.toastService.warning('Attention : action irréversible');

// Toast d'information
this.toastService.info('Nouvelle mise à jour disponible');

// Toast personnalisé
this.toastService.show({
  type: 'success',
  message: 'Message personnalisé',
  duration: 3000,
  dismissible: true
});
```

### ToastComponent
Ajoutez le composant toast dans votre layout principal (app.component.html):

```html
<app-toast></app-toast>
```

---

## ⏳ Loading

### LoadingComponent
Composant de chargement avec différentes tailles et modes.

```typescript
import { LoadingComponent } from '@shared/components';

// Dans votre template

<!-- Loading simple -->
<app-loading></app-loading>

<!-- Loading avec message -->
<app-loading message="Chargement des données..."></app-loading>

<!-- Loading en overlay -->
<app-loading 
  [overlay]="true"
  message="Traitement en cours...">
</app-loading>

<!-- Loading plein écran -->
<app-loading 
  [fullscreen]="true"
  [size]="'large'"
  message="Chargement de l'application...">
</app-loading>
```

**Props:**
- `size`: 'small' | 'medium' | 'large' - Taille du spinner
- `message`: string - Message de chargement
- `overlay`: boolean - Afficher en overlay sur le contenu
- `fullscreen`: boolean - Afficher en plein écran

---

## 🎨 Styles personnalisés

Tous les composants utilisent les couleurs du thème:
- **Primary**: #3a5689 (Bleu)
- **Success**: #10b981 (Vert)
- **Error**: #ef4444 (Rouge)
- **Warning**: #f59e0b (Orange)
- **Info**: #3b82f6 (Bleu clair)

Les styles sont responsive et s'adaptent automatiquement aux petits écrans.

---

## 📱 Responsive

Tous les modals et composants sont optimisés pour mobile:
- Largeur adaptative
- Boutons empilés verticalement
- Padding réduit
- Texte ajusté

---

## 🔧 Configuration

### Dans app.config.ts

```typescript
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    // ...
  ]
};
```

### Dans app.component.html

```html
<router-outlet></router-outlet>
<app-toast></app-toast>
```

---

## 📝 Exemples complets

Consultez `src/app/shared/examples/modal-usage.example.ts` pour des exemples d'utilisation complets.
