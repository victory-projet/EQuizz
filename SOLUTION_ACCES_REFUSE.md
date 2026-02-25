# Solution: "Accès refusé. Rôle super-administrateur requis"

## Problème
Quand un admin clique sur la section "Étudiants", une notification push affiche "Accès refusé. Rôle super-administrateur requis".

## Cause probable
Le frontend a un ancien token JWT en cache avec un rôle incorrect ou appelle une route qui nécessite le rôle super-admin.

## Tests effectués
✅ L'endpoint `/api/academic/etudiants` fonctionne correctement avec le rôle ADMIN
✅ Le login retourne le bon rôle: 'ADMIN'
✅ Les routes des étudiants utilisent le middleware `isAdmin` (pas `isSuperAdmin`)

## Solutions

### Solution 1: Vider le cache du navigateur (RECOMMANDÉ)
1. Ouvrir les DevTools du navigateur (F12)
2. Aller dans l'onglet "Application" ou "Storage"
3. Cliquer sur "Local Storage"
4. Supprimer les clés `token` et `user`
5. Rafraîchir la page
6. Se reconnecter avec les identifiants admin

### Solution 2: Se déconnecter et se reconnecter
1. Cliquer sur "Déconnexion" dans le frontend
2. Se reconnecter avec:
   - Email: `admin.sji@saintjeaningenieur.org`
   - Mot de passe: `admin123`

### Solution 3: Vérifier les appels réseau
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Network"
3. Cliquer sur "Étudiants"
4. Vérifier quelle route retourne l'erreur 403
5. Si c'est `/api/academic/ecoles`, c'est normal (les admins n'ont pas accès aux écoles)

## Vérification backend
Le backend est correctement configuré:
- ✅ Routes étudiants: `isAdmin` (accepte ADMIN et SUPER-ADMIN)
- ✅ Routes écoles: `isSuperAdmin` (accepte uniquement SUPER-ADMIN)
- ✅ Middleware `authenticate`: Charge correctement le rôle ADMIN
- ✅ Controller auth: Retourne le rôle 'ADMIN' au login

## Routes qui nécessitent SUPER-ADMIN uniquement
- `/api/academic/ecoles` (GET, POST, PUT, DELETE)

Toutes les autres routes acceptent le rôle ADMIN.

## Date
24 février 2026
