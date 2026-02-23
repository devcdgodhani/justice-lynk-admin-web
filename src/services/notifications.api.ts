import api from './api';
import { Notification, ApiResponse, PaginatedResponse } from '@/types';

export const notificationsApi = {
    getNotifications: (page = 1, limit = 20) =>
        api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { params: { page, limit } }).then((r) => r.data),

    getUnreadCount: () =>
        api.get<ApiResponse<{ count: number }>>('/notifications/unread-count').then((r) => r.data),

    markRead: (id: string) =>
        api.patch<ApiResponse<null>>(`/notifications/${id}/read`).then((r) => r.data),

    markAllRead: () =>
        api.patch<ApiResponse<null>>('/notifications/read-all').then((r) => r.data),

    clearAll: () =>
        api.delete<ApiResponse<null>>('/notifications/clear').then((r) => r.data),
};
