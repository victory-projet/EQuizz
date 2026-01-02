// backend/src/models/index.js

const sequelize = require('../config/database');
const { Sequelize, DataTypes } = require('sequelize');

// --- Importation de tous les modèles ---
const Utilisateur = require('./Utilisateur');
const Administrateur = require('./Administrateur');
const Enseignant = require('./Enseignant');
const Etudiant = require('./Etudiant');
const Ecole = require('./Ecole');
const AnneeAcademique = require('./AnneeAcademique');
const Semestre = require('./Semestre');
const Cours = require('./Cours');
const Classe = require('./Classe');
const Evaluation = require('./Evaluation');
const Quizz = require('./Quizz');
const Question = require('./Question');
const SessionReponse = require('./SessionReponse');
const SessionToken = require('./SessionToken');
const ReponseEtudiant = require('./ReponseEtudiant');
const Notification = require('./Notification');
const AnalyseReponse = require('./AnalyseReponse');
const PasswordResetToken = require('./PasswordResetToken');
const DeviceToken = require('./DeviceToken');
const NotificationPreference = require('./NotificationPreference');

// --- Centralisation dans un objet 'db' ---
const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Utilisateur = Utilisateur;
db.Administrateur = Administrateur;
db.Enseignant = Enseignant;
db.Etudiant = Etudiant;
db.Ecole = Ecole;
db.AnneeAcademique = AnneeAcademique;
db.Semestre = Semestre;
db.Cours = Cours;
db.Classe = Classe;
db.Evaluation = Evaluation;
db.Quizz = Quizz;
db.Question = Question;
db.SessionReponse = SessionReponse;
db.SessionToken = SessionToken;
db.ReponseEtudiant = ReponseEtudiant;
db.Notification = Notification;
db.AnalyseReponse = AnalyseReponse;
db.PasswordResetToken = PasswordResetToken;
db.DeviceToken = DeviceToken;
db.NotificationPreference = NotificationPreference;

// --- Définition de toutes les Relations (Associations) ---

// --- 1. Héritage des Utilisateurs (Relations 1-à-1) ---
Utilisateur.hasOne(Administrateur, { foreignKey: 'id', onDelete: 'CASCADE' });
Administrateur.belongsTo(Utilisateur, { foreignKey: 'id' });

Utilisateur.hasOne(Enseignant, { foreignKey: 'id', onDelete: 'CASCADE' });
Enseignant.belongsTo(Utilisateur, { foreignKey: 'id' });

Utilisateur.hasOne(Etudiant, { foreignKey: 'id', onDelete: 'CASCADE' });
Etudiant.belongsTo(Utilisateur, { foreignKey: 'id' });

// --- 2. Structure Académique ---
Ecole.hasMany(Classe, { foreignKey: { name: 'ecole_id', allowNull: false } });
Classe.belongsTo(Ecole, { foreignKey: 'ecole_id' });

AnneeAcademique.hasMany(Classe, { foreignKey: 'anneeAcademiqueId' });
Classe.belongsTo(AnneeAcademique, { foreignKey: 'anneeAcademiqueId' });

AnneeAcademique.hasMany(Semestre, { foreignKey: { name: 'annee_academique_id', allowNull: false }, onDelete: 'CASCADE' });
Semestre.belongsTo(AnneeAcademique, { foreignKey: 'annee_academique_id' });

AnneeAcademique.hasMany(Cours, { foreignKey: { name: 'annee_academique_id', allowNull: true } });
Cours.belongsTo(AnneeAcademique, { foreignKey: 'annee_academique_id' });

Semestre.hasMany(Cours, { foreignKey: { name: 'semestre_id', allowNull: false } });
Cours.belongsTo(Semestre, { foreignKey: 'semestre_id' });

Enseignant.hasMany(Cours, { foreignKey: { name: 'enseignant_id', allowNull: false } });
Cours.belongsTo(Enseignant, { foreignKey: 'enseignant_id' });

Classe.hasMany(Etudiant, { foreignKey: 'classe_id' });
Etudiant.belongsTo(Classe, { foreignKey: 'classe_id' });

// Relation Plusieurs-à-Plusieurs entre Cours et Classe
const CoursClasse = sequelize.define('CoursClasse', {}, { freezeTableName: true, paranoid: false, underscored: true }); // Table de jonction simple
Cours.belongsToMany(Classe, { through: CoursClasse });
Classe.belongsToMany(Cours, { through: CoursClasse });


// --- 3. Processus d'Évaluation (Composition) ---
Administrateur.hasMany(Evaluation, { foreignKey: { name: 'administrateur_id', allowNull: false } });
Evaluation.belongsTo(Administrateur, { foreignKey: 'administrateur_id' });

Cours.hasMany(Evaluation, { foreignKey: { name: 'cours_id', allowNull: false } });
Evaluation.belongsTo(Cours, { foreignKey: 'cours_id' });

Evaluation.hasOne(Quizz, { foreignKey: { name: 'evaluation_id', allowNull: false }, onDelete: 'CASCADE' });
Quizz.belongsTo(Evaluation, { foreignKey: 'evaluation_id' });

Quizz.hasMany(Question, { foreignKey: { name: 'quizz_id', allowNull: false }, onDelete: 'CASCADE' });
Question.belongsTo(Quizz, { foreignKey: 'quizz_id' });


// --- 4. Processus de Réponse (Anonyme) ---
Quizz.hasMany(SessionReponse, { foreignKey: { name: 'quizz_id', allowNull: false } });
SessionReponse.belongsTo(Quizz, { foreignKey: 'quizz_id' });

Etudiant.hasMany(SessionReponse, { foreignKey: { name: 'etudiant_id', allowNull: false } });
SessionReponse.belongsTo(Etudiant, { foreignKey: 'etudiant_id' });

SessionReponse.hasMany(ReponseEtudiant, { foreignKey: { name: 'session_reponse_id', allowNull: false }, onDelete: 'CASCADE' });
ReponseEtudiant.belongsTo(SessionReponse, { foreignKey: 'session_reponse_id' });

Question.hasMany(ReponseEtudiant, { foreignKey: { name: 'question_id', allowNull: false } });
ReponseEtudiant.belongsTo(Question, { foreignKey: 'question_id' });

// Relation SessionToken pour l'anonymat
Etudiant.hasMany(SessionToken, { foreignKey: { name: 'etudiant_id', allowNull: false } });
SessionToken.belongsTo(Etudiant, { foreignKey: 'etudiant_id' });


// --- 5. Modules Annexes (Notification, Analyse) ---
ReponseEtudiant.hasOne(AnalyseReponse, { foreignKey: { name: 'reponse_etudiant_id', allowNull: false, unique: true }, onDelete: 'CASCADE' });
AnalyseReponse.belongsTo(ReponseEtudiant, { foreignKey: 'reponse_etudiant_id' });

Evaluation.hasMany(Notification, { foreignKey: 'evaluation_id' });
Notification.belongsTo(Evaluation, { foreignKey: 'evaluation_id' });

// Relation Plusieurs-à-Plusieurs entre Notification et Etudiant (avec statut de lecture)
const NotificationEtudiant = sequelize.define('NotificationEtudiant', {
  estLue: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { freezeTableName: true, paranoid: false, underscored: true });
Etudiant.belongsToMany(Notification, { through: NotificationEtudiant });
Notification.belongsToMany(Etudiant, { through: NotificationEtudiant });

//  Nouvelle Relation Plusieurs-à-Plusieurs entre Evaluation et Classe 

const EvaluationClasse = sequelize.define('EvaluationClasse', {}, { freezeTableName: true, paranoid: false, underscored: true });
Evaluation.belongsToMany(Classe, { through: EvaluationClasse });
Classe.belongsToMany(Evaluation, { through: EvaluationClasse });

// --- 6. Password Reset Tokens ---
Utilisateur.hasMany(PasswordResetToken, { foreignKey: { name: 'utilisateur_id', allowNull: false }, onDelete: 'CASCADE' });
PasswordResetToken.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

// --- 7. Push Notifications ---
Utilisateur.hasMany(DeviceToken, { foreignKey: { name: 'utilisateur_id', allowNull: false }, onDelete: 'CASCADE' });
DeviceToken.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

Utilisateur.hasOne(NotificationPreference, { foreignKey: { name: 'utilisateur_id', allowNull: false }, onDelete: 'CASCADE' });
NotificationPreference.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

module.exports = db;