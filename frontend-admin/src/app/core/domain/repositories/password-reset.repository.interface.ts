import { Observable } from 'rxjs';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export interface IPasswordResetRepository {
  requestPasswordReset(request: ForgotPasswordRequest): Observable<ForgotPasswordResponse>;
  resetPassword(request: ResetPasswordRequest): Observable<ResetPasswordResponse>;
  validateResetToken(token: string): Observable<{ valid: boolean; email?: string }>;
}
