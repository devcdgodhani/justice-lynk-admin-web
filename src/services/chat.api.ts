import api from './api';
import { ChatMessage, ApiResponse, PaginatedResponse } from '@/types';

export const chatApi = {
    getMessages: (caseId: string, page = 1, limit = 50) =>
        api.get<ApiResponse<PaginatedResponse<ChatMessage>>>('/chat/messages', {
            params: { caseId, page, limit },
        }).then((r) => r.data),
};
