import prisma from '@/lib/prisma';

export type AuditAction =
  | 'REVIEW_APPROVE'
  | 'REVIEW_REJECT'
  | 'REVIEW_DELETE'
  | 'ENTITY_CREATE'
  | 'ENTITY_UPDATE'
  | 'ENTITY_DELETE'
  | 'USER_BLOCK'
  | 'USER_UNBLOCK'
  | 'FORUM_LOCK'
  | 'FORUM_DELETE'
  | 'REPORT_REVIEW';

interface AuditLogParams {
  action: AuditAction;
  targetType: string;
  targetId: string;
  adminId?: string;
  oldValue?: string | null;
  newValue?: string | null;
  details?: string | null;
}

/**
 * Log an admin action to the AuditLog table.
 * Fire-and-forget — errors are logged but don't block the caller.
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        adminId: params.adminId ?? 'admin',
        oldValue: params.oldValue ?? null,
        newValue: params.newValue ?? null,
        details: params.details ?? null,
      },
    });
  } catch (err) {
    console.error('AuditLog write failed:', err);
  }
}
