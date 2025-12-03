import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PasswordResetRepository } from '../../infrastructure/repositories/password-reset.repository';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse
} from '../domain/repositories/password-reset.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordUseCase {
  constructor(private passwordResetRepository: PasswordResetRepository) {}

  requestPasswordReset(email: string): Observable<ForgotPasswordResponse> {
    const request: ForgotPasswordRequest = { email };
    return this.passwordResetRepository.requestPasswordReset(request);
  }

  resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<ResetPasswordResponse> {
    const request: ResetPasswordRequest = {
      token,
      newPassword,
      confirmPassword
    };
    return this.passwordResetRepository.resetPassword(request);
  }

  validateResetToken(token: string): Observable<{ valid: boolean; email?: string }> {
    return this.passwordResetRepository.validateResetToken(token);
  }
}
