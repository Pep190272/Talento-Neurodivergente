-- Migration: Create conversations and messages tables for private chat (Despacho 4, #138)
-- Schema: profiles
-- Date: 2026-03-20

BEGIN;

-- Conversations table
CREATE TABLE IF NOT EXISTS profiles.conversations (
    id VARCHAR(25) PRIMARY KEY,
    participant_1_id VARCHAR(25) NOT NULL,
    participant_2_id VARCHAR(25) NOT NULL,
    last_message_preview TEXT NOT NULL DEFAULT '',
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_conversation_participants UNIQUE(participant_1_id, participant_2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1
    ON profiles.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2
    ON profiles.conversations(participant_2_id);

-- Messages table
CREATE TABLE IF NOT EXISTS profiles.messages (
    id VARCHAR(25) PRIMARY KEY,
    conversation_id VARCHAR(25) NOT NULL
        REFERENCES profiles.conversations(id) ON DELETE CASCADE,
    sender_id VARCHAR(25) NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON profiles.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender
    ON profiles.messages(sender_id);

COMMIT;
