'use client';

import RoleEditor from '@/components/admin/RoleEditor';
import { useAuthStore } from '@/store/auth.store';

export default function NewRolePage() {
    const { user: currentUser } = useAuthStore();

    if (currentUser?.role !== 'super_admin') return null;

    return (
        <div className="centered-container py-12 max-w-7xl animate-fade-in">
            <RoleEditor />
        </div>
    );
}
