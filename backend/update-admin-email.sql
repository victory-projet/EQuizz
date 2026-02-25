-- Mettre à jour l'email du superadmin dans la base de données
UPDATE utilisateur 
SET email = 'super.admin@universitesaintjean.org'
WHERE email = 'super.admin@saintjeaningenieur.org' 
   OR email = 'super.admin@universitesaintjean';

-- Vérifier la mise à jour
SELECT id, nom, prenom, email, estActif 
FROM utilisateur 
WHERE email = 'super.admin@universitesaintjean.org';
