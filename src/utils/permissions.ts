import type { User, UserRole } from '../types/auth'

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    'clients.view',
    'clients.create',
    'clients.update',
    'clients.delete',
    'compliance.view',
    'compliance.update',
    'documents.view',
    'documents.upload',
    'documents.review',
    'tasks.view',
    'tasks.create',
    'tasks.assign',
    'tasks.complete',
    'invoices.create',
    'payments.record',
    'settings.manage',
    'audit_logs.view',
    'users.manage',
    'dashboard.workload_view',
  ],
  CA_MANAGER: [
    'clients.view',
    'clients.create',
    'clients.update',
    'compliance.view',
    'compliance.update',
    'documents.view',
    'documents.upload',
    'documents.review',
    'tasks.view',
    'tasks.create',
    'tasks.assign',
    'tasks.complete',
    'invoices.create',
    'payments.record',
    'audit_logs.view',
    'dashboard.workload_view',
  ],
  STAFF: [
    'clients.view',
    'compliance.view',
    'compliance.update',
    'documents.view',
    'documents.upload',
    'tasks.view',
    'tasks.create',
    'tasks.complete',
  ],
}

export function userHasPermission(user: User | null | undefined, permission: string): boolean {
  if (!user || !user.is_active) return false
  if (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions.includes(permission)
  }
  const rolePerms = ROLE_PERMISSIONS[user.role] || []
  return rolePerms.includes(permission)
}
