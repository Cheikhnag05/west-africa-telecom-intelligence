<div align="center">

# 🌍 West Africa Telecom Market Intelligence

**Dashboard de veille marché télécom · Sénégal · Côte d'Ivoire · Mali**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-black?style=for-the-badge)](https://west-africa-telecom-intelligence.vercel.app)
[![API](https://img.shields.io/badge/⚡_API-Render-46E3B7?style=for-the-badge)](https://west-africa-telecom-intelligence.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/GitHub-Cheikhnag05-181717?style=for-the-badge&logo=github)](https://github.com/Cheikhnag05/west-africa-telecom-intelligence)

[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)

> 🏆 **Projet portfolio** — Angle unique : aucun candidat français ne dispose d'une intelligence marché  
> aussi précise sur les télécoms d'Afrique de l'Ouest. Inspiré d'une expérience réelle chez **Promobile, Dakar, Sénégal**.

</div>

---

## 🎯 En bref

Dashboard de **market intelligence télécom** couvrant 3 marchés clés d'Afrique de l'Ouest sur 5 ans (2022–2026). Agrège des données inspirées des rapports ITU, GSMA, ARTP et des publications d'Orange Africa et MTN Group pour produire des insights actionnables sur la pénétration mobile, l'ARPU, le churn et la couverture 4G.

| 🔢 Indicateur | Valeur |
|---------------|--------|
| Pays couverts | **3** (Sénégal, Côte d'Ivoire, Mali) |
| Opérateurs analysés | **9** (Orange, MTN, Moov, Free, Malitel...) |
| Période | **2022 – 2026** (5 ans de tendances) |
| Enregistrements KPI | **540** (mensuel × opérateur × pays) |
| Régions géolocalisées | **30 villes** (Dakar, Abidjan, Bamako...) |
| Revenus marché 2026 | **$813.6M USD** |
| Abonnés 2026 | **13.7 millions** |

---

## 🚀 Demo en ligne

| Service | URL | Description |
|---------|-----|-------------|
| 🖥️ **Dashboard** | [west-africa-telecom-intelligence.vercel.app](https://west-africa-telecom-intelligence.vercel.app) | Interface React complète |
| ⚡ **API REST** | [west-africa-telecom-intelligence.onrender.com](https://west-africa-telecom-intelligence.onrender.com) | FastAPI · 8 endpoints |
| 📖 **API Docs** | [.../docs](https://west-africa-telecom-intelligence.onrender.com/docs) | Swagger UI interactif |

> ⚠️ L'API tourne sur le plan gratuit Render — première requête ~30 secondes si inactif.

---

## 📊 KPIs & Métriques couverts

| Métrique | Description | Granularité |
|----------|-------------|-------------|
| **Pénétration mobile** | Abonnés / 100 habitants (multi-SIM) | Mensuel · Pays |
| **ARPU** | Average Revenue Per User (USD/mois) | Mensuel · Opérateur |
| **Churn rate** | Taux d'attrition mensuel (%) | Mensuel · Opérateur |
| **Couverture 4G** | % population couverte | Annuel · Région |
| **Mobile Money** | Pénétration Orange Money / Wave / MTN MoMo | Annuel · Pays |
| **Parts de marché** | % subscribers par opérateur | Mensuel · Pays |
| **Net adds** | Nouveaux abonnés nets | Mensuel · Opérateur |
| **Revenus totaux** | M USD annualisés | Annuel · Opérateur |

---

## 🗺️ Pages du dashboard

| Page | Description |
|------|-------------|
| 🌍 **Vue Marché** | KPIs globaux, abonnés par pays, tendances 2022–2026, tableau comparatif |
| 📶 **Pénétration** | Taux pénétration, couverture 4G, Mobile Money — courbes par pays |
| 💰 **ARPU & Revenus** | ARPU mensuel par opérateur, évolution revenus, classement |
| 📉 **Churn** | Taux d'attrition, net adds, analyse rétention par opérateur |
| 🗺️ **Carte Réseau** | Choropleth couverture 4G · 30 villes géolocalisées |
| 🏢 **Opérateurs** | Fiches des 9 opérateurs, parts de marché, technologie, Mobile Money |

---

## 🛠️ Stack technique

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURE                             │
├──────────────────┬──────────────────┬───────────────────────────┤
│   DATA LAYER     │   PIPELINE       │      SERVING LAYER        │
│                  │                  │                           │
│  pandas          │  generate_data   │  FastAPI + uvicorn        │
│  numpy           │  ITU / GSMA ref  │  8 endpoints REST         │
│  pyarrow         │  ARTP / ARTCI    │  CORS + Swagger           │
│  Parquet         │  Orange Africa   │                           │
│  PostgreSQL-ready│  MTN Group       │  React 18 + Vite          │
│                  │  5 ans · 3 pays  │  Tailwind CSS             │
│                  │                  │  Recharts + Leaflet       │
├──────────────────┴──────────────────┴───────────────────────────┤
│   DÉPLOIEMENT : GitHub → Render (API) + Vercel (Frontend)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Structure du projet

```
west-africa-telecom-intelligence/
│
├── 📁 api/
│   └── main.py              ← FastAPI REST API (8 endpoints)
│
├── 📁 src/
│   └── generate_data.py     ← Pipeline de génération données (ITU/GSMA/ARTP)
│
├── 📁 sql/
│   └── schema.sql           ← Schéma PostgreSQL (4 tables + index)
│
├── 📁 frontend/             ← Dashboard React (Vite + Tailwind)
│   └── src/
│       ├── pages/           ← 6 pages analytiques
│       └── components/      ← Composants réutilisables
│
└── 📁 data/raw/             ← Données générées (Parquet + CSV)
    ├── monthly_kpis.parquet     ← 540 enregistrements KPI mensuels
    ├── country_annual.parquet   ← 15 indicateurs annuels pays
    ├── operator_profiles.parquet← 9 profils opérateurs
    ├── regional_coverage.parquet← 150 points de couverture géo
    └── dataset_stats.json       ← Statistiques résumé
```

---

## 📡 API Reference

```
GET  /              → Informations API
GET  /health        → Statut données chargées
GET  /stats         → Statistiques globales dataset
GET  /overview      → KPIs agrégés par année (param: year)
GET  /penetration   → Taux pénétration 2022-2026 (param: country)
GET  /arpu          → ARPU par opérateur (params: year, country)
GET  /churn         → Taux churn mensuel (param: country)
GET  /market-share  → Parts de marché (params: year, country)
GET  /geo           → Couverture géolocalisée (param: year)
GET  /operators     → Profils des 9 opérateurs
GET  /trends        → Tendances annuelles (param: metric)
```

### Exemple `/overview?year=2026`

```bash
curl "https://west-africa-telecom-intelligence.onrender.com/overview?year=2026"
```

```json
{
  "year": 2026,
  "total_subscribers": 13715073,
  "total_revenue_musd": 813.6,
  "avg_penetration_pct": 14.82,
  "avg_4g_coverage_pct": 71.3,
  "avg_mobile_money_pct": 83.2,
  "by_country": [...]
}
```

### Exemple `/arpu?year=2026&country=Senegal`

```bash
curl "https://west-africa-telecom-intelligence.onrender.com/arpu?year=2026&country=Senegal"
```

```json
[
  { "country": "Senegal", "operator": "Orange Sénégal", "arpu_usd": 5.73, "revenue_musd": 198.4 },
  { "country": "Senegal", "operator": "Free Sénégal",   "arpu_usd": 3.84, "revenue_musd": 89.2 },
  { "country": "Senegal", "operator": "Expresso",       "arpu_usd": 3.12, "revenue_musd": 18.7 }
]
```

---

## ⚡ Lancer en local

```bash
# 1. Cloner
git clone https://github.com/Cheikhnag05/west-africa-telecom-intelligence.git
cd west-africa-telecom-intelligence

# 2. Installer les dépendances Python
pip install fastapi uvicorn pandas pyarrow numpy

# 3. Générer les données (instantané)
python src/generate_data.py

# 4. Lancer l'API
python -m uvicorn api.main:app --reload
# → http://localhost:8000/docs

# 5. Lancer le frontend (nouveau terminal)
cd frontend && npm install && npm run dev
# → http://localhost:5173
```

---

## 🌍 Opérateurs couverts

| Pays | Opérateurs | Leader | Mobile Money |
|------|-----------|--------|--------------|
| 🇸🇳 **Sénégal** | Orange · Free · Expresso | Orange (55%) | Orange Money · Wave |
| 🇨🇮 **Côte d'Ivoire** | Orange · MTN · Moov Africa | Orange (42%) | Orange Money · MTN MoMo |
| 🇲🇱 **Mali** | Orange · Malitel · Telecel | Orange (60%) | Orange Money · Mobicash |

---

## 📚 Sources de référence

- **ITU** — International Telecommunication Union, Africa Reports 2022–2026
- **GSMA** — Mobile Economy Sub-Saharan Africa 2022–2026
- **ARTP** — Autorité de Régulation des Télécommunications et des Postes (Sénégal)
- **ARTCI** — Autorité de Régulation des Télécommunications (Côte d'Ivoire)
- **Orange Africa** — Rapports annuels 2022–2025
- **MTN Group** — Annual Reports 2022–2025

---

## 👤 Auteur

**Cheikhna Dieng Gueye** — Data Analyst & ML Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Cheikhna_Gueye-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/cheikhnagueye)
[![GitHub](https://img.shields.io/badge/GitHub-Cheikhnag05-181717?style=flat-square&logo=github)](https://github.com/Cheikhnag05)

> Expérience Data chez **Promobile, Dakar, Sénégal**  
> Expertise : SQL · Python · Machine Learning · Market Intelligence · Telecom Analytics
