-- Add new MessengerType values
ALTER TYPE "MessengerType" ADD VALUE IF NOT EXISTS 'INSTAGRAM';
ALTER TYPE "MessengerType" ADD VALUE IF NOT EXISTS 'VIBER';

-- Add AI provider fields to BotSettings
ALTER TABLE "BotSettings"
  ADD COLUMN IF NOT EXISTS "aiProvider"      TEXT NOT NULL DEFAULT 'openai',
  ADD COLUMN IF NOT EXISTS "aiModel"         TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  ADD COLUMN IF NOT EXISTS "aiApiKey"        TEXT,
  ADD COLUMN IF NOT EXISTS "businessHours"   JSONB,
  ADD COLUMN IF NOT EXISTS "autoReplies"     JSONB,
  ADD COLUMN IF NOT EXISTS "outsideHoursMsg" TEXT,
  ADD COLUMN IF NOT EXISTS "enableEmoji"     BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "orderConfirmTpl" TEXT;
