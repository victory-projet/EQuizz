-- Nettoyer les utilisateurs supprimés (soft delete)
-- Afficher d'abord les utilisateurs supprimés
SELECT id, nom, prenom, email, deletedAt 
FROM utilisateur 
WHERE deletedAt IS NOT NULL;

-- Si vous voulez les supprimer définitivement (hard delete):
-- DELETE FROM utilisateur WHERE deletedAt IS NOT NULL;

-- Ou si vous voulez restaurer un utilisateur spécifique:
-- UPDATE utilisateur SET deletedAt = NULL WHERE email = 'super.admin@universitesaintjean.org';
