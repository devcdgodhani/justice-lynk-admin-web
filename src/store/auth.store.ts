import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization } from '@/types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    activeOrg: Organization | null;
    permissions: string[];
    isHydrated: boolean;
    // Actions
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setActiveOrg: (org: Organization) => void;
    setPermissions: (permissions: string[]) => void;
    updateUser: (partial: Partial<User>) => void;
    clearAuth: () => void;
    setHydrated: () => void;
    // Permission helper
    can: (permissionKey: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            activeOrg: null,
            permissions: [],
            isHydrated: false,

            setAuth: (user, accessToken, refreshToken) => {
                set({ user, accessToken, refreshToken });
                // Set cookie for middleware sync
                if (typeof document !== 'undefined') {
                    document.cookie = `jl-access-token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
                }
            },

            setActiveOrg: (org) => set({ activeOrg: org }),

            setPermissions: (permissions) => set({ permissions }),

            updateUser: (partial) =>
                set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),

            clearAuth: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    activeOrg: null,
                    permissions: [],
                });
                // Clear cookie
                if (typeof document !== 'undefined') {
                    document.cookie = 'jl-access-token=; path=/; max-age=0; SameSite=Strict';
                }
            },

            setHydrated: () => set({ isHydrated: true }),

            can: (permissionKey: string) => {
                return true;
                const { permissions, user } = get();
                if (user?.role === 'super_admin') return true;
                return permissions.includes(permissionKey);
            },
        }),
        {
            name: 'jl-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                activeOrg: state.activeOrg,
                permissions: state.permissions,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);
