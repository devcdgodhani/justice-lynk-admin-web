'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { rolesApi } from '@/services/roles.api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { accessToken, activeOrg, setPermissions, clearAuth, setHydrated } = useAuthStore();

    useEffect(() => {
        setHydrated();
    }, [setHydrated]);

    useEffect(() => {
        if (!accessToken || !activeOrg?.id) return;
        // Load permissions for the active org
        rolesApi
            .listRoles()
            .then(async (rolesRes) => {
                if (!rolesRes.data) return;
                // Collect all permission keys from all roles
                const allKeys: string[] = [];
                for (const role of rolesRes.data) {
                    try {
                        const permRes = await rolesApi.getRolePermissions(role.id);
                        if (permRes.data) {
                            permRes.data.forEach((p) => {
                                if (p.feature?.key && p.action?.key) {
                                    allKeys.push(`${p.feature.key}.${p.action.key}`);
                                } else if (p.featureKey) {
                                    allKeys.push(p.featureKey);
                                }
                            });
                        }
                    } catch {
                        // ignore per-role errors
                    }
                }
                setPermissions(allKeys);
            })
            .catch(() => {
                // permissions may not be available
            });
    }, [accessToken, activeOrg?.id, setPermissions, clearAuth]);

    return <>{children}</>;
}
