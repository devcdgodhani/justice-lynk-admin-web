import api from './api';
import {
    Case, CaseDocument, CaseAssignment, CreateCasePayload,
    CaseStatus, ApiResponse, PaginatedResponse,
} from '@/types';

export const casesApi = {
    getCases: (params?: {
        page?: number; limit?: number; status?: string;
        type?: string; search?: string; clientId?: string;
    }) =>
        api.get<ApiResponse<PaginatedResponse<Case>>>('/cases', { params }).then((r) => r.data),

    getCaseById: (id: string) =>
        api.get<ApiResponse<Case>>(`/cases/${id}`).then((r) => r.data),

    createCase: (data: CreateCasePayload) =>
        api.post<ApiResponse<Case>>('/cases', data).then((r) => r.data),

    updateCase: (id: string, data: Partial<CreateCasePayload>) =>
        api.patch<ApiResponse<Case>>(`/cases/${id}`, data).then((r) => r.data),

    updateCaseStatus: (id: string, status: CaseStatus, note?: string) =>
        api.patch<ApiResponse<Case>>(`/cases/${id}/status`, { status, note }).then((r) => r.data),

    assignProfessional: (caseId: string, professionalId: string, role: string) =>
        api.post<ApiResponse<CaseAssignment>>(`/cases/${caseId}/assignments`, { professionalId, role }).then((r) => r.data),

    getDocuments: (caseId: string) =>
        api.get<ApiResponse<CaseDocument[]>>(`/cases/${caseId}/documents`).then((r) => r.data),

    addDocument: (caseId: string, data: { name: string; fileUrl: string; fileType: string }) =>
        api.post<ApiResponse<CaseDocument>>(`/cases/${caseId}/documents`, data).then((r) => r.data),

    deleteCase: (id: string) =>
        api.delete<ApiResponse<null>>(`/cases/${id}`).then((r) => r.data),
};
