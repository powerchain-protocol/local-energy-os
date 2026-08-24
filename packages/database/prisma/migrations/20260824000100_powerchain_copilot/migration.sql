CREATE TYPE "CopilotActionState" AS ENUM (
  'DRAFT',
  'REVIEW_REQUIRED',
  'APPROVED',
  'AWAITING_WALLET',
  'SIGNED_EXTERNALLY',
  'RECORDED',
  'REJECTED'
);

CREATE TYPE "CopilotActionRisk" AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');

CREATE TABLE "copilot_actions" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "created_by_user_id" TEXT NOT NULL,
  "created_by_agent" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "state" "CopilotActionState" NOT NULL,
  "risk" "CopilotActionRisk" NOT NULL,
  "required_permission" TEXT NOT NULL,
  "requires_wallet_signature" BOOLEAN NOT NULL DEFAULT FALSE,
  "contexts" JSONB NOT NULL,
  "human_approved_at" TIMESTAMP(3),
  "human_approved_by" TEXT,
  "rejected_by" TEXT,
  "wallet_signature_reference" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "copilot_actions_org_state_updated_idx"
  ON "copilot_actions"("organization_id","state","updated_at");

CREATE INDEX "copilot_actions_user_updated_idx"
  ON "copilot_actions"("created_by_user_id","updated_at");
