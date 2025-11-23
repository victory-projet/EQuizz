// src/app/presentation/features/settings/settings.ts
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';
import { ToastService } from '../../../core/services/toast.service';
import { IUserRepository, IAuthRepository } from '../../../core/domain/repositories/auth.repository.interface';
import { User } from '../../../core/domain/entities/user.entity';

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
export class SettingsComponent implements OnInit {
  private toastService = inject(ToastService);
  private userRepo = inject(IUserRepository);
  private authRepo = inject(IAuthRepository);

  activeTab = signal<'profile' | 'notifications' | 'preferences' | 'security'>('profile');
  isLoading = signal(true);

  settings = signal<SettingsData>({
    // Profil
    firstName: '',
    lastName: '',
    email: '',

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

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading.set(true);
    this.authRepo.getCurrentUser().subscribe({
      next: (user) => {
        this.settings.update(s => ({
          ...s,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.toastService.error('Erreur lors du chargement du profil');
        this.isLoading.set(false);
      }
    });
  }

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
    const currentSettings = this.settings();
    const userUpdate: Partial<User> = {
      firstName: currentSettings.firstName,
      lastName: currentSettings.lastName,
      email: currentSettings.email
    };

    this.userRepo.update('current', userUpdate).subscribe({
      next: () => {
        this.toastService.success('Profil mis à jour avec succès');
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.toastService.error('Erreur lors de la mise à jour du profil');
      }
    });
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

    this.authRepo.changePassword(
      this.passwordData.currentPassword,
      this.passwordData.newPassword
    ).subscribe({
      next: () => {
        this.toastService.success('Mot de passe modifié avec succès');
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.toastService.error('Erreur lors du changement de mot de passe');
      }
    });
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
