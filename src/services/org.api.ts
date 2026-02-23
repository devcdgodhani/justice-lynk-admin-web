import api from './api';
import { Organization, OrgMember, ApiResponse, PaginatedResponse } from '@/types';

export const orgApi = {
    getMyOrgs: () =>
        api.get<ApiResponse<Organization[]>>('/organizations/my').then((r) => r.data),

    createOrg: (data: { name: string; type?: string; description?: string; website?: string; country?: string }) =>
        api.post<ApiResponse<Organization>>('/organizations', data).then((r) => r.data),

    getOrg: (id: string) =>
        api.get<ApiResponse<Organization>>(`/organizations/${id}`).then((r) => r.data),

    updateOrg: (id: string, data: Partial<{ name: string; type: string; description: string; website: string; country: string }>) =>
        api.patch<ApiResponse<Organization>>(`/organizations/${id}`, data).then((r) => r.data),

    getMembers: (id: string, page = 1, limit = 20) =>
        api.get<ApiResponse<PaginatedResponse<OrgMember>>>(`/organizations/${id}/members`, { params: { page, limit } }).then((r) => r.data),

    invite: (id: string, email: string, role?: string) =>
        api.post<ApiResponse<{ message: string }>>(`/organizations/${id}/invite`, { email, role }).then((r) => r.data),

    acceptInvite: (token: string) =>
        api.post<ApiResponse<{ message: string }>>(`/organizations/accept-invite/${token}`).then((r) => r.data),

    removeMember: (orgId: string, userId: string) =>
        api.delete<ApiResponse<null>>(`/organizations/${orgId}/members/${userId}`).then((r) => r.data),
};
