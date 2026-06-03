import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { Users, DollarSign, Wifi, Smartphone } from 'lucide-react'
import { api } from '../api'
import { PageHeader, StatCard, Loader, COUNTRY_COLORS, COUNTRY_FLAGS, Tooltip } from '../components/Shared'

export default function Overview() {
  const [overview, setOverview] = useState(null)
  const [trends, setTrends] = useState([])
  const [year, setYear] = useState(2026)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.overview(year), api.trends('total_subscribers')])
      .then(([ov, tr]) => { setOverview(ov); setTrends(tr) })
      .finally(() => setLoading(false))
  }, [year])

  if (loading) return <><PageHeader title="Vue Marché" subtitle="Intelligence marché Afrique de l'Ouest" /><Loader /></>

  const byCountry = overview?.by_country || []

  // Préparer tendance abonnés par pays
  const trendByYear = {}
  trends.forEach(r => {
    if (!trendByYear[r.year]) trendByYear[r.year] = { year: r.year }
    trendByYear[r.year][r.country] = Math.round(r.total_subscribers / 1_000_000 * 10) / 10
  })
  const trendData = Object.values(trendByYear).sort((a, b) => a.year - b.year)

  return (
    <div>
      <PageHeader title="Vue Marché" subtitle="Intelligence marché · Sénégal, Côte d'Ivoire, Mali">
        <select value={year} onChange={e => setYear(+e.target.value)}
          className="bg-dark-700 border border-dark-500 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange">
          {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Abonnés totaux" value={`${(overview?.total_subscribers/1e6).toFixed(1)}M`} sub="3 marchés combinés" icon={Users} color="orange" />
          <StatCard title="Revenus totaux" value={`$${overview?.total_revenue_musd}M`} sub="USD annualisés" icon={DollarSign} color="green" />
          <StatCard title="Pénétration moy." value={`${overview?.avg_penetration_pct}%`} sub="Taux moyen 3 pays" icon={Smartphone} color="gold" />
          <StatCard title="Couverture 4G moy." value={`${overview?.avg_4g_coverage_pct}%`} sub="Population couverte" icon={Wifi} color="orange" />
        </div>

        {/* Par pays + tendance */}
        <div className="grid grid-cols-2 gap-6">
          {/* Barres par pays */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4">Abonnés par pays · {year}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCountry} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="country" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => COUNTRY_FLAGS[v] + ' ' + v.split(' ')[0]} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => (v/1e6).toFixed(0)+'M'} />
                <RTooltip content={<Tooltip />} formatter={v => [`${(v/1e6).toFixed(2)}M`, 'Abonnés']} />
                <Bar dataKey="total_subscribers" radius={[6,6,0,0]} name="Abonnés">
                  {byCountry.map((e, i) => <Cell key={i} fill={COUNTRY_COLORS[e.country] || '#F97316'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tendance 2022-2026 */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4">Évolution abonnés 2022–2026 (millions)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <RTooltip content={<Tooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-slate-400 text-xs">{v}</span>} />
                {Object.keys(COUNTRY_COLORS).map(c => (
                  <Line key={c} type="monotone" dataKey={c} stroke={COUNTRY_COLORS[c]} strokeWidth={2.5}
                    dot={{ r: 3, fill: COUNTRY_COLORS[c] }} name={c} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau récap par pays */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-dark-600 bg-dark-700">
                {['Pays','Population','Abonnés','Pénétration','Couverture 4G','Mobile Money','Revenus (M$)'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-slate-400 font-medium uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byCountry.map((c, i) => (
                <tr key={i} className="border-b border-dark-600/50 hover:bg-dark-700/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{COUNTRY_FLAGS[c.country]} {c.country}</td>
                  <td className="px-4 py-3 text-slate-400">{(c.population/1e6).toFixed(1)}M</td>
                  <td className="px-4 py-3 text-white font-medium">{(c.total_subscribers/1e6).toFixed(2)}M</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div className="h-full bg-orange rounded-full" style={{ width: `${Math.min(c.penetration_rate_pct, 100)}%` }} />
                      </div>
                      <span className="text-slate-300">{c.penetration_rate_pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div className="h-full bg-green rounded-full" style={{ width: `${c.coverage_4g_pct}%` }} />
                      </div>
                      <span className="text-slate-300">{c.coverage_4g_pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gold font-medium">{c.mobile_money_penetration_pct}%</td>
                  <td className="px-4 py-3 text-green font-semibold">${c.total_revenue_musd}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
