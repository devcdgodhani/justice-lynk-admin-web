import api from './api';
import { Professional, ApiResponse, PaginatedResponse } from '@/types';

interface ProfessionalProfilePayload {
    type: string;
    bio?: string;
    licenseNumber?: string;
    barCouncil?: string;
    specializations?: string[];
    experienceYears?: number;
    city?: string;
    state?: string;
    country?: string;
    hourlyRate?: number;
}

export const professionalsApi = {
    getMarketplace: (params?: {
        type?: string; specialization?: string; city?: string;
        page?: number; limit?: number;
    }) =>
        api.get<ApiResponse<PaginatedResponse<Professional>>>('/professionals/marketplace', { params }).then((r) => r.data),

    getProfessional: (id: string) =>
        api.get<ApiResponse<Professional>>(`/professionals/${id}`).then((r) => r.data),

    getMyProfile: () =>
        api.get<ApiResponse<Professional>>('/professionals/profile').then((r) => r.data),

    createOrUpdateProfile: (data: ProfessionalProfilePayload) =>
        api.post<ApiResponse<Professional>>('/professionals/profile', data).then((r) => r.data),

    verify: (id: string) =>
        api.patch<ApiResponse<Professional>>(`/professionals/${id}/verify`).then((r) => r.data),
};
