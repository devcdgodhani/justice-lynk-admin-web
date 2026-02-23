import api from './api';
import { AuditLog, ApiResponse, PaginatedResponse } from '@/types';

export const auditApi = {
    getAuditLogs: (params?: {
        page?: number; limit?: number;
        module?: string; action?: string;
        from?: string; to?: string;
    }) =>
        api.get<ApiResponse<PaginatedResponse<AuditLog>>>('/audit', { params }).then((r) => r.data),

    getMyLogs: (page = 1, limit = 20) =>
        api.get<ApiResponse<PaginatedResponse<AuditLog>>>('/audit/mine', { params: { page, limit } }).then((r) => r.data),
};
