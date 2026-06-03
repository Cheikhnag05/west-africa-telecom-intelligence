import { useEffect, useState } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Legend } from 'recharts'
import { api } from '../api'
import { PageHeader, Loader, COUNTRY_COLORS, COUNTRY_FLAGS, Tooltip } from '../components/Shared'

export default function Penetration() {
  const [data, setData] = useState([])
  const [data4g, setData4g] = useState([])
  const [dataMM, setDataMM] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.trends('penetration_rate_pct'),
      api.trends('coverage_4g_pct'),
      api.trends('mobile_money_penetration_pct'),
    ]).then(([pen, cov, mm]) => {
      const pivot = (rows) => {
        const byYear = {}
        rows.forEach(r => {
          if (!byYear[r.year]) byYear[r.year] = { year: r.year }
          byYear[r.year][r.country] = r[Object.keys(r).find(k => k !== 'year' && k !== 'country' && k !== 'country_code')]
        })
        return Object.values(byYear).sort((a,b) => a.year - b.year)
      }
      setData(pivot(pen))
      setData4g(pivot(cov))
      setDataMM(pivot(mm))
    }).finally(() => setLoading(false))
  }, [])

  const countries = Object.keys(COUNTRY_COLORS)

  if (loading) return <><PageHeader title="Pénétration Mobile" /><Loader /></>

  return (
    <div>
      <PageHeader title="Pénétration Mobile" subtitle="Taux d'abonnement & croissance 2022–2026" />
      <div className="p-6 space-y-6">

        {/* Pénétration globale */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-1">Taux de pénétration mobile (%)</h3>
          <p className="text-slate-500 text-xs mb-4">Nombre d'abonnés pour 100 habitants (multi-SIM inclus)</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                {countries.map(c => (
                  <linearGradient key={c} id={`grad-${c}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COUNTRY_COLORS[c]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COUNTRY_COLORS[c]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v+'%'} />
              <RTooltip content={<Tooltip />} formatter={v => [v?.toFixed(1)+'%']} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-slate-400 text-xs">{COUNTRY_FLAGS[v]} {v}</span>} />
              {countries.map(c => (
                <Area key={c} type="monotone" dataKey={c} stroke={COUNTRY_COLORS[c]} fill={`url(#grad-${c})`} strokeWidth={2.5} name={c} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Couverture 4G */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-1">Couverture 4G (%)</h3>
            <p className="text-slate-500 text-xs mb-4">% de la population avec accès au réseau 4G</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data4g} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v+'%'} domain={[0, 100]} />
                <RTooltip content={<Tooltip />} formatter={v => [v?.toFixed(1)+'%']} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-slate-400 text-xs">{COUNTRY_FLAGS[v]} {v}</span>} />
                {countries.map(c => (
                  <Line key={c} type="monotone" dataKey={c} stroke={COUNTRY_COLORS[c]} strokeWidth={2.5} dot={{ r: 3 }} name={c} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Mobile Money */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-1">Pénétration Mobile Money (%)</h3>
            <p className="text-slate-500 text-xs mb-4">Orange Money · Wave · MTN MoMo · Mobicash</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dataMM} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v+'%'} domain={[0, 100]} />
                <RTooltip content={<Tooltip />} formatter={v => [v?.toFixed(1)+'%']} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-slate-400 text-xs">{COUNTRY_FLAGS[v]} {v}</span>} />
                {countries.map(c => (
                  <Line key={c} type="monotone" dataKey={c} stroke={COUNTRY_COLORS[c]} strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 3 }} name={c} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight box */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { flag:'🇸🇳', country:'Sénégal', insight:'Leader Mobile Money avec Wave (Fintech licorne). Pénétration 4G en forte hausse post-lancement Free Sénégal (2017).', color:'border-green/30 bg-green/5' },
            { flag:'🇨🇮', country:"Côte d'Ivoire", insight:'Marché le plus mature. PIB/hab le plus élevé des 3. Abidjan concentre 60% des abonnés 4G. MTN et Orange en duopole.', color:'border-orange/30 bg-orange/5' },
            { flag:'🇲🇱', country:'Mali', insight:'Plus forte croissance 2022-2026 (+2.5%/an). Marché sous-pénétré avec fort potentiel. Impact sécuritaire limité en zones urbaines.', color:'border-gold/30 bg-gold/5' },
          ].map(({ flag, country, insight, color }) => (
            <div key={country} className={`card border ${color}`}>
              <p className="text-white font-semibold text-sm mb-2">{flag} {country}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
