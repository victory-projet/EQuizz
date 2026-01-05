import { ImportConfig } from './excel-import.component';

export const COURS_IMPORT_CONFIG: ImportConfig = {
  type: 'cours',
  title: 'Import des Cours',
  description: 'Importez vos cours depuis un fichier Excel avec les informations de base.',
  templateColumns: [
    { header: 'Code', key: 'code', width: 15 },
    { header: 'Nom', key: 'nom', width: 40 },
    { header: 'Description', key: 'description', width: 50, required: false },
    { header: 'Email Enseignant', key: 'emailEnseignant', width: 30, required: false }
  ],
  exampleData: [
    {
      code: 'MATH101',
      nom: 'Mathématiques Fondamentales',
      description: 'Introduction aux concepts mathématiques de base',
      emailEnseignant: 'prof.martin@ecole.fr'
    },
    {
      code: 'INFO201',
      nom: 'Programmation Orientée Objet',
      description: 'Concepts avancés de la POO en Java',
      emailEnseignant: 'prof.durand@ecole.fr'
    },
    {
      code: 'PHYS101',
      nom: 'Physique Générale',
      description: 'Principes fondamentaux de la physique',
      emailEnseignant: ''
    }
  ],
  instructions: [
    '1. Le code du cours doit être unique',
    '2. Le nom du cours est obligatoire',
    '3. La description est optionnelle',
    '4. L\'email de l\'enseignant doit correspondre à un enseignant existant',
    '5. Si l\'email enseignant est vide, le cours sera créé sans enseignant assigné'
  ]
};

export const CLASSES_IMPORT_CONFIG: ImportConfig = {
  type: 'classes',
  title: 'Import des Classes',
  description: 'Importez vos classes depuis un fichier Excel avec les informations de base.',
  templateColumns: [
    { header: 'Nom', key: 'nom', width: 30 },
    { header: 'Niveau', key: 'niveau', width: 20, required: false },
    { header: 'Année Académique', key: 'anneeAcademique', width: 25, required: false }
  ],
  exampleData: [
    {
      nom: 'L1 Informatique A',
      niveau: 'L1',
      anneeAcademique: '2024-2025'
    },
    {
      nom: 'L2 Mathématiques B',
      niveau: 'L2',
      anneeAcademique: '2024-2025'
    },
    {
      nom: 'M1 Génie Logiciel',
      niveau: 'M1',
      anneeAcademique: '2024-2025'
    }
  ],
  instructions: [
    '1. Le nom de la classe doit être unique',
    '2. Le niveau est optionnel (L1, L2, L3, M1, M2, etc.)',
    '3. L\'année académique est optionnelle (format: YYYY-YYYY)',
    '4. Si l\'année académique n\'est pas spécifiée, l\'année courante sera utilisée'
  ]
};

export const ETUDIANTS_IMPORT_CONFIG: ImportConfig = {
  type: 'etudiants',
  title: 'Import des Étudiants',
  description: 'Importez vos étudiants depuis un fichier Excel avec leurs informations personnelles.',
  templateColumns: [
    { header: 'Nom', key: 'nom', width: 20 },
    { header: 'Prénom', key: 'prenom', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Matricule', key: 'matricule', width: 15, required: false },
    { header: 'Classe', key: 'classe', width: 25, required: false },
    { header: 'Numéro Carte Étudiant', key: 'numeroCarteEtudiant', width: 20, required: false }
  ],
  exampleData: [
    {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@etudiant.fr',
      matricule: 'ETU2024001',
      classe: 'L1 Informatique A',
      numeroCarteEtudiant: 'CE2024001'
    },
    {
      nom: 'Martin',
      prenom: 'Marie',
      email: 'marie.martin@etudiant.fr',
      matricule: 'ETU2024002',
      classe: 'L2 Mathématiques B',
      numeroCarteEtudiant: 'CE2024002'
    },
    {
      nom: 'Bernard',
      prenom: 'Pierre',
      email: 'pierre.bernard@etudiant.fr',
      matricule: 'ETU2024003',
      classe: '',
      numeroCarteEtudiant: ''
    }
  ],
  instructions: [
    '1. Le nom et prénom sont obligatoires',
    '2. L\'email doit être unique et valide',
    '3. Le matricule doit être unique s\'il est fourni',
    '4. La classe doit correspondre à une classe existante',
    '5. Le numéro de carte étudiant doit être unique s\'il est fourni',
    '6. Un mot de passe temporaire sera généré automatiquement'
  ]
};

export const ENSEIGNANTS_IMPORT_CONFIG: ImportConfig = {
  type: 'enseignants',
  title: 'Import des Enseignants',
  description: 'Importez vos enseignants depuis un fichier Excel avec leurs informations professionnelles.',
  templateColumns: [
    { header: 'Nom', key: 'nom', width: 20 },
    { header: 'Prénom', key: 'prenom', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Matricule', key: 'matricule', width: 15, required: false },
    { header: 'Spécialité', key: 'specialite', width: 30, required: false }
  ],
  exampleData: [
    {
      nom: 'Professeur',
      prenom: 'Martin',
      email: 'prof.martin@ecole.fr',
      matricule: 'ENS2024001',
      specialite: 'Mathématiques'
    },
    {
      nom: 'Docteur',
      prenom: 'Durand',
      email: 'prof.durand@ecole.fr',
      matricule: 'ENS2024002',
      specialite: 'Informatique'
    },
    {
      nom: 'Maître',
      prenom: 'Leclerc',
      email: 'prof.leclerc@ecole.fr',
      matricule: 'ENS2024003',
      specialite: 'Physique'
    }
  ],
  instructions: [
    '1. Le nom et prénom sont obligatoires',
    '2. L\'email doit être unique et valide',
    '3. Le matricule doit être unique s\'il est fourni',
    '4. La spécialité est optionnelle',
    '5. Un mot de passe temporaire sera généré automatiquement',
    '6. L\'enseignant recevra un email avec ses identifiants'
  ]
};

export const ADMINISTRATEURS_IMPORT_CONFIG: ImportConfig = {
  type: 'administrateurs',
  title: 'Import des Administrateurs',
  description: 'Importez vos administrateurs depuis un fichier Excel avec leurs informations.',
  templateColumns: [
    { header: 'Nom', key: 'nom', width: 20 },
    { header: 'Prénom', key: 'prenom', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Matricule', key: 'matricule', width: 15, required: false }
  ],
  exampleData: [
    {
      nom: 'Admin',
      prenom: 'Principal',
      email: 'admin.principal@ecole.fr',
      matricule: 'ADM2024001'
    },
    {
      nom: 'Gestionnaire',
      prenom: 'Système',
      email: 'admin.systeme@ecole.fr',
      matricule: 'ADM2024002'
    }
  ],
  instructions: [
    '1. Le nom et prénom sont obligatoires',
    '2. L\'email doit être unique et valide',
    '3. Le matricule doit être unique s\'il est fourni',
    '4. Un mot de passe temporaire sera généré automatiquement',
    '5. L\'administrateur recevra un email avec ses identifiants',
    '6. ⚠️ ATTENTION: Les administrateurs ont tous les droits sur le système'
  ]
};