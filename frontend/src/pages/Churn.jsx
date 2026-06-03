import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { api } from '../api'
import { PageHeader, Loader, COUNTRY_COLORS, COUNTRY_FLAGS, Tooltip } from '../components/Shared'

const OP_COLORS = {
  'Orange Sénégal':'#F97316','Free Sénégal':'#10B981','Expresso':'#6B7280',
  'Orange CI':'#F97316','MTN CI':'#FBBF24','Moov Africa CI':'#3B82F6',
  'Orange Mali':'#F97316','Malitel':'#10B981','Telecel Mali':'#8B5CF6',
}

export default function Churn() {
  const [data, setData] = useState([])
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.churn(country || undefined).then(setData).finally(() => setLoading(false))
  }, [country])

  // Tendance churn annuel moyen par pays
  const byYear = {}
  data.forEach(r => {
    const k = `${r.year}`
    if (!byYear[k]) byYear[k] = { year: r.year }
    if (!byYear[k][r.country+'_s']) byYear[k][r.country+'_s'] = 0
    if (!byYear[k][r.country+'_n']) byYear[k][r.country+'_n'] = 0
    byYear[k][r.country+'_s'] += r.churn_rate_pct
    byYear[k][r.country+'_n'] += 1
  })
  const trendData = Object.values(byYear).map(r => {
    const out = { year: r.year }
    Object.keys(COUNTRY_COLORS).forEach(c => {
      if (r[c+'_s']) out[c] = +(r[c+'_s'] / r[c+'_n']).toFixed(3)
    })
    return out
  }).sort((a,b) => a.year - b.year)

  // Churn par opérateur (2026 annuel moyen)
  const byOp = {}
  data.filter(r => r.year === 2026).forEach(r => {
    if (!byOp[r.operator]) byOp[r.operator] = { operator: r.operator, churn: 0, n: 0, net: 0 }
    byOp[r.operator].churn += r.churn_rate_pct
    byOp[r.operator].n += 1
    byOp[r.operator].net += r.net_adds
  })
  const opData = Object.values(byOp).map(r => ({
    operator: r.operator, churn_rate_pct: +(r.churn/r.n).toFixed(3), net_adds: r.net
  })).sort((a,b) => b.churn_rate_pct - a.churn_rate_pct)

  if (loading) return <><PageHeader title="Churn & Rétention" /><Loader /></>

  return (
    <div>
      <PageHeader title="Churn & Rétention" subtitle="Taux d'attrition mensuel · Net adds · 2022–2026">
        <select value={country} onChange={e => setCountry(e.target.value)}
          className="bg-dark-700 border border-dark-500 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange">
          <option value="">Tous les pays</option>
          <option value="Senegal">🇸🇳 Sénégal</option>
          <option value="Ivoire">🇨🇮 Côte d'Ivoire</option>
          <option value="Mali">🇲🇱 Mali</option>
        </select>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Tendance churn */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-1">Taux de churn mensuel moyen par pays (%)</h3>
          <p className="text-slate-500 text-xs mb-4">Un churn &lt; 2% est considéré excellent dans les marchés télécom émergents</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v+'%'} />
              <RTooltip content={<Tooltip />} formatter={v => [v?.toFixed(3)+'%', 'Churn']} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-slate-400 text-xs">{COUNTRY_FLAGS[v]} {v}</span>} />
              {Object.keys(COUNTRY_COLORS).map(c => (
                <Line key={c} type="monotone" dataKey={c} stroke={COUNTRY_COLORS[c]} strokeWidth={2.5} dot={{ r:3 }} name={c} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Churn par opérateur */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4">Churn par opérateur · 2026 (%/mois)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={opData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v+'%'} />
                <YAxis type="category" dataKey="operator" tick={{ fill: '#94a3b8', fontSize: 9 }} width={115} axisLine={false} tickLine={false} />
                <RTooltip content={<Tooltip />} formatter={v => [v?.toFixed(3)+'%', 'Churn']} />
                <Bar dataKey="churn_rate_pct" radius={[0,4,4,0]} name="Churn %">
                  {opData.map((e, i) => <Cell key={i} fill={OP_COLORS[e.operator] || '#F97316'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Analyse */}
          <div className="space-y-3">
            <div className="card border-green/30 bg-green/5">
              <p className="text-green font-semibold text-sm mb-2">✅ Leaders rétention</p>
              <p className="text-slate-400 text-xs leading-relaxed">Orange (tous pays) affiche les churn les plus bas (&lt;2.5%/mois) grâce à Orange Money, le programme fidélité et la meilleure couverture réseau.</p>
            </div>
            <div className="card border-orange/30 bg-orange/5">
              <p className="text-orange font-semibold text-sm mb-2">⚠️ Challengers</p>
              <p className="text-slate-400 text-xs leading-relaxed">Free Sénégal (3.5%) et MTN CI (2.6%) investissent dans la rétention via des offres data agressives. Tendance baissière 2022-2026.</p>
            </div>
            <div className="card border-red/30 bg-red/5">
              <p className="text-red font-semibold text-sm mb-2">🔴 Churn élevé</p>
              <p className="text-slate-400 text-xs leading-relaxed">Expresso et Telecel Mali maintiennent des churn &gt;4.5%, signe de difficultés de rétention dans des marchés dominés par Orange.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
