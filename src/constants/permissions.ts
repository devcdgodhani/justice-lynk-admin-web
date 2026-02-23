export const PERMISSION_KEYS = {
    // Cases
    CASES_READ: 'cases.read',
    CASES_CREATE: 'cases.create',
    CASES_UPDATE: 'cases.update',
    CASES_DELETE: 'cases.delete',
    CASES_ASSIGN: 'cases.assign',
    // Chat
    CHAT_READ: 'chat.read',
    CHAT_SEND: 'chat.send',
    // Organization
    ORG_VIEW: 'org.view',
    ORG_MANAGE: 'org.manage',
    // Team
    TEAM_VIEW: 'team.view',
    TEAM_INVITE: 'team.invite',
    TEAM_REMOVE: 'team.remove',
    TEAM_UPDATE: 'team.update',
    TEAM_DELETE: 'team.delete',
    TEAM_MANAGE_ROLES: 'team.manage_roles',
    // Roles
    ROLES_VIEW: 'roles.view',
    ROLES_MANAGE: 'roles.manage',
    // Subscription
    SUB_VIEW: 'subscription.view',
    SUB_MANAGE: 'subscription.manage',
    // Billing
    BILLING_VIEW: 'billing.view',
    BILLING_MANAGE: 'billing.manage',
    // Notifications
    NOTIFICATIONS_VIEW: 'notifications.view',
    NOTIFICATIONS_MANAGE: 'notifications.manage',
    // Professionals
    PROFESSIONALS_VIEW: 'professionals.view',
    PROFESSIONALS_MANAGE: 'professionals.manage',
    // Audit
    AUDIT_VIEW: 'audit.view',
    // Admin
    ADMIN_VIEW: 'admin.view',
    ADMIN_MANAGE: 'admin.manage',
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
