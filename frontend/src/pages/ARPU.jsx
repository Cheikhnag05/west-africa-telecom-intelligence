import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { api } from '../api'
import { PageHeader, Loader, COUNTRY_COLORS, COUNTRY_FLAGS, Tooltip } from '../components/Shared'

const OP_COLORS = {
  'Orange Sénégal':'#F97316','Free Sénégal':'#10B981','Expresso':'#6B7280',
  'Orange CI':'#F97316','MTN CI':'#FBBF24','Moov Africa CI':'#3B82F6',
  'Orange Mali':'#F97316','Malitel':'#10B981','Telecel Mali':'#8B5CF6',
}

export default function ARPU() {
  const [data, setData] = useState([])
  const [year, setYear] = useState(2026)
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.arpu({ year, country: country || undefined })
      .then(setData)
      .finally(() => setLoading(false))
  }, [year, country])

  // Pivot pour tendance annuelle ARPU par pays
  const trendData = {}
  data.forEach(r => {
    if (!trendData[r.year]) trendData[r.year] = { year: r.year }
    // Moyenne ARPU par pays
    if (!trendData[r.year][r.country + '_sum']) trendData[r.year][r.country + '_sum'] = 0
    if (!trendData[r.year][r.country + '_count']) trendData[r.year][r.country + '_count'] = 0
    trendData[r.year][r.country + '_sum'] += r.arpu_usd
    trendData[r.year][r.country + '_count'] += 1
  })
  const trendArr = Object.values(trendData).map(r => {
    const out = { year: r.year }
    Object.keys(COUNTRY_COLORS).forEach(c => {
      if (r[c + '_sum']) out[c] = +(r[c + '_sum'] / r[c + '_count']).toFixed(2)
    })
    return out
  }).sort((a,b) => a.year - b.year)

  // ARPU par opérateur pour l'année sélectionnée
  const byOp = data.filter(r => r.year === year)

  if (loading) return <><PageHeader title="ARPU & Revenus" /><Loader /></>

  return (
    <div>
      <PageHeader title="ARPU & Revenus" subtitle="Average Revenue Per User · USD mensuel par opérateur">
        <select value={country} onChange={e => setCountry(e.target.value)}
          className="bg-dark-700 border border-dark-500 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange">
          <option value="">Tous les pays</option>
          <option value="Senegal">🇸🇳 Sénégal</option>
          <option value="Ivoire">🇨🇮 Côte d'Ivoire</option>
          <option value="Mali">🇲🇱 Mali</option>
        </select>
        <select value={year} onChange={e => setYear(+e.target.value)}
          className="bg-dark-700 border border-dark-500 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange">
          {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </PageHeader>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* ARPU par opérateur */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4">ARPU moyen par opérateur · {year} (USD/mois)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byOp} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => '$'+v} />
                <YAxis type="category" dataKey="operator" tick={{ fill: '#94a3b8', fontSize: 10 }} width={120} axisLine={false} tickLine={false} />
                <RTooltip content={<Tooltip />} formatter={v => ['$'+v?.toFixed(2), 'ARPU']} />
                <Bar dataKey="arpu_usd" radius={[0,4,4,0]} name="ARPU USD">
                  {byOp.map((e, i) => <Cell key={i} fill={OP_COLORS[e.operator] || '#F97316'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tendance ARPU */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4">Évolution ARPU moyen par pays 2022–2026 (USD)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendArr} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => '$'+v} />
                <RTooltip content={<Tooltip />} formatter={v => ['$'+v?.toFixed(2)]} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-slate-400 text-xs">{COUNTRY_FLAGS[v]} {v}</span>} />
                {Object.keys(COUNTRY_COLORS).map(c => (
                  <Line key={c} type="monotone" dataKey={c} stroke={COUNTRY_COLORS[c]} strokeWidth={2.5} dot={{ r:3 }} name={c} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenus par opérateur */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Revenus annuels par opérateur · {year} (M USD)</h3>
          <div className="grid grid-cols-3 gap-3">
            {byOp.sort((a,b) => b.revenue_musd - a.revenue_musd).map((op, i) => (
              <div key={i} className="bg-dark-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: OP_COLORS[op.operator] || '#F97316' }} />
                  <span className="text-white text-xs font-medium truncate">{op.operator}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-green font-bold text-lg">${op.revenue_musd?.toFixed(1)}M</p>
                    <p className="text-slate-500 text-[10px]">Revenus annuels</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange font-semibold text-sm">${op.arpu_usd?.toFixed(2)}</p>
                    <p className="text-slate-500 text-[10px]">ARPU/mois</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
