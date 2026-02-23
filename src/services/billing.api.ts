import api from './api';
import { Payment, RazorpayOrder, ApiResponse, PaginatedResponse } from '@/types';

export const billingApi = {
    createOrder: (planId: string) =>
        api.post<ApiResponse<RazorpayOrder>>('/payments/orders', { planId }).then((r) => r.data),

    verifyPayment: (data: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }) =>
        api.post<ApiResponse<{ subscription: unknown }>>('/payments/verify', data).then((r) => r.data),

    getPaymentHistory: (page = 1, limit = 20) =>
        api.get<ApiResponse<PaginatedResponse<Payment>>>('/payments/history', { params: { page, limit } }).then((r) => r.data),
};
