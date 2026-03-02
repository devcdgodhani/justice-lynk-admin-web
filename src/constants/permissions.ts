export const PERMISSION_KEYS = {
    // ─── ADMIN DASHBOARD ───────────────────────────────────────
    ADMIN_VIEW: 'admin.overview.read',
    ADMIN_EXPORT: 'admin.overview.export',

    // ─── USER MANAGEMENT ───────────────────────────────────────
    USERS_READ: 'users.read',
    USERS_CREATE: 'users.create',
    USERS_UPDATE: 'users.update',
    USERS_DELETE: 'users.delete',
    USERS_SUSPEND: 'users.suspend',

    CLIENTS_READ: 'clients.read',

    ACCOUNT_REQUESTS_READ: 'account-requests.read',
    ACCOUNT_REQUESTS_APPROVE: 'account-requests.approve',

    // ─── RBAC ──────────────────────────────────────────────────
    ROLES_VIEW: 'roles.read',
    ROLES_MANAGE: 'roles.manage',
    PERMISSIONS_MANAGE: 'permissions.update',

    // ─── SUBSCRIPTIONS ─────────────────────────────────────────
    PLANS_VIEW: 'plans.read',
    PLANS_MANAGE: 'plans.manage',

    // ─── SYSTEM SETTINGS ───────────────────────────────────────
    SETTINGS_VIEW: 'general-settings.read',
    SETTINGS_UPDATE: 'general-settings.update',

    // ─── COMPATIBILITY ALIASES ─────────────────────────────────
    ORG_VIEW: 'admin.overview.read',
    TEAM_VIEW: 'users.read',
    SUB_VIEW: 'plans.read',
    SUB_MANAGE: 'plans.manage',
    BILLING_VIEW: 'plans.read',
} as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

export const CASE_STATUS_LABELS: Record<string, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
    CLOSED: 'Closed',
    ARCHIVED: 'Archived',
};

export const CASE_TYPE_LABELS: Record<string, string> = {
    CIVIL: 'Civil',
    CRIMINAL: 'Criminal',
    CORPORATE: 'Corporate',
    FAMILY: 'Family',
    PROPERTY: 'Property',
    LABOUR: 'Labour',
    OTHER: 'Other',
};

export const CASE_STATUS_COLORS: Record<string, string> = {
    OPEN: 'badge-active',
    IN_PROGRESS: 'badge-pending',
    PENDING: 'badge-pending',
    CLOSED: 'badge-closed',
    ARCHIVED: 'badge-closed',
};
