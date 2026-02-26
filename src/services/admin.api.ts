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

    // Roles Management
    listRoles: () =>
        api.get<ApiResponse<any[]>>('/admin/roles').then((r) => r.data),

    createRole: (data: any) =>
        api.post<ApiResponse<any>>('/admin/roles', data).then((r) => r.data),

    updateRole: (id: string, data: any) =>
        api.patch<ApiResponse<any>>(`/admin/roles/${id}`, data).then((r) => r.data),

    deleteRole: (id: string) =>
        api.delete<ApiResponse<null>>(`/admin/roles/${id}`).then((r) => r.data),

    getRolePermissions: (id: string) =>
        api.get<ApiResponse<any[]>>(`/admin/roles/${id}/permissions`).then((r) => r.data),

    grantRolePermissions: (roleId: string, permissions: any[]) =>
        api.post<ApiResponse<any>>('/admin/roles/grant', { roleId, permissions }).then((r) => r.data),

    getModules: () =>
        api.get<ApiResponse<any[]>>('/admin/roles/modules').then((r) => r.data),

    getScreens: () =>
        api.get<ApiResponse<any[]>>('/admin/roles/screens').then((r) => r.data),

    // Subscription Plans
    listSubscriptionPlans: () =>
        api.get<ApiResponse<any[]>>('/admin/subscription-plans').then((r) => r.data),

    getSubscriptionPlan: (id: string) =>
        api.get<ApiResponse<any>>(`/admin/subscription-plans/${id}`).then((r) => r.data),

    createSubscriptionPlan: (data: any) =>
        api.post<ApiResponse<any>>('/admin/subscription-plans', data).then((r) => r.data),

    updateSubscriptionPlan: (id: string, data: any) =>
        api.put<ApiResponse<any>>(`/admin/subscription-plans/${id}`, data).then((r) => r.data),

    deleteSubscriptionPlan: (id: string) =>
        api.delete<ApiResponse<null>>(`/admin/subscription-plans/${id}`).then((r) => r.data),
};
