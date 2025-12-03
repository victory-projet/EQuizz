-- Migration: Création de la table password_reset_tokens
-- Date: 2025-01-XX
-- Description: Table pour gérer les tokens de réinitialisation de mot de passe

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  utilisateur_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  ip_address VARCHAR(45),
  
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expires (expires_at),
  INDEX idx_user_id (utilisateur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Commentaires sur les colonnes
ALTER TABLE password_reset_tokens 
  MODIFY COLUMN id INT COMMENT 'Identifiant unique du token',
  MODIFY COLUMN utilisateur_id INT COMMENT 'ID de l\'utilisateur qui demande la réinitialisation',
  MODIFY COLUMN token VARCHAR(255) COMMENT 'Token unique de réinitialisation (hash)',
  MODIFY COLUMN expires_at TIMESTAMP COMMENT 'Date d\'expiration du token (1 heure)',
  MODIFY COLUMN used_at TIMESTAMP COMMENT 'Date d\'utilisation du token (NULL si non utilisé)',
  MODIFY COLUMN ip_address VARCHAR(45) COMMENT 'Adresse IP de la demande (pour sécurité)';
