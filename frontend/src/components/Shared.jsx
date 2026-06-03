export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="px-8 py-5 border-b border-dark-600 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}

export function Loader({ text = 'Chargement...' }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-8 h-8 border-2 border-orange/30 border-t-orange rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  )
}

export function StatCard({ title, value, sub, color = 'orange', icon: Icon }) {
  const c = { orange: 'text-orange bg-orange/10 border-orange/20', green: 'text-green bg-green/10 border-green/20', gold: 'text-gold bg-gold/10 border-gold/20', red: 'text-red bg-red/10 border-red/20' }
  return (
    <div className="card flex items-start gap-4 animate-slide-up">
      {Icon && <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${c[color]}`}><Icon className="w-5 h-5" /></div>}
      <div className="min-w-0">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-white truncate">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export const COUNTRY_COLORS = { 'Senegal': '#10B981', 'Cote dIvoire': '#F97316', "Côte d'Ivoire": '#F97316', 'Mali': '#F59E0B' }
export const COUNTRY_FLAGS  = { 'Senegal': '🇸🇳', "Côte d'Ivoire": '🇨🇮', 'Mali': '🇲🇱' }

export const Tooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color || p.fill }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  )
}
