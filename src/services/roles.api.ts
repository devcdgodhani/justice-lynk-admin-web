import api from './api';
import { Role, Permission, ApiResponse } from '@/types';

export const rolesApi = {
    listRoles: () =>
        api.get<ApiResponse<Role[]>>('/roles').then((r) => r.data),

    createRole: (name: string, description?: string) =>
        api.post<ApiResponse<Role>>('/roles', { name, description }).then((r) => r.data),

    deleteRole: (id: string) =>
        api.delete<ApiResponse<null>>(`/roles/${id}`).then((r) => r.data),

    getRolePermissions: (roleId: string) =>
        api.get<ApiResponse<Permission[]>>(`/roles/${roleId}/permissions`).then((r) => r.data),

    grantPermissions: (roleId: string, permissions: { featureId: string; actionId: string }[]) =>
        api.post<ApiResponse<unknown>>('/roles/grant', { roleId, permissions }).then((r) => r.data),

    assignRole: (userId: string, roleId: string) =>
        api.post<ApiResponse<unknown>>('/roles/assign', { userId, roleId }).then((r) => r.data),

    getUserRoles: (userId: string) =>
        api.get<ApiResponse<Role[]>>(`/roles/user/${userId}`).then((r) => r.data),
};
