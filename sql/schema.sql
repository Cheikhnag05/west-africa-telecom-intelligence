-- ============================================================
-- West Africa Telecom Intelligence — PostgreSQL Schema
-- 3 pays · 9 opérateurs · 2022-2026
-- ============================================================

CREATE SCHEMA IF NOT EXISTS telecom;

-- ── Table principale : KPIs mensuels par opérateur ───────────────────────────
CREATE TABLE IF NOT EXISTS telecom.monthly_kpis (
    id                          SERIAL PRIMARY KEY,
    year                        SMALLINT NOT NULL,
    month                       SMALLINT NOT NULL,
    date                        DATE NOT NULL,
    country                     VARCHAR(50) NOT NULL,
    country_code                CHAR(2) NOT NULL,
    operator                    VARCHAR(60) NOT NULL,
    operator_rank               SMALLINT,
    market_share_pct            NUMERIC(5,2),
    total_subscribers           INTEGER,
    new_subscribers             INTEGER,
    churned_subscribers         INTEGER,
    net_adds                    INTEGER,
    churn_rate_pct              NUMERIC(5,3),
    arpu_usd                    NUMERIC(6,2),
    revenue_musd                NUMERIC(8,3),
    data_usage_gb               NUMERIC(6,2),
    coverage_4g_pct             NUMERIC(5,1),
    mobile_money_penetration_pct NUMERIC(5,1),
    population                  INTEGER,
    penetration_rate_pct        NUMERIC(5,2),
    created_at                  TIMESTAMP DEFAULT NOW()
);

-- ── Indicateurs annuels par pays ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS telecom.country_annual (
    id                          SERIAL PRIMARY KEY,
    year                        SMALLINT NOT NULL,
    country                     VARCHAR(50) NOT NULL,
    country_code                CHAR(2) NOT NULL,
    capital                     VARCHAR(50),
    regulateur                  VARCHAR(20),
    population                  INTEGER,
    total_subscribers           INTEGER,
    penetration_rate_pct        NUMERIC(5,2),
    coverage_4g_pct             NUMERIC(5,1),
    mobile_money_penetration_pct NUMERIC(5,1),
    total_revenue_musd          NUMERIC(8,1),
    gdp_per_capita_usd          NUMERIC(8,0),
    num_operators               SMALLINT
);

-- ── Profils opérateurs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS telecom.operator_profiles (
    id                  SERIAL PRIMARY KEY,
    country             VARCHAR(50),
    country_code        CHAR(2),
    operator            VARCHAR(60),
    parent_company      VARCHAR(60),
    hq                  VARCHAR(60),
    founded             SMALLINT,
    technology          VARCHAR(30),
    mobile_money_brand  VARCHAR(30)
);

-- ── Couverture régionale ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS telecom.regional_coverage (
    id              SERIAL PRIMARY KEY,
    year            SMALLINT,
    country         VARCHAR(50),
    country_code    CHAR(2),
    region          VARCHAR(60),
    latitude        NUMERIC(8,4),
    longitude       NUMERIC(8,4),
    coverage_4g_pct NUMERIC(5,1),
    coverage_2g_pct NUMERIC(5,1)
);

-- ── Index pour les requêtes fréquentes ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_monthly_country ON telecom.monthly_kpis(country);
CREATE INDEX IF NOT EXISTS idx_monthly_operator ON telecom.monthly_kpis(operator);
CREATE INDEX IF NOT EXISTS idx_monthly_date ON telecom.monthly_kpis(date);
CREATE INDEX IF NOT EXISTS idx_monthly_year ON telecom.monthly_kpis(year);
CREATE INDEX IF NOT EXISTS idx_annual_country ON telecom.country_annual(country);
CREATE INDEX IF NOT EXISTS idx_geo_country ON telecom.regional_coverage(country);
