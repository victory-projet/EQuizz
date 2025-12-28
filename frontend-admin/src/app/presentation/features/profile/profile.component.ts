import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../../core/domain/entities/user.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  profileForm: FormGroup;
  isEditingProfile = signal(false);
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.profileForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.user.set(this.authService.currentUser());
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.profileForm.patchValue({
        prenom: currentUser.prenom,
        nom: currentUser.nom,
        email: currentUser.email
      });
    }
  }

  toggleEditProfile(): void {
    this.isEditingProfile.set(!this.isEditingProfile());
    if (!this.isEditingProfile()) {
      this.loadUserProfile(); // Reset form
    }
    this.clearMessages();
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
      this.clearMessages();

      const profileData = this.profileForm.value;
      
      this.http.put(`${environment.apiUrl}/auth/profile`, profileData).subscribe({
        next: (response: any) => {
          this.successMessage.set('Profil mis à jour avec succès');
          this.isEditingProfile.set(false);
          this.isLoading.set(false);
          
          // Update current user in auth service
          const updatedUser = { ...this.user()!, ...profileData };
          this.user.set(updatedUser);
          this.authService.currentUser.set(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        },
        error: (error) => {
          this.errorMessage.set('Erreur lors de la mise à jour du profil');
          this.isLoading.set(false);
          console.error('Erreur:', error);
        }
      });
    }
  }

  private clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  getInitials(): string {
    const user = this.user();
    if (user) {
      return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase();
    }
    return 'AD';
  }

  getRoleDisplayName(): string {
    const user = this.user();
    switch (user?.role) {
      case 'ADMIN': return 'Administrateur';
      case 'ENSEIGNANT': return 'Enseignant';
      case 'ETUDIANT': return 'Étudiant';
      default: return 'Utilisateur';
    }
  }

  formatDate(dateInput: string | Date | undefined): string {
    if (!dateInput) return 'Non disponible';
    
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    if (isNaN(date.getTime())) return 'Date invalide';
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}