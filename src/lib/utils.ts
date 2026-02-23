import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        ...options,
    });
}

export function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export function formatCurrency(amount: number, currency = 'INR'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency, maximumFractionDigits: 0,
    }).format(amount);
}

export function getInitials(firstName: string, lastName?: string): string {
    return `${firstName.charAt(0)}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

export function truncate(str: string, length: number): string {
    return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
        const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
        return axiosErr.response?.data?.message ?? axiosErr.message ?? 'An unexpected error occurred';
    }
    return 'An unexpected error occurred';
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
