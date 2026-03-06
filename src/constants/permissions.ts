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
    USERS_UNSUSPEND: 'users.unsuspend',

    CLIENTS_READ: 'clients.read',

    ACCOUNT_REQUESTS_READ: 'account-requests.read',
    ACCOUNT_REQUESTS_APPROVE: 'account-requests.approve',
    ACCOUNT_REQUESTS_REJECT: 'account-requests.reject',

    // ─── ORGANIZATIONS ─────────────────────────────────────────
    ORGS_READ: 'orgs.read',
    ORGS_CREATE: 'orgs.create',
    ORGS_UPDATE: 'orgs.update',
    ORGS_DELETE: 'orgs.delete',

    // ─── PROFESSIONALS ─────────────────────────────────────────
    PROFS_READ: 'profs.read',
    PROFS_CREATE: 'profs.create',
    PROFS_UPDATE: 'profs.update',
    PROFS_DELETE: 'profs.delete',
    PROFS_VERIFY: 'profs.verify',

    // ─── RBAC ──────────────────────────────────────────────────
    ROLES_VIEW: 'roles.read',
    ROLES_CREATE: 'roles.create',
    ROLES_UPDATE: 'roles.update',
    ROLES_DELETE: 'roles.delete',
    PERMISSIONS_VIEW: 'permissions.read',
    PERMISSIONS_UPDATE: 'permissions.update',

    // ─── SUBSCRIPTIONS ─────────────────────────────────────────
    PLANS_VIEW: 'plans.read',
    PLANS_CREATE: 'plans.create',
    PLANS_UPDATE: 'plans.update',
    PLANS_DELETE: 'plans.delete',

    // ─── SYSTEM SETTINGS & AUDIT ───────────────────────────────
    AUDIT_VIEW: 'audit.logs.read',
    AUDIT_EXPORT: 'audit.logs.export',
    BILLING_ANALYTICS_VIEW: 'billing.analytics.read',
    BILLING_ANALYTICS_EXPORT: 'billing.analytics.export',
    SYSTEM_LOGS_VIEW: 'system.logs.read',
    SETTINGS_VIEW: 'general-settings.read',
    SETTINGS_UPDATE: 'general-settings.update',

    // ─── COMPATIBILITY ALIASES ─────────────────────────────────
    ORG_VIEW: 'orgs.read',
    TEAM_VIEW: 'users.read',
    SUB_VIEW: 'plans.read',
    SUB_MANAGE: 'plans.update',
    BILLING_VIEW: 'billing.analytics.read',
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
