CREATE TYPE "MembershipRole" AS ENUM ('CONSUMER','PROSUMER','CLIENT','COMPANY','ADMIN','SUPER_ADMIN');
CREATE TYPE "ChatRole" AS ENUM ('USER','ASSISTANT','SYSTEM');
CREATE TABLE "users" ("id" UUID PRIMARY KEY,"email" TEXT NOT NULL UNIQUE,"display_name" TEXT NOT NULL,"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE "memberships" ("id" UUID PRIMARY KEY,"user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,"role" "MembershipRole" NOT NULL DEFAULT 'CONSUMER',"tier_id" TEXT NOT NULL DEFAULT 'starter',"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),UNIQUE("user_id","organization_id"));
CREATE INDEX "memberships_organization_id_role_idx" ON "memberships"("organization_id","role");
CREATE TABLE "ai_chats" ("id" UUID PRIMARY KEY,"user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"title" TEXT NOT NULL,"model_id" TEXT NOT NULL,"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX "ai_chats_user_id_updated_at_idx" ON "ai_chats"("user_id","updated_at" DESC);
CREATE TABLE "ai_messages" ("id" UUID PRIMARY KEY,"chat_id" UUID NOT NULL REFERENCES "ai_chats"("id") ON DELETE CASCADE,"user_id" UUID NOT NULL,"role" "ChatRole" NOT NULL,"content" TEXT NOT NULL,"metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,"created_at" TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX "ai_messages_chat_id_created_at_idx" ON "ai_messages"("chat_id","created_at");
