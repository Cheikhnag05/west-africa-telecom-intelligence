import { BarChart2, TrendingUp, DollarSign, UserMinus, Map, Building2, ChevronRight, Globe } from 'lucide-react'

const NAV = [
  { id: 'overview',    label: 'Vue Marché',       icon: BarChart2,  desc: '3 pays · 2022-2026' },
  { id: 'penetration', label: 'Pénétration',       icon: TrendingUp, desc: 'Abonnés & croissance' },
  { id: 'arpu',        label: 'ARPU & Revenus',    icon: DollarSign, desc: 'Revenus / abonné' },
  { id: 'churn',       label: 'Churn',             icon: UserMinus,  desc: 'Taux d\'attrition' },
  { id: 'geo',         label: 'Carte Réseau',      icon: Map,        desc: 'Couverture 4G géo' },
  { id: 'operators',   label: 'Opérateurs',        icon: Building2,  desc: '9 acteurs du marché' },
]

const COUNTRIES = [
  { code: 'SN', name: 'Sénégal',       color: 'bg-green' },
  { code: 'CI', name: "Côte d'Ivoire", color: 'bg-orange' },
  { code: 'ML', name: 'Mali',          color: 'bg-gold' },
]

export default function Sidebar({ current, onChange }) {
  return (
    <aside className="w-64 flex-shrink-0 bg-dark-800 border-r border-dark-600 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange/20 border border-orange/40 flex items-center justify-center">
            <Globe className="w-5 h-5 text-orange" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">West Africa Telecom</div>
            <div className="text-slate-400 text-xs">Market Intelligence</div>
          </div>
        </div>
      </div>

      {/* Countries */}
      <div className="px-4 py-3 border-b border-dark-600">
        <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-2">Marchés couverts</p>
        <div className="flex gap-2">
          {COUNTRIES.map(c => (
            <div key={c.code} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${c.color}`} />
              <span className="text-slate-400 text-[10px] font-medium">{c.code}</span>
            </div>
          ))}
        </div>
        <p className="text-slate-600 text-[10px] mt-1">2022 – 2026 · 9 opérateurs</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon, desc }) => {
          const active = current === id
          return (
            <button key={id} onClick={() => onChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                active ? 'bg-orange/15 text-orange border border-orange/30' : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-orange' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <div className="flex-1 text-left">
                <div className="leading-tight">{label}</div>
                <div className="text-[10px] text-slate-600 font-normal">{desc}</div>
              </div>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-dark-600 text-xs text-slate-500 space-y-0.5">
        <div className="text-slate-400 font-medium">Sources de données</div>
        <div>ITU · GSMA · ARTP · ARTCI</div>
        <div>Orange Africa · MTN Group</div>
      </div>
    </aside>
  )
}
