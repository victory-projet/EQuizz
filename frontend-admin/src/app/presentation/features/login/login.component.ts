import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ForgotPasswordUseCase } from '../../../core/usecases/forgot-password.usecase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    motDePasse: ''
  };

  rememberMe = signal(false);
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  // Forgot password mode
  isForgotPasswordMode = signal(false);
  forgotPasswordEmail = '';
  
  constructor(
    private authService: AuthService,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user chose to be remembered
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.credentials.email = rememberedEmail;
      this.rememberMe.set(true);
    }

    // Check if it's first time (show onboarding)
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      this.router.navigate(['/onboarding']);
    }
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  toggleRememberMe(): void {
    this.rememberMe.update(value => !value);
  }

  onSubmit(): void {
    if (this.credentials.email && this.credentials.motDePasse) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      // Save email if remember me is checked
      if (this.rememberMe()) {
        localStorage.setItem('rememberedEmail', this.credentials.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      this.authService.login(this.credentials).subscribe({
        next: () => {
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.error?.message || 
            'Email ou mot de passe incorrect'
          );
        }
      });
    }
  }

  switchToForgotPassword(): void {
    this.isForgotPasswordMode.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.forgotPasswordEmail = this.credentials.email;
  }

  switchToLogin(): void {
    this.isForgotPasswordMode.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordEmail) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      this.forgotPasswordUseCase.requestPasswordReset(this.forgotPasswordEmail).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(
            response.message || 
            'Un email de réinitialisation a été envoyé à ' + this.forgotPasswordEmail
          );
          
          // Switch back to login after 5 seconds
          setTimeout(() => {
            this.switchToLogin();
          }, 5000);
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
  }
}
