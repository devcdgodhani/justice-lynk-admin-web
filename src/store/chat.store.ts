import { create } from 'zustand';
import { ChatMessage } from '@/types';

interface TypingUser {
    userId: string;
    userName: string;
    caseId: string;
}

interface ChatState {
    messages: Record<string, ChatMessage[]>; // keyed by caseId
    typingUsers: TypingUser[];
    onlineUsers: string[]; // array of userIds
    connected: boolean;
    activeCaseId: string | null;
    // Actions
    setConnected: (connected: boolean) => void;
    setOnlineUsers: (userIds: string[]) => void;
    addUserOnline: (userId: string) => void;
    removeUserOffline: (userId: string) => void;
    setActiveCaseId: (caseId: string | null) => void;
    setMessages: (caseId: string, messages: ChatMessage[]) => void;
    addMessage: (caseId: string, message: ChatMessage) => void;
    updateMessage: (caseId: string, messageId: string, updates: Partial<ChatMessage>) => void;
    deleteMessage: (caseId: string, messageId: string) => void;
    addTypingUser: (typing: TypingUser) => void;
    removeTypingUser: (userId: string, caseId: string) => void;
    clearMessages: (caseId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: {},
    typingUsers: [],
    onlineUsers: [],
    connected: false,
    activeCaseId: null,

    setConnected: (connected) => set({ connected }),
    setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),
    addUserOnline: (userId) => set((s) => ({
        onlineUsers: [...new Set([...s.onlineUsers, userId])]
    })),
    removeUserOffline: (userId) => set((s) => ({
        onlineUsers: s.onlineUsers.filter(id => id !== userId)
    })),
    setActiveCaseId: (caseId) => set({ activeCaseId: caseId }),

    setMessages: (caseId, messages) =>
        set((s) => ({ messages: { ...s.messages, [caseId]: messages } })),

    addMessage: (caseId, message) =>
        set((s) => ({
            messages: {
                ...s.messages,
                [caseId]: [...(s.messages[caseId] || []), message],
            },
        })),

    updateMessage: (caseId, messageId, updates) =>
        set((s) => ({
            messages: {
                ...s.messages,
                [caseId]: (s.messages[caseId] || []).map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m
                ),
            },
        })),

    deleteMessage: (caseId, messageId) =>
        set((s) => ({
            messages: {
                ...s.messages,
                [caseId]: (s.messages[caseId] || []).filter((m) => m.id !== messageId),
            },
        })),

    addTypingUser: (typing) =>
        set((s) => ({
            typingUsers: [
                ...s.typingUsers.filter(
                    (t) => !(t.userId === typing.userId && t.caseId === typing.caseId)
                ),
                typing,
            ],
        })),

    removeTypingUser: (userId, caseId) =>
        set((s) => ({
            typingUsers: s.typingUsers.filter(
                (t) => !(t.userId === userId && t.caseId === caseId)
            ),
        })),

    clearMessages: (caseId) =>
        set((s) => {
            const next = { ...s.messages };
            delete next[caseId];
            return { messages: next };
        }),
}));
