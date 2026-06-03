import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer, Legend } from 'recharts'
import { api } from '../api'
import { PageHeader, Loader, COUNTRY_FLAGS, Tooltip } from '../components/Shared'

const OP_COLORS = {
  'Orange Sénégal':'#F97316','Free Sénégal':'#10B981','Expresso':'#6B7280',
  'Orange CI':'#F97316','MTN CI':'#FBBF24','Moov Africa CI':'#3B82F6',
  'Orange Mali':'#F97316','Malitel':'#10B981','Telecel Mali':'#8B5CF6',
}
const TECH_COLOR = { '2G/3G/4G/5G':'#10B981','2G/3G/4G':'#F97316','2G/3G':'#F59E0B' }

export default function Operators() {
  const [ops, setOps] = useState([])
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.operators(), api.marketShare({ year: 2026 })])
      .then(([o, s]) => { setOps(o); setShares(s) })
      .finally(() => setLoading(false))
  }, [])

  const countries = ['Senegal', "Côte d'Ivoire", 'Mali']

  if (loading) return <><PageHeader title="Opérateurs" /><Loader /></>

  return (
    <div>
      <PageHeader title="Opérateurs" subtitle="9 acteurs télécom · Parts de marché 2026" />
      <div className="p-6 space-y-6">

        {/* Parts de marché par pays */}
        <div className="grid grid-cols-3 gap-4">
          {['Senegal', "Côte d'Ivoire", 'Mali'].map((country, ci) => {
            const countryShares = shares.filter(s => s.country === country || s.country.includes(country.split(' ')[0]))
            const pieData = countryShares.map(s => ({ name: s.operator, value: +s.market_share_pct }))
            const flag = COUNTRY_FLAGS[country] || COUNTRY_FLAGS[country.replace('_',' ')] || '🌍'
            return (
              <div key={country} className="card">
                <h3 className="text-sm font-semibold text-white mb-3">{flag} {country}</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {pieData.map((e, i) => <Cell key={i} fill={OP_COLORS[e.name] || '#888'} />)}
                    </Pie>
                    <RTooltip formatter={v => [v?.toFixed(1)+'%', 'Part de marché']} />
                    <Legend iconType="circle" iconSize={7} formatter={v => <span className="text-slate-400 text-[10px]">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>

        {/* Fiches opérateurs */}
        <div className="grid grid-cols-3 gap-4">
          {ops.map((op, i) => {
            const share = shares.find(s => s.operator === op.operator)
            return (
              <div key={i} className="card hover:border-dark-500 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: (OP_COLORS[op.operator] || '#F97316') + '20', border: `1px solid ${(OP_COLORS[op.operator] || '#F97316')}40` }}>
                    📡
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{op.operator}</p>
                    <p className="text-slate-500 text-xs">{COUNTRY_FLAGS[op.country] || '🌍'} {op.country}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    ['Groupe', op.parent_company],
                    ['Siège', op.hq],
                    ['Fondé', op.founded],
                    ['Technologie', op.technology],
                    ['Mobile Money', op.mobile_money_brand],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500">{k}</span>
                      <span className="text-slate-300 font-medium text-right max-w-[55%] truncate">{v}</span>
                    </div>
                  ))}
                  {share && (
                    <div className="pt-2 mt-2 border-t border-dark-600">
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-500">Part de marché 2026</span>
                        <span className="font-bold" style={{ color: OP_COLORS[op.operator] || '#F97316' }}>{share.market_share_pct?.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${share.market_share_pct}%`, background: OP_COLORS[op.operator] || '#F97316' }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-2 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: (TECH_COLOR[op.technology] || '#F97316') + '20', color: TECH_COLOR[op.technology] || '#F97316' }}>
                    {op.technology}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
