
-- ══════════════════════════════════════════════════════════════════════════════
-- ORACLE Credit Intelligence Schema
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Credit Applications ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_applications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id          UUID NOT NULL,
  brand_id              UUID,
  status                TEXT NOT NULL DEFAULT 'pending',

  -- Application data
  stated_income         NUMERIC(12,2),
  stated_expenses       NUMERIC(12,2),
  loan_amount           NUMERIC(12,2),
  loan_purpose          TEXT,
  employment_type       TEXT,
  employment_months     INTEGER,
  application_text      TEXT,

  -- Raw features (512-dim, stored for audit + retraining)
  feature_vector        FLOAT4[],

  -- Bureau snapshot fields
  fico_score            INTEGER,
  total_accounts        INTEGER,
  revolving_utilization NUMERIC(5,4),
  missed_payments_12m   INTEGER DEFAULT 0,
  missed_payments_24m   INTEGER DEFAULT 0,
  derogatory_marks      INTEGER DEFAULT 0,
  inquiries_6m          INTEGER DEFAULT 0,
  oldest_account_months INTEGER,
  avg_account_age_months NUMERIC(6,1),
  total_credit_limit    NUMERIC(12,2),
  total_balance         NUMERIC(12,2),
  income_verified       BOOLEAN DEFAULT FALSE,
  loan_amount_requested NUMERIC(12,2),
  transactions          JSONB,

  -- Metadata
  ip_address            INET,
  user_agent            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE credit_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applicants_own_applications"
  ON credit_applications FOR ALL
  USING (auth.uid() = applicant_id);

CREATE POLICY "service_role_write_applications"
  ON credit_applications FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ── Credit Scores (ORACLE output) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_scores (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id        UUID NOT NULL REFERENCES credit_applications(id) ON DELETE CASCADE,
  applicant_id          UUID NOT NULL,
  brand_id              UUID,

  -- Core ORACLE output
  score                 INTEGER NOT NULL,
  probability           NUMERIC(6,4) NOT NULL,
  confidence_low        INTEGER,
  confidence_high       INTEGER,
  risk_type             TEXT NOT NULL DEFAULT 'structural',
  risk_severity         TEXT NOT NULL DEFAULT 'medium',
  fair                  BOOLEAN NOT NULL DEFAULT TRUE,

  -- Causal intelligence (JSONB)
  causal_factors        JSONB,
  counterfactuals       JSONB,
  trajectory            JSONB,
  adverse_action_reasons JSONB,

  -- LLM explanation
  explanation           TEXT,
  explanation_status    TEXT DEFAULT 'pending',
  improvement_plan      TEXT,

  -- Decision
  decision              TEXT,
  decision_reason       TEXT,
  decision_at           TIMESTAMPTZ,
  decision_by           UUID,

  -- Metadata
  model_version         TEXT NOT NULL DEFAULT 'oracle-v1.0.0',
  inference_ms          INTEGER,
  scored_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Realtime for instant frontend delivery
ALTER TABLE credit_scores REPLICA IDENTITY FULL;

ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applicants_own_scores"
  ON credit_scores FOR SELECT
  USING (auth.uid() = applicant_id);

CREATE POLICY "service_role_write_scores"
  ON credit_scores FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Add to Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE credit_scores;

-- ── Prediction Audit Log (immutable) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS prediction_audit_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_id              UUID NOT NULL REFERENCES credit_scores(id),
  application_id        UUID NOT NULL,
  applicant_id          UUID NOT NULL,
  score                 INTEGER NOT NULL,
  probability           NUMERIC(6,4) NOT NULL,
  model_version         TEXT,
  feature_snapshot      FLOAT4[],
  causal_factors        JSONB,
  adverse_reasons       JSONB,
  fair                  BOOLEAN,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE prediction_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_write_audit"
  ON prediction_audit_log FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "admins_read_audit"
  ON prediction_audit_log FOR SELECT
  USING (TRUE);

-- ── Macro Context Cache ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS macro_context (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fed_funds_rate        NUMERIC(5,3),
  cpi_yoy               NUMERIC(5,3),
  unemployment_rate     NUMERIC(5,3),
  consumer_sentiment    NUMERIC(7,3),
  sp500_30d_return      NUMERIC(7,3),
  credit_card_delinquency_rate NUMERIC(5,3),
  valid_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at            TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

ALTER TABLE macro_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_macro"
  ON macro_context FOR SELECT
  TO authenticated
  USING (TRUE);

-- ── Model Registry ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS model_registry (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version               TEXT NOT NULL UNIQUE,
  auc_roc               NUMERIC(6,4),
  ks_stat               NUMERIC(6,4),
  brier_score           NUMERIC(6,4),
  ece                   NUMERIC(6,4),
  equal_opp_diff        NUMERIC(6,4),
  n_train               INTEGER,
  n_test                INTEGER,
  deployed_at           TIMESTAMPTZ,
  retired_at            TIMESTAMPTZ,
  is_active             BOOLEAN DEFAULT FALSE,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE model_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_models"
  ON model_registry FOR SELECT
  TO authenticated
  USING (TRUE);

-- ── Fairness Metrics ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fairness_metrics (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version         TEXT NOT NULL,
  brand_id              UUID,
  metric_date           DATE NOT NULL,
  n_scored              INTEGER,
  approval_rate         NUMERIC(6,4),
  disparate_impact      NUMERIC(6,4),
  equal_opp_diff        NUMERIC(6,4),
  passes_80pct_rule     BOOLEAN,
  cfpb_threshold_met    BOOLEAN,
  computed_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fairness_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_fairness"
  ON fairness_metrics FOR SELECT
  TO authenticated
  USING (TRUE);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX idx_credit_scores_applicant ON credit_scores(applicant_id);
CREATE INDEX idx_credit_scores_application ON credit_scores(application_id);
CREATE INDEX idx_credit_scores_created ON credit_scores(created_at DESC);
CREATE INDEX idx_applications_applicant ON credit_applications(applicant_id);
CREATE INDEX idx_applications_status ON credit_applications(status);
CREATE INDEX idx_audit_application ON prediction_audit_log(application_id);

-- ── Auto-update triggers ───────────────────────────────────────────────────
CREATE TRIGGER trg_credit_scores_updated_at
  BEFORE UPDATE ON credit_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON credit_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Auto-create audit log on score insert ──────────────────────────────────
CREATE OR REPLACE FUNCTION create_oracle_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO prediction_audit_log (
    score_id, application_id, applicant_id, score, probability,
    model_version, causal_factors, adverse_reasons, fair, created_at
  ) VALUES (
    NEW.id, NEW.application_id, NEW.applicant_id, NEW.score, NEW.probability,
    NEW.model_version, NEW.causal_factors, NEW.adverse_action_reasons, NEW.fair, NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER trg_audit_on_score
  AFTER INSERT ON credit_scores
  FOR EACH ROW EXECUTE FUNCTION create_oracle_audit_log();
