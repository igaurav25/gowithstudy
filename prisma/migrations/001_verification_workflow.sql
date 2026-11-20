-- ==============================================================================
-- GoWithStudy: Verification Workflow, Admin Security & Partial Unique Indexes
-- File: prisma/migrations/001_verification_workflow.sql
-- ==============================================================================

-- 1. Ensure Partial Unique Index: Exactly one SUPER_ADMIN in the entire system
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_single_super_admin
ON "User" (role)
WHERE role = 'SUPER_ADMIN';

-- 2. Partial Unique Index: Only one PENDING application per canonical email address
CREATE UNIQUE INDEX IF NOT EXISTS idx_application_unique_pending_email
ON "Application" ("emailCanonical")
WHERE status = 'PENDING';

-- 3. Partial Unique Index: Only one PENDING application per normalized E.164 phone number
CREATE UNIQUE INDEX IF NOT EXISTS idx_application_unique_pending_phone
ON "Application" ("phoneE164")
WHERE status = 'PENDING';

-- 4. Partial Unique Index: Prevent duplicate student roll number per college across PENDING/APPROVED
CREATE UNIQUE INDEX IF NOT EXISTS idx_application_unique_roll_number
ON "Application" (college, "rollNumberNorm")
WHERE status IN ('PENDING', 'APPROVED') 
  AND type = 'STUDENT' 
  AND "rollNumberNorm" IS NOT NULL;

-- 5. Append-only Immutability Trigger for AuditLog
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog records are strictly append-only and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON "AuditLog";
CREATE TRIGGER trg_audit_log_immutable
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();
