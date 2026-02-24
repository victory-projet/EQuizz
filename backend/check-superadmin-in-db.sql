-- Vérifier que le superadmin existe dans les deux tables
SELECT 
    u.id,
    u.nom,
    u.prenom,
    u.email,
    s.id as superadmin_id,
    CASE 
        WHEN s.id IS NOT NULL THEN 'SUPER-ADMIN'
        ELSE 'PAS DE ROLE'
    END as role
FROM utilisateur u
LEFT JOIN superadministrateur s ON u.id = s.id
WHERE u.email = 'super.admin@saintjeaningenieur.org';
