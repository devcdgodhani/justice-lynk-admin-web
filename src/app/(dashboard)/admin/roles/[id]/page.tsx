'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import RoleEditor from '@/components/admin/RoleEditor';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

export default function EditRolePage() {
    const { id } = useParams();
    const { user: currentUser } = useAuthStore();

    const { data: roleRes, isLoading } = useQuery({
        queryKey: ['admin-role', id],
        queryFn: () => adminApi.listRoles().then(r => r.data.find((role: any) => role.id === id)),
        enabled: !!id && !!currentUser,
    });

    if (currentUser?.role !== 'super_admin') return null;

    if (isLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
            </div>
        );
    }

    if (!roleRes) {
        return (
            <div className="centered-container py-24 text-center">
                <h1 className="text-2xl font-bold font-display italic">Protocol Not Found</h1>
                <p className="text-muted-foreground mt-2">The requested access definition does not exist in the registry.</p>
            </div>
        );
    }

    return (
        <div className="centered-container py-12 max-w-7xl animate-fade-in">
            <RoleEditor roleId={id as string} initialData={roleRes} isEdit />
        </div>
    );
}
