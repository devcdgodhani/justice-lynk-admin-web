import api from './api';
import { MfaStatus, Session, ApiResponse } from '@/types';

export const securityApi = {
    getMfaStatus: () =>
        api.get<ApiResponse<MfaStatus>>('/security/mfa/status').then((r) => r.data),

    disableMfa: (password: string) =>
        api.post<ApiResponse<{ message: string }>>('/security/mfa/disable', { password }).then((r) => r.data),

    regenerateBackupCodes: () =>
        api.post<ApiResponse<{ backupCodes: string[] }>>('/security/mfa/backup-codes/regenerate').then((r) => r.data),

    getSessions: () =>
        api.get<ApiResponse<Session[]>>('/security/sessions').then((r) => r.data),

    revokeSession: (sessionId: string) =>
        api.delete<ApiResponse<null>>(`/security/sessions/${sessionId}`).then((r) => r.data),

    revokeAllSessions: () =>
        api.delete<ApiResponse<null>>('/security/sessions/all').then((r) => r.data),
};
