/**
 * 🔐 SECURITY: Audit logging utility
 * Tracks all important actions for compliance and security monitoring
 * Logs are stored in Supabase audit_logs table
 */

import { supabase } from '@/integrations/supabase/client';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_ASSET'
  | 'UPDATE_ASSET'
  | 'DELETE_ASSET'
  | 'VIEW_ASSET'
  | 'CREATE_LICENSE'
  | 'UPDATE_LICENSE'
  | 'DELETE_LICENSE'
  | 'CREATE_MAINTENANCE'
  | 'UPDATE_MAINTENANCE'
  | 'DELETE_MAINTENANCE'
  | 'EXPORT_DATA'
  | 'IMPORT_DATA'
  | 'USER_REGISTRATION'
  | 'ROLE_CHANGE'
  | 'APPROVAL_STATUS_CHANGE'
  | 'FAILED_LOGIN_ATTEMPT'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'BULK_OPERATION';

export interface AuditLogEntry {
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  userId?: string;
  changes?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log audit event to Supabase
 * Note: This requires audit_logs table to be created in Supabase
 */
export const logAudit = async (entry: AuditLogEntry) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Get client IP (requires backend support)
    const ipAddress = await getClientIp();

    const auditLog = {
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      user_id: user?.id,
      changes: entry.changes || null,
      success: entry.success,
      error_message: entry.errorMessage || null,
      metadata: {
        ...entry.metadata,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      ip_address: ipAddress,
    };

    // Silently log (don't show errors to user)
    const { error } = await supabase
      .from('audit_logs')
      .insert([auditLog]);

    if (error && import.meta.env.DEV) {
      console.error('[Audit Log Error]', error);
    }
  } catch (error) {
    // Fail silently - audit logging should not break the app
    if (import.meta.env.DEV) {
      console.error('[Audit Log Exception]', error);
    }
  }
};

/**
 * Log successful action
 */
export const logSuccess = async (
  action: AuditAction,
  resourceType: string,
  resourceId?: string,
  changes?: Record<string, unknown>
) => {
  await logAudit({
    action,
    resourceType,
    resourceId,
    changes,
    success: true,
  });
};

/**
 * Log failed action
 */
export const logFailure = async (
  action: AuditAction,
  resourceType: string,
  error: Error,
  resourceId?: string
) => {
  await logAudit({
    action,
    resourceType,
    resourceId,
    success: false,
    errorMessage: error.message,
  });
};

/**
 * Log security-critical events
 */
export const logSecurityEvent = async (
  action: AuditAction,
  details: Record<string, unknown>
) => {
  await logAudit({
    action,
    resourceType: 'SECURITY',
    success: false,
    metadata: details,
  });
};

/**
 * Get client IP address
 * Note: This is a best-effort approach. Requires backend support for accurate IP.
 */
const getClientIp = async (): Promise<string | null> => {
  try {
    // Try to get IP from CloudFlare (if behind CloudFlare)
    const cfIp = (window as Window & { CF_CONNECTING_IP?: string }).CF_CONNECTING_IP;
    if (cfIp) return cfIp;

    // Try to get from backend endpoint (if available)
    try {
      const response = await fetch('/api/client-ip');
      const data = await response.json();
      return data.ip || null;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
};

/**
 * Analyze audit logs for suspicious activity
 */
export const detectSuspiciousActivity = (logs: AuditLogEntry[]): boolean => {
  const recentLogs = logs.filter(
    log => new Date(log.metadata?.timestamp || 0).getTime() > Date.now() - 15 * 60 * 1000 // Last 15 min
  );

  // Too many failed login attempts
  const failedLogins = recentLogs.filter(
    log => log.action === 'FAILED_LOGIN_ATTEMPT'
  ).length;
  if (failedLogins > 5) {
    return true;
  }

  // Unauthorized access attempts
  const unauthorizedAttempts = recentLogs.filter(
    log => log.action === 'UNAUTHORIZED_ACCESS_ATTEMPT'
  ).length;
  if (unauthorizedAttempts > 3) {
    return true;
  }

  // Unusual bulk operations
  const bulkOps = recentLogs.filter(
    log => log.action === 'BULK_OPERATION'
  ).length;
  if (bulkOps > 10) {
    return true;
  }

  // Multiple deletes in short time
  const deletes = recentLogs.filter(
    log => log.action.includes('DELETE')
  ).length;
  if (deletes > 20) {
    return true;
  }

  return false;
};

/**
 * Create audit trail for data changes
 */
export const createChangeAuditTrail = (
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, unknown> => {
  const changes: Record<string, unknown> = {};

  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes[key] = {
        before: oldData[key],
        after: newData[key],
      };
    }
  }

  return changes;
};
