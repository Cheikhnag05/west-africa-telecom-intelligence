"""
src/generate_data.py
Génère des données télécom réalistes pour 3 pays d'Afrique de l'Ouest
Sénégal, Côte d'Ivoire, Mali — 2022 à 2026
Sources de référence : ITU, GSMA, ARTP, rapports annuels Orange Africa / MTN
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, date

np.random.seed(42)

# ── Configuration ─────────────────────────────────────────────────────────────
YEARS   = list(range(2022, 2027))
MONTHS  = list(range(1, 13))
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")

# ── Pays & contexte démographique (sources: Banque Mondiale 2024) ─────────────
COUNTRIES = {
    "Senegal": {
        "code": "SN", "capital": "Dakar", "region": "Afrique de l'Ouest",
        "population_2022": 17_200_000,
        "population_growth": 0.028,          # 2.8% annuel
        "gdp_per_capita_2022": 1620,          # USD
        "gdp_growth": 0.052,
        "currency": "XOF",
        "regulateur": "ARTP",
        "operators": ["Orange Sénégal", "Free Sénégal", "Expresso"],
        "market_share_2022": [0.55, 0.36, 0.09],
        "penetration_2022": 0.112,            # 112 abonnés / 100 hab (multi-SIM)
        "arpu_usd_2022": {"Orange Sénégal": 4.8, "Free Sénégal": 3.2, "Expresso": 2.6},
        "churn_monthly_2022": {"Orange Sénégal": 0.024, "Free Sénégal": 0.038, "Expresso": 0.045},
        "coverage_4g_2022": 0.52,
        "mobile_money_penetration_2022": 0.61,
    },
    "Cote_dIvoire": {
        "code": "CI", "capital": "Abidjan", "region": "Afrique de l'Ouest",
        "population_2022": 27_500_000,
        "population_growth": 0.024,
        "gdp_per_capita_2022": 2360,
        "gdp_growth": 0.067,
        "currency": "XOF",
        "regulateur": "ARTCI",
        "operators": ["Orange CI", "MTN CI", "Moov Africa CI"],
        "market_share_2022": [0.42, 0.38, 0.20],
        "penetration_2022": 0.138,
        "arpu_usd_2022": {"Orange CI": 5.6, "MTN CI": 4.9, "Moov Africa CI": 3.4},
        "churn_monthly_2022": {"Orange CI": 0.021, "MTN CI": 0.026, "Moov Africa CI": 0.041},
        "coverage_4g_2022": 0.61,
        "mobile_money_penetration_2022": 0.72,
    },
    "Mali": {
        "code": "ML", "capital": "Bamako", "region": "Afrique de l'Ouest",
        "population_2022": 22_800_000,
        "population_growth": 0.030,
        "gdp_per_capita_2022": 870,
        "gdp_growth": 0.031,
        "currency": "XOF",
        "regulateur": "AMRTP",
        "operators": ["Orange Mali", "Malitel", "Telecel Mali"],
        "market_share_2022": [0.60, 0.32, 0.08],
        "penetration_2022": 0.084,
        "arpu_usd_2022": {"Orange Mali": 3.9, "Malitel": 2.8, "Telecel Mali": 2.1},
        "churn_monthly_2022": {"Orange Mali": 0.028, "Malitel": 0.042, "Telecel Mali": 0.058},
        "coverage_4g_2022": 0.31,
        "mobile_money_penetration_2022": 0.45,
    },
}

# ── Tendances macro 2022-2026 (réalistes selon rapports GSMA) ─────────────────
TREND_PENETRATION_ANNUAL = {
    "Senegal":      [0.0, +0.018, +0.022, +0.019, +0.015],   # +1.5-2.2% / an
    "Cote_dIvoire": [0.0, +0.014, +0.016, +0.013, +0.011],
    "Mali":         [0.0, +0.022, +0.025, +0.020, +0.018],   # marché en fort développement
}
TREND_ARPU_ANNUAL = {
    "Senegal":      [0.0, +0.04, +0.06, +0.05, +0.03],       # +3-6% / an
    "Cote_dIvoire": [0.0, +0.05, +0.07, +0.06, +0.04],
    "Mali":         [0.0, +0.02, +0.03, +0.025, +0.02],
}
TREND_4G_ANNUAL = {
    "Senegal":      [0.0, +0.07, +0.08, +0.06, +0.05],
    "Cote_dIvoire": [0.0, +0.06, +0.07, +0.05, +0.04],
    "Mali":         [0.0, +0.10, +0.12, +0.09, +0.07],
}
TREND_MOBILE_MONEY_ANNUAL = {
    "Senegal":      [0.0, +0.05, +0.06, +0.04, +0.03],
    "Cote_dIvoire": [0.0, +0.04, +0.04, +0.03, +0.02],
    "Mali":         [0.0, +0.07, +0.08, +0.06, +0.05],
}


def noise(scale=0.02):
    return 1 + np.random.normal(0, scale)


def generate_monthly_kpis():
    """Génère les KPIs mensuels par opérateur (2022-2026)."""
    rows = []
    for country, cfg in COUNTRIES.items():
        pop     = cfg["population_2022"]
        pen     = cfg["penetration_2022"]
        cov_4g  = cfg["coverage_4g_2022"]
        mm_pen  = cfg["mobile_money_penetration_2022"]

        for yi, year in enumerate(YEARS):
            # Tendances annuelles cumulées
            cum_pen  = pen + sum(TREND_PENETRATION_ANNUAL[country][:yi+1])
            cum_4g   = min(cov_4g + sum(TREND_4G_ANNUAL[country][:yi+1]), 0.97)
            cum_mm   = min(mm_pen + sum(TREND_MOBILE_MONEY_ANNUAL[country][:yi+1]), 0.95)
            pop_year = int(pop * (1 + cfg["population_growth"]) ** yi)

            # Évolution parts de marché (légère consolidation dominant)
            shares = cfg["market_share_2022"].copy()
            shares[0] = min(shares[0] + 0.005 * yi, 0.68)   # dominant gagne
            shares[1] = shares[1] - 0.003 * yi
            shares[2] = max(1 - shares[0] - shares[1], 0.04)

            for mi, month in enumerate(MONTHS):
                # Saisonnalité : pic Q4 (Ramadan, fêtes), creux Q1
                seasonal = 1 + 0.04 * np.sin(2 * np.pi * (month - 3) / 12)

                for oi, op in enumerate(cfg["operators"]):
                    base_arpu = cfg["arpu_usd_2022"][op]
                    cum_arpu  = base_arpu * (1 + sum(TREND_ARPU_ANNUAL[country][:yi+1]))
                    base_churn = cfg["churn_monthly_2022"][op]
                    # Churn diminue légèrement avec fidélisation
                    churn = max(base_churn * (1 - 0.03 * yi) * noise(0.01), 0.008)

                    total_subs = int(pop_year * cum_pen * shares[oi])
                    new_subs   = int(total_subs * 0.015 * seasonal * noise(0.03))
                    churned    = int(total_subs * churn * noise(0.01))
                    net_adds   = new_subs - churned

                    arpu_month = cum_arpu * seasonal * noise(0.015)
                    revenue    = total_subs * arpu_month / 1_000_000  # M USD
                    data_usage = (1.8 + 0.4 * yi + 0.3 * mi) * noise(0.05)  # GB/sub/mois

                    rows.append({
                        "year": year,
                        "month": month,
                        "date": f"{year}-{month:02d}-01",
                        "country": country.replace("_", " "),
                        "country_code": cfg["code"],
                        "operator": op,
                        "operator_rank": oi + 1,
                        "market_share_pct": round(shares[oi] * 100, 2),
                        "total_subscribers": total_subs,
                        "new_subscribers": new_subs,
                        "churned_subscribers": churned,
                        "net_adds": net_adds,
                        "churn_rate_pct": round(churn * 100, 3),
                        "arpu_usd": round(arpu_month, 2),
                        "revenue_musd": round(revenue, 3),
                        "data_usage_gb": round(data_usage, 2),
                        "coverage_4g_pct": round(cum_4g * 100, 1),
                        "mobile_money_penetration_pct": round(cum_mm * 100, 1),
                        "population": pop_year,
                        "penetration_rate_pct": round(cum_pen * 100, 2),
                    })

    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["date"])
    return df


def generate_country_annual():
    """Génère les indicateurs annuels agrégés par pays."""
    rows = []
    for country, cfg in COUNTRIES.items():
        pop = cfg["population_2022"]
        for yi, year in enumerate(YEARS):
            pop_year  = int(pop * (1 + cfg["population_growth"]) ** yi)
            pen       = cfg["penetration_2022"] + sum(TREND_PENETRATION_ANNUAL[country][:yi+1])
            cov_4g    = min(cfg["coverage_4g_2022"] + sum(TREND_4G_ANNUAL[country][:yi+1]), 0.97)
            mm_pen    = min(cfg["mobile_money_penetration_2022"] + sum(TREND_MOBILE_MONEY_ANNUAL[country][:yi+1]), 0.95)
            gdp_pc    = cfg["gdp_per_capita_2022"] * (1 + cfg["gdp_growth"]) ** yi
            total_subs= int(pop_year * pen)
            total_rev = sum(
                total_subs * cfg["market_share_2022"][oi] *
                cfg["arpu_usd_2022"][op] * (1 + sum(TREND_ARPU_ANNUAL[country][:yi+1])) * 12
                for oi, op in enumerate(cfg["operators"])
            ) / 1_000_000

            rows.append({
                "year": year,
                "country": country.replace("_", " "),
                "country_code": cfg["code"],
                "capital": cfg["capital"],
                "regulateur": cfg["regulateur"],
                "population": pop_year,
                "total_subscribers": total_subs,
                "penetration_rate_pct": round(pen * 100, 2),
                "coverage_4g_pct": round(cov_4g * 100, 1),
                "mobile_money_penetration_pct": round(mm_pen * 100, 1),
                "total_revenue_musd": round(total_rev, 1),
                "gdp_per_capita_usd": round(gdp_pc, 0),
                "num_operators": len(cfg["operators"]),
            })

    return pd.DataFrame(rows)


def generate_operator_profiles():
    """Profils statiques des opérateurs."""
    rows = []
    profiles = {
        "Orange Sénégal": {"parent": "Orange Group", "hq": "Paris, France", "founded": 1997, "technology": "2G/3G/4G", "mobile_money": "Orange Money"},
        "Free Sénégal":   {"parent": "Axian Group", "hq": "Dakar, Sénégal", "founded": 2017, "technology": "2G/3G/4G", "mobile_money": "Wave"},
        "Expresso":        {"parent": "Sudatel Group","hq": "Khartoum, Sudan", "founded": 2007, "technology": "2G/3G", "mobile_money": "None"},
        "Orange CI":       {"parent": "Orange Group", "hq": "Paris, France", "founded": 1996, "technology": "2G/3G/4G/5G", "mobile_money": "Orange Money"},
        "MTN CI":          {"parent": "MTN Group",    "hq": "Johannesburg, SA", "founded": 1996, "technology": "2G/3G/4G", "mobile_money": "MTN MoMo"},
        "Moov Africa CI":  {"parent": "Maroc Telecom","hq": "Rabat, Maroc", "founded": 2000, "technology": "2G/3G/4G", "mobile_money": "Moov Money"},
        "Orange Mali":     {"parent": "Orange Group", "hq": "Paris, France", "founded": 2003, "technology": "2G/3G/4G", "mobile_money": "Orange Money"},
        "Malitel":         {"parent": "Sotelma",      "hq": "Bamako, Mali", "founded": 2002, "technology": "2G/3G/4G", "mobile_money": "Mobicash"},
        "Telecel Mali":    {"parent": "Telecel Group","hq": "Genève, Suisse", "founded": 2016, "technology": "2G/3G", "mobile_money": "None"},
    }
    for country, cfg in COUNTRIES.items():
        for op in cfg["operators"]:
            p = profiles.get(op, {})
            rows.append({
                "country": country.replace("_", " "),
                "country_code": cfg["code"],
                "operator": op,
                "parent_company": p.get("parent", "N/A"),
                "hq": p.get("hq", "N/A"),
                "founded": p.get("founded", 2000),
                "technology": p.get("technology", "2G/3G/4G"),
                "mobile_money_brand": p.get("mobile_money", "None"),
            })
    return pd.DataFrame(rows)


def generate_regional_coverage():
    """Couverture réseau par région (geo données)."""
    regions = {
        "Senegal": [
            ("Dakar", 14.7167, -17.4677, 0.95, 0.99),
            ("Thiès", 14.7833, -16.9167, 0.78, 0.95),
            ("Saint-Louis", 16.0179, -16.4896, 0.65, 0.90),
            ("Ziguinchor", 12.5500, -16.2719, 0.52, 0.82),
            ("Kaolack", 14.1519, -16.0726, 0.70, 0.92),
            ("Tambacounda", 13.7709, -13.6674, 0.40, 0.75),
            ("Kolda", 12.8978, -14.9417, 0.38, 0.72),
            ("Matam", 15.6560, -13.2558, 0.35, 0.70),
            ("Kédougou", 12.5557, -12.1747, 0.28, 0.65),
            ("Louga", 15.6194, -16.2228, 0.62, 0.88),
            ("Diourbel", 14.6550, -16.2314, 0.68, 0.91),
            ("Fatick", 14.3391, -16.4111, 0.60, 0.87),
            ("Kaffrine", 14.1057, -15.5508, 0.55, 0.85),
            ("Sédhiou", 12.7038, -15.5565, 0.36, 0.73),
        ],
        "Cote_dIvoire": [
            ("Abidjan", 5.3544, -4.0083, 0.97, 0.99),
            ("Bouaké", 7.6899, -5.0313, 0.82, 0.96),
            ("Daloa", 6.8774, -6.4502, 0.70, 0.92),
            ("Korhogo", 9.4578, -5.6292, 0.62, 0.88),
            ("Yamoussoukro", 6.8206, -5.2767, 0.85, 0.97),
            ("San-Pédro", 4.7485, -6.6363, 0.65, 0.90),
            ("Man", 7.4128, -7.5538, 0.55, 0.84),
            ("Gagnoa", 6.1319, -5.9510, 0.68, 0.91),
        ],
        "Mali": [
            ("Bamako", 12.6392, -8.0029, 0.88, 0.98),
            ("Sikasso", 11.3178, -5.6660, 0.58, 0.85),
            ("Ségou", 13.4500, -6.2667, 0.52, 0.82),
            ("Mopti", 14.4814, -4.1917, 0.42, 0.75),
            ("Tombouctou", 16.7735, -3.0074, 0.18, 0.55),
            ("Gao", 16.2726, -0.0423, 0.15, 0.50),
            ("Kayes", 14.4417, -11.4386, 0.48, 0.80),
            ("Koulikoro", 12.8619, -7.5569, 0.55, 0.84),
        ],
    }
    rows = []
    for country, regs in regions.items():
        for reg in regs:
            name, lat, lng, cov_4g_2022, cov_2g_2022 = reg
            for yi, year in enumerate(YEARS):
                cov_4g = min(cov_4g_2022 + TREND_4G_ANNUAL[country][yi] * 0.7, 0.99)
                rows.append({
                    "year": year,
                    "country": country.replace("_", " "),
                    "country_code": COUNTRIES[country]["code"],
                    "region": name,
                    "latitude": lat,
                    "longitude": lng,
                    "coverage_4g_pct": round(cov_4g * 100, 1),
                    "coverage_2g_pct": round(min(cov_2g_2022 + 0.01 * yi, 1.0) * 100, 1),
                })
    return pd.DataFrame(rows)


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)

    print("📊 Génération des KPIs mensuels...")
    df_monthly = generate_monthly_kpis()
    df_monthly.to_parquet(os.path.join(OUT_DIR, "monthly_kpis.parquet"), index=False)
    df_monthly.to_csv(os.path.join(OUT_DIR, "monthly_kpis.csv"), index=False)
    print(f"   ✅ {len(df_monthly):,} lignes — monthly_kpis.parquet")

    print("🌍 Génération des indicateurs annuels...")
    df_annual = generate_country_annual()
    df_annual.to_parquet(os.path.join(OUT_DIR, "country_annual.parquet"), index=False)
    df_annual.to_csv(os.path.join(OUT_DIR, "country_annual.csv"), index=False)
    print(f"   ✅ {len(df_annual):,} lignes — country_annual.parquet")

    print("🏢 Génération des profils opérateurs...")
    df_ops = generate_operator_profiles()
    df_ops.to_parquet(os.path.join(OUT_DIR, "operator_profiles.parquet"), index=False)
    df_ops.to_csv(os.path.join(OUT_DIR, "operator_profiles.csv"), index=False)
    print(f"   ✅ {len(df_ops):,} opérateurs — operator_profiles.parquet")

    print("🗺️  Génération de la couverture régionale...")
    df_geo = generate_regional_coverage()
    df_geo.to_parquet(os.path.join(OUT_DIR, "regional_coverage.parquet"), index=False)
    df_geo.to_csv(os.path.join(OUT_DIR, "regional_coverage.csv"), index=False)
    print(f"   ✅ {len(df_geo):,} lignes — regional_coverage.parquet")

    # Stats résumé
    stats = {
        "generated_at": datetime.now().isoformat(),
        "period": "2022-2026",
        "countries": ["Sénégal", "Côte d'Ivoire", "Mali"],
        "operators": 9,
        "monthly_records": len(df_monthly),
        "regions_covered": len(df_geo["region"].unique()),
        "total_subscribers_2026": int(df_annual[df_annual["year"] == 2026]["total_subscribers"].sum()),
        "total_revenue_musd_2026": round(df_annual[df_annual["year"] == 2026]["total_revenue_musd"].sum(), 1),
    }
    with open(os.path.join(OUT_DIR, "dataset_stats.json"), "w") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    print("\n🎉 Génération terminée !")
    print(f"   Période       : 2022–2026")
    print(f"   Pays          : Sénégal, Côte d'Ivoire, Mali")
    print(f"   Opérateurs    : 9 (Orange, MTN, Moov, Free, Malitel...)")
    print(f"   KPIs mensuels : {len(df_monthly):,} enregistrements")
    print(f"   Régions       : {len(df_geo['region'].unique())} villes couvertes")
    print(f"   Abonnés 2026  : {stats['total_subscribers_2026']:,}")
    print(f"   Revenus 2026  : ${stats['total_revenue_musd_2026']}M USD")
