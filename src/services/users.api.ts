import api from './api';
import { User, ApiResponse, PaginatedResponse } from '@/types';

export const usersApi = {
    getProfile: () =>
        api.get<ApiResponse<User>>('/users/profile').then((r) => r.data),

    updateProfile: (data: { firstName?: string; lastName?: string; phone?: string; avatar?: string }) =>
        api.patch<ApiResponse<User>>('/users/profile', data).then((r) => r.data),

    getAllUsers: (page = 1, limit = 20, search?: string) =>
        api.get<ApiResponse<PaginatedResponse<User>>>('/users', { params: { page, limit, search } }).then((r) => r.data),

    getUserById: (id: string) =>
        api.get<ApiResponse<User>>(`/users/${id}`).then((r) => r.data),

    deactivateUser: (id: string) =>
        api.delete<ApiResponse<null>>(`/users/${id}`).then((r) => r.data),
};
