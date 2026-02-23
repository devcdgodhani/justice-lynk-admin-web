import api from './api';
import { Plan, Subscription, ApiResponse } from '@/types';

export const subscriptionsApi = {
    getPlans: () =>
        api.get<ApiResponse<Plan[]>>('/subscriptions/plans').then((r) => r.data),

    getPlan: (id: string) =>
        api.get<ApiResponse<Plan>>(`/subscriptions/plans/${id}`).then((r) => r.data),

    getMySubscription: () =>
        api.get<ApiResponse<Subscription>>('/subscriptions/my').then((r) => r.data),

    subscribe: (planId: string) =>
        api.post<ApiResponse<Subscription>>('/subscriptions/subscribe', { planId }).then((r) => r.data),

    cancelSubscription: (reason: string) =>
        api.post<ApiResponse<Subscription>>('/subscriptions/cancel', { reason }).then((r) => r.data),
};
