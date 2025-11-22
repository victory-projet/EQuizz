// src/app/presentation/features/settings/settings.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';
import { ToastService } from '../../../core/services/toast.service';
import { inject } from '@angular/core';

interface SettingsData {
  // Profil
  firstName: string;
  lastName: string;
  email: string;
  
  // Notifications
  emailNotifications: boolean;
  quizReminders: boolean;
  weeklyReport: boolean;
  
  // Préférences
  language: string;
  timezone: string;
  dateFormat: string;
  
  // Sécurité
  twoFactorAuth: boolean;
  sessionTimeout: number;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent {
  private toastService = inject(ToastService);

  activeTab = signal<'profile' | 'notifications' | 'preferences' | 'security'>('profile');
  
  settings = signal<SettingsData>({
    // Profil
    firstName: 'Admin',
    lastName: 'Principal',
    email: 'admin@equizz.com',
    
    // Notifications
    emailNotifications: true,
    quizReminders: true,
    weeklyReport: false,
    
    // Préférences
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    
    // Sécurité
    twoFactorAuth: false,
    sessionTimeout: 30
  });

  // Password change
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  setActiveTab(tab: 'profile' | 'notifications' | 'preferences' | 'security'): void {
    this.activeTab.set(tab);
  }

  saveProfile(): void {
    this.toastService.success('Profil mis à jour avec succès');
  }

  saveNotifications(): void {
    this.toastService.success('Préférences de notification enregistrées');
  }

  savePreferences(): void {
    this.toastService.success('Préférences enregistrées');
  }

  saveSecurity(): void {
    this.toastService.success('Paramètres de sécurité mis à jour');
  }

  changePassword(): void {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.toastService.error('Veuillez remplir tous les champs');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toastService.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      this.toastService.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // Simuler le changement de mot de passe
    this.toastService.success('Mot de passe modifié avec succès');
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  exportData(): void {
    this.toastService.info('Export des données en cours...');
    // Simuler l'export
    setTimeout(() => {
      this.toastService.success('Données exportées avec succès');
    }, 1500);
  }

  deleteAccount(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      this.toastService.warning('Suppression du compte annulée');
    }
  }
}
