import api from './api';
import {
    LoginPayload, RegisterPayload, MfaVerifyPayload,
    LoginResult, User, ApiResponse, AuthTokens,
} from '@/types';

export const authApi = {
    login: (data: LoginPayload) =>
        api.post<ApiResponse<LoginResult>>('/auth/login', data).then((r) => r.data),

    register: (data: RegisterPayload) =>
        api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/register', data).then((r) => r.data),

    mfaVerify: (data: MfaVerifyPayload) =>
        api.post<ApiResponse<AuthTokens & { user: User }>>('/auth/mfa/verify', data).then((r) => r.data),

    mfaBackupCode: (userId: string, code: string) =>
        api.post<ApiResponse<AuthTokens & { user: User }>>('/auth/mfa/backup-code', { userId, code }).then((r) => r.data),

    refresh: (refreshToken: string) =>
        api.post<ApiResponse<AuthTokens>>('/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
        }).then((r) => r.data),

    logout: () => api.post('/auth/logout').then((r) => r.data),

    setupMfa: () =>
        api.get<ApiResponse<{ qrCode: string; secret: string }>>('/auth/mfa/setup').then((r) => r.data),

    enableMfa: (token: string) =>
        api.post<ApiResponse<{ backupCodes: string[] }>>('/auth/mfa/enable', { token }).then((r) => r.data),

    getMe: () => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data),
};
