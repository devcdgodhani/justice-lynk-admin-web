import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    upgradeModalOpen: boolean;
    loadingKeys: Set<string>;
    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebarCollapsed: () => void;
    openUpgradeModal: () => void;
    closeUpgradeModal: () => void;
    setLoading: (key: string, loading: boolean) => void;
    isLoading: (key: string) => boolean;
}

export const useUIStore = create<UIState>((set, get) => ({
    sidebarOpen: true,
    sidebarCollapsed: false,
    upgradeModalOpen: false,
    loadingKeys: new Set(),

    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebarCollapsed: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    openUpgradeModal: () => set({ upgradeModalOpen: true }),
    closeUpgradeModal: () => set({ upgradeModalOpen: false }),

    setLoading: (key, loading) => {
        set((s) => {
            const next = new Set(s.loadingKeys);
            loading ? next.add(key) : next.delete(key);
            return { loadingKeys: next };
        });
    },
    isLoading: (key) => get().loadingKeys.has(key),
}));
