ALTER TABLE "Message" RENAME COLUMN "content" TO "parts";--> statement-breakpoint
ALTER TABLE "Message" ADD COLUMN "attachments" json NOT NULL;--> statement-breakpoint
ALTER TABLE "Chat" DROP COLUMN IF EXISTS "visibility";