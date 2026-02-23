import api from './api';
import { AdminStats, RevenueData, User, Organization, Professional, ApiResponse, PaginatedResponse } from '@/types';

export const adminApi = {
    getStats: () =>
        api.get<ApiResponse<AdminStats>>('/admin/stats').then((r) => r.data),

    listUsers: (params?: { page?: number; limit?: number; search?: string; isActive?: string }) =>
        api.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params }).then((r) => r.data),

    toggleUserStatus: (id: string, isActive: boolean) =>
        api.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),

    listOrgs: (params?: { page?: number; limit?: number; search?: string }) =>
        api.get<ApiResponse<PaginatedResponse<Organization>>>('/admin/organizations', { params }).then((r) => r.data),

    getPendingVerifications: (page = 1, limit = 20) =>
        api.get<ApiResponse<PaginatedResponse<Professional>>>('/admin/professionals/pending', { params: { page, limit } }).then((r) => r.data),

    getRevenue: (year?: number) =>
        api.get<ApiResponse<RevenueData>>('/admin/revenue', { params: { year } }).then((r) => r.data),

    // Advanced Management
    getUser: (id: string) =>
        api.get<ApiResponse<User>>(`/users/${id}`).then((r) => r.data),

    deleteUser: (id: string) =>
        api.delete<ApiResponse<null>>(`/users/${id}`).then((r) => r.data),

    getOrg: (id: string) =>
        api.get<ApiResponse<Organization>>(`/organizations/${id}`).then((r) => r.data),

    updateOrg: (id: string, data: any) =>
        api.patch<ApiResponse<Organization>>(`/organizations/${id}`, data).then((r) => r.data),

    deleteOrg: (id: string) =>
        api.delete<ApiResponse<null>>(`/organizations/${id}`).then((r) => r.data),

    getProfessional: (id: string) =>
        api.get<ApiResponse<Professional>>(`/professionals/${id}`).then((r) => r.data),

    verifyProfessional: (id: string) =>
        api.patch<ApiResponse<Professional>>(`/professionals/${id}/verify`).then((r) => r.data),
};
