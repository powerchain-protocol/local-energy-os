export type AuditEvent = { action: string; actorId: string; organizationId: string; resource: string; resourceId?: string; metadata?: Record<string, unknown>; timestamp?: string };
const memoryAudit: AuditEvent[] = [];
export async function writeAudit(event: AuditEvent) { const entry={...event,timestamp:event.timestamp ?? new Date().toISOString()}; memoryAudit.unshift(entry); return entry; }
export async function listAudit(limit=50) { return memoryAudit.slice(0,limit); }
