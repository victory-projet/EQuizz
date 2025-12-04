import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ForgotPasswordUseCase } from '../../../core/usecases/forgot-password.usecase';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  email = signal('');
  newPassword = '';
  confirmPassword = '';
  
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  isValidatingToken = signal(true);
  errorMessage = signal('');
  successMessage = signal('');
  tokenValid = signal(false);

  constructor(
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get token from URL query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      if (this.token) {
        this.validateToken();
      } else {
        this.isValidatingToken.set(false);
        this.errorMessage.set('Token de réinitialisation manquant');
      }
    });
  }

  validateToken(): void {
    this.isValidatingToken.set(true);
    
    this.forgotPasswordUseCase.validateResetToken(this.token).subscribe({
      next: (response) => {
        this.isValidatingToken.set(false);
        if (response.valid) {
          this.tokenValid.set(true);
          if (response.email) {
            this.email.set(response.email);
          }
        } else {
          this.tokenValid.set(false);
          this.errorMessage.set('Le lien de réinitialisation est invalide ou a expiré');
        }
      },
      error: (error) => {
        this.isValidatingToken.set(false);
        this.tokenValid.set(false);
        this.errorMessage.set(
          error.error?.message || 
          'Le lien de réinitialisation est invalide ou a expiré'
        );
      }
    });
  }

  toggleNewPassword(): void {
    this.showNewPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  validatePasswords(): boolean {
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage.set('Veuillez remplir tous les champs');
      return false;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.validatePasswords()) {
      return;
    }

    this.isLoading.set(true);

    this.forgotPasswordUseCase.resetPassword(
      this.token,
      this.newPassword,
      this.confirmPassword
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(
          response.message || 
          'Votre mot de passe a été réinitialisé avec succès'
        );
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 
          'Une erreur est survenue. Veuillez réessayer.'
        );
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
