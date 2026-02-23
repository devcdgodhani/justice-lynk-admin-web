import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

let socket: Socket | null = null;
let currentOrgId: string | null = null;

export function getSocket(): Socket {
    const { accessToken, activeOrg } = useAuthStore.getState();
    const orgId = activeOrg?.id ?? null;

    // Reconnect if organization changed or socket not initialized
    if (socket?.connected && currentOrgId === orgId) return socket;

    if (socket) {
        socket.disconnect();
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3000';

    // Append /chat namespace as required by backend ChatGateway
    const NAMESPACE_URL = `${SOCKET_URL}/chat`;

    socket = io(NAMESPACE_URL, {
        auth: { token: accessToken },
        query: {
            token: accessToken,
            orgId: orgId
        },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
    });

    socket.on('connect', () => {
        console.log('🚀 [Socket] Connected to namespace: /chat');
    });

    socket.on('connect_error', (error) => {
        console.error('❌ [Socket] Connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
        console.warn('🔌 [Socket] Disconnected:', reason);
    });

    currentOrgId = orgId;
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export const SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    AUTHENTICATED: 'authenticated',
    UNAUTHORIZED: 'unauthorized',

    // Room management
    JOIN_ROOM: 'room.join',
    LEAVE_ROOM: 'room.leave',
    ROOM_JOINED: 'room.joined',
    ROOM_LEFT: 'room.left',

    // Chat
    SEND_MESSAGE: 'send_message',
    NEW_MESSAGE: 'new_message',
    MESSAGE_READ: 'message.read',
    MESSAGE_DELETED: 'message.deleted',

    // Typing indicators
    TYPING: 'typing',
    STOP_TYPING: 'stop_typing',
    USER_TYPING: 'user_typing',
    USER_STOP_TYPING: 'user_stop_typing',

    // Presence
    USER_ONLINE: 'user_online',
    USER_OFFLINE: 'user_offline',

    // Notifications
    NOTIFICATION_NEW: 'notification.new',
    NOTIFICATION_READ: 'notification.read',

    // Cases
    CASE_CREATED: 'case.created',
    CASE_UPDATED: 'case.updated',
    CASE_STATUS_CHANGED: 'case.status_changed',

    // Errors
    ERROR: 'error',
} as const;
