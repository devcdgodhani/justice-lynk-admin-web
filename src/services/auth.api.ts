import api from './api';
import {
    LoginPayload, RegisterPayload, MfaVerifyPayload, MfaBackupCodePayload,
    VerifyEmailOtpPayload, ResendOtpPayload,
    ForgotPasswordPayload, VerifyForgotPasswordOtpPayload, ResetPasswordPayload,
    LoginResult, User, ApiResponse, AuthTokens,
} from '@/types';

export const authApi = {
    // ── Registration ──────────────────────────────────────────────────────────
    register: (data: RegisterPayload) =>
        api.post<ApiResponse<{ user: User; email: string; message: string }>>('/auth/register', data).then((r) => r.data),

    // ── Email OTP ─────────────────────────────────────────────────────────────
    verifyEmail: (data: VerifyEmailOtpPayload) =>
        api.post<ApiResponse<AuthTokens & { user: User }>>('/auth/verify-email', data).then((r) => r.data),

    resendOtp: (data: ResendOtpPayload) =>
        api.post<ApiResponse<{ message: string }>>('/auth/resend-otp', data).then((r) => r.data),

    // ── Login ─────────────────────────────────────────────────────────────────
    login: (data: LoginPayload) =>
        api.post<ApiResponse<LoginResult>>('/auth/login', data).then((r) => r.data),

    // ── MFA ───────────────────────────────────────────────────────────────────
    mfaVerify: (data: MfaVerifyPayload) =>
        api.post<ApiResponse<AuthTokens & { user: User }>>('/auth/mfa/verify', data).then((r) => r.data),

    mfaBackupCode: (data: MfaBackupCodePayload) =>
        api.post<ApiResponse<AuthTokens & { user: User }>>('/auth/mfa/backup-code', data).then((r) => r.data),

    // ── Forgot Password ───────────────────────────────────────────────────────
    forgotPassword: (data: ForgotPasswordPayload) =>
        api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', data).then((r) => r.data),

    verifyForgotPasswordOtp: (data: VerifyForgotPasswordOtpPayload) =>
        api.post<ApiResponse<{ message: string; resetToken: string }>>('/auth/forgot-password/verify-otp', data).then((r) => r.data),

    resetPassword: (data: ResetPasswordPayload) =>
        api.post<ApiResponse<{ message: string }>>('/auth/reset-password', data).then((r) => r.data),

    // ── Token ─────────────────────────────────────────────────────────────────
    refresh: (refreshToken: string) =>
        api.post<ApiResponse<AuthTokens>>('/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
        }).then((r) => r.data),

    logout: () => api.post('/auth/logout').then((r) => r.data),

    // ── MFA Setup ─────────────────────────────────────────────────────────────
    setupMfa: () =>
        api.get<ApiResponse<{ qrCode: string; secret: string }>>('/auth/mfa/setup').then((r) => r.data),

    enableMfa: (token: string) =>
        api.post<ApiResponse<{ backupCodes: string[] }>>('/auth/mfa/enable', { token }).then((r) => r.data),

    getMe: () => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data),
};
