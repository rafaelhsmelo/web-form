/*
# Create quiz_responses table

## Overview
This migration creates the core data table for the Atelier de Interiores quiz application.
It stores each visitor's identification info (name, unit) along with their answers
to the interior design questionnaire, and a timestamp of submission.

## New Tables

### quiz_responses
- `id` (uuid, primary key) — auto-generated unique identifier for each response
- `nome` (text, not null) — the visitor's name as entered in the identification step
- `unidade` (text, not null) — the selected housing unit (e.g. "Casa 01" through "Casa 08")
- `respostas` (jsonb, not null) — JSON object mapping question IDs to selected option values
  (e.g. {"estilo": "minimalista", "paleta": "neutros", "ambiente": "sala", "prioridade": "conforto"})
- `created_at` (timestamptz, default now()) — when the response was submitted

## Security
- Row Level Security is ENABLED on quiz_responses.
- This is a single-tenant, no-auth application — visitors do not sign in.
- All four CRUD policies use `TO anon, authenticated` so the anon-key frontend client
  can insert new quiz responses and the admin can read all of them.
- `USING (true)` / `WITH CHECK (true)` is acceptable here because the data is
  intentionally public/shared (no user accounts, no private data isolation needed).

## Indexes
- `idx_quiz_responses_unidade` — index on `unidade` for fast filtering by unit in the admin dashboard
- `idx_quiz_responses_created_at` — index on `created_at` for chronological sorting

## Notes
1. No user_id column or auth.users foreign key — the app has no sign-in flow.
2. The `respostas` column uses jsonb for flexible question/answer storage.
3. The admin area reads all rows; the quiz form inserts one row per submission.
*/
CREATE TABLE IF NOT EXISTS quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  unidade text NOT NULL,
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quiz_responses" ON quiz_responses;
CREATE POLICY "anon_select_quiz_responses"
  ON quiz_responses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quiz_responses" ON quiz_responses;
CREATE POLICY "anon_insert_quiz_responses"
  ON quiz_responses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quiz_responses" ON quiz_responses;
CREATE POLICY "anon_update_quiz_responses"
  ON quiz_responses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quiz_responses" ON quiz_responses;
CREATE POLICY "anon_delete_quiz_responses"
  ON quiz_responses FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_unidade ON quiz_responses (unidade);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_created_at ON quiz_responses (created_at DESC);
