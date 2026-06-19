-- Add 'workshop' as a third campaign type alongside 'competition' and 'activity'.
-- Postgres enums grow with ALTER TYPE ... ADD VALUE; idempotent via IF NOT EXISTS.

alter type cw_campaign_type add value if not exists 'workshop';
