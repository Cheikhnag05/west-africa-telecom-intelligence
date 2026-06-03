"""
api/main.py — West Africa Telecom Market Intelligence API
FastAPI REST API servant les données télécom 2022-2026
Sénégal · Côte d'Ivoire · Mali
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os, json
from typing import Optional

BASE_DIR = os.path.join(os.path.dirname(__file__), "..")
DATA_DIR = os.path.join(BASE_DIR, "data", "raw")

app = FastAPI(
    title="West Africa Telecom Intelligence API",
    description="Market intelligence dashboard — Sénégal, Côte d'Ivoire, Mali · 2022-2026",
    version="1.0.0",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Load data ─────────────────────────────────────────────────────────────────
_monthly = _annual = _ops = _geo = _stats = None

def load_data():
    global _monthly, _annual, _ops, _geo, _stats
    try:
        _monthly = pd.read_parquet(os.path.join(DATA_DIR, "monthly_kpis.parquet"))
        _annual  = pd.read_parquet(os.path.join(DATA_DIR, "country_annual.parquet"))
        _ops     = pd.read_parquet(os.path.join(DATA_DIR, "operator_profiles.parquet"))
        _geo     = pd.read_parquet(os.path.join(DATA_DIR, "regional_coverage.parquet"))
        with open(os.path.join(DATA_DIR, "dataset_stats.json")) as f:
            _stats = json.load(f)
        print(f"✅ Data loaded: {len(_monthly):,} monthly records")
    except Exception as e:
        print(f"⚠️  Data not found — run: python src/generate_data.py ({e})")

load_data()

# ── Helpers ───────────────────────────────────────────────────────────────────
def df_to_records(df):
    return df.where(pd.notnull(df), None).to_dict("records")


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "West Africa Telecom Intelligence API", "docs": "/docs", "version": "1.0.0"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "data_loaded": _monthly is not None,
        "monthly_records": len(_monthly) if _monthly is not None else 0,
        "countries": ["Sénégal", "Côte d'Ivoire", "Mali"],
        "period": "2022-2026",
    }


@app.get("/stats")
def get_stats():
    if _stats:
        return _stats
    return {"period": "2022-2026", "countries": 3, "operators": 9}


@app.get("/overview")
def get_overview(year: int = Query(2026)):
    """KPIs globaux pour une année donnée."""
    if _annual is None:
        return {}
    df = _annual[_annual["year"] == year]
    return {
        "year": year,
        "total_subscribers": int(df["total_subscribers"].sum()),
        "total_revenue_musd": round(float(df["total_revenue_musd"].sum()), 1),
        "avg_penetration_pct": round(float(df["penetration_rate_pct"].mean()), 2),
        "avg_4g_coverage_pct": round(float(df["coverage_4g_pct"].mean()), 1),
        "avg_mobile_money_pct": round(float(df["mobile_money_penetration_pct"].mean()), 1),
        "by_country": df_to_records(df),
    }


@app.get("/penetration")
def get_penetration(country: Optional[str] = None):
    """Taux de pénétration mobile 2022-2026."""
    if _annual is None:
        return []
    df = _annual.copy()
    if country:
        df = df[df["country"].str.lower().str.contains(country.lower())]
    cols = ["year", "country", "country_code", "penetration_rate_pct",
            "total_subscribers", "population", "coverage_4g_pct"]
    return df_to_records(df[cols].sort_values(["country", "year"]))


@app.get("/arpu")
def get_arpu(country: Optional[str] = None, year: Optional[int] = None):
    """ARPU mensuel par opérateur."""
    if _monthly is None:
        return []
    df = _monthly.copy()
    if country:
        df = df[df["country"].str.lower().str.contains(country.lower())]
    if year:
        df = df[df["year"] == year]
    agg = df.groupby(["year", "country", "operator"]).agg(
        arpu_usd=("arpu_usd", "mean"),
        revenue_musd=("revenue_musd", "sum"),
        total_subscribers=("total_subscribers", "mean"),
    ).round(2).reset_index()
    return df_to_records(agg.sort_values(["country", "year", "operator"]))


@app.get("/churn")
def get_churn(country: Optional[str] = None):
    """Taux de churn mensuel par opérateur."""
    if _monthly is None:
        return []
    df = _monthly.copy()
    if country:
        df = df[df["country"].str.lower().str.contains(country.lower())]
    agg = df.groupby(["year", "month", "country", "operator"]).agg(
        churn_rate_pct=("churn_rate_pct", "mean"),
        churned_subscribers=("churned_subscribers", "sum"),
        new_subscribers=("new_subscribers", "sum"),
        net_adds=("net_adds", "sum"),
    ).round(3).reset_index()
    return df_to_records(agg.sort_values(["country", "year", "month"]))


@app.get("/market-share")
def get_market_share(year: int = Query(2026), country: Optional[str] = None):
    """Parts de marché par opérateur."""
    if _monthly is None:
        return []
    df = _monthly[_monthly["year"] == year].copy()
    if country:
        df = df[df["country"].str.lower().str.contains(country.lower())]
    agg = df.groupby(["country", "operator"]).agg(
        market_share_pct=("market_share_pct", "mean"),
        total_subscribers=("total_subscribers", "mean"),
        arpu_usd=("arpu_usd", "mean"),
    ).round(2).reset_index()
    return df_to_records(agg.sort_values(["country", "market_share_pct"], ascending=[True, False]))


@app.get("/geo")
def get_geo(year: int = Query(2026)):
    """Couverture réseau géolocalisée par région."""
    if _geo is None:
        return []
    df = _geo[_geo["year"] == year]
    return df_to_records(df)


@app.get("/operators")
def get_operators():
    """Profils des 9 opérateurs."""
    if _ops is None:
        return []
    return df_to_records(_ops)


@app.get("/trends")
def get_trends(metric: str = Query("penetration_rate_pct")):
    """Tendances annuelles par pays pour une métrique."""
    if _annual is None:
        return []
    available = ["penetration_rate_pct", "coverage_4g_pct",
                 "mobile_money_penetration_pct", "total_revenue_musd",
                 "total_subscribers", "gdp_per_capita_usd"]
    if metric not in available:
        return {"error": f"Metric must be one of: {available}"}
    df = _annual[["year", "country", "country_code", metric]].copy()
    return df_to_records(df.sort_values(["country", "year"]))
