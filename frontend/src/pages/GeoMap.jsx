import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { api } from '../api'
import { PageHeader, Loader } from '../components/Shared'
import 'leaflet/dist/leaflet.css'

function getCoverageColor(pct) {
  if (pct >= 85) return '#10B981'
  if (pct >= 65) return '#F59E0B'
  if (pct >= 45) return '#F97316'
  return '#EF4444'
}

export default function GeoMap() {
  const [data, setData] = useState([])
  const [year, setYear] = useState(2026)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.geo(year).then(setData).finally(() => setLoading(false))
  }, [year])

  const stats = {
    excellent: data.filter(d => d.coverage_4g_pct >= 85).length,
    good:      data.filter(d => d.coverage_4g_pct >= 65 && d.coverage_4g_pct < 85).length,
    medium:    data.filter(d => d.coverage_4g_pct >= 45 && d.coverage_4g_pct < 65).length,
    poor:      data.filter(d => d.coverage_4g_pct < 45).length,
  }

  return (
    <div>
      <PageHeader title="Carte Réseau" subtitle="Couverture 4G par région · Sénégal, Côte d'Ivoire, Mali">
        <select value={year} onChange={e => setYear(+e.target.value)}
          className="bg-dark-700 border border-dark-500 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange">
          {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </PageHeader>

      <div className="p-6 space-y-4">
        {/* Status résumé */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Excellente (≥85%)', count: stats.excellent, color: 'text-green', dot: 'bg-green' },
            { label: 'Bonne (65-85%)',    count: stats.good,      color: 'text-gold',  dot: 'bg-gold' },
            { label: 'Moyenne (45-65%)',  count: stats.medium,    color: 'text-orange',dot: 'bg-orange' },
            { label: 'Faible (<45%)',     count: stats.poor,      color: 'text-red',   dot: 'bg-red' },
          ].map(({ label, count, color, dot }) => (
            <div key={label} className="card flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
              <div>
                <p className="text-slate-400 text-xs">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{count} régions</p>
              </div>
            </div>
          ))}
        </div>

        {/* Carte */}
        <div className="card p-0 overflow-hidden" style={{ height: 460 }}>
          {loading ? <Loader text="Chargement de la carte..." /> : (
            <MapContainer center={[10.5, -8]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO' />
              {data.map((d, i) => (
                <CircleMarker key={i} center={[d.latitude, d.longitude]}
                  radius={10} pathOptions={{ color: getCoverageColor(d.coverage_4g_pct), fillColor: getCoverageColor(d.coverage_4g_pct), fillOpacity: 0.8, weight: 2 }}>
                  <Popup>
                    <div className="text-xs min-w-[150px] space-y-1">
                      <p className="font-bold text-sm text-white">{d.region}</p>
                      <p className="text-slate-400">{d.country} · {d.country_code}</p>
                      <p className="text-slate-400">Couverture 4G: <strong style={{ color: getCoverageColor(d.coverage_4g_pct) }}>{d.coverage_4g_pct}%</strong></p>
                      <p className="text-slate-400">Couverture 2G: <strong className="text-white">{d.coverage_2g_pct}%</strong></p>
                      <p className="text-slate-400">Année: {year}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Légende */}
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span className="font-medium text-slate-300">Légende couverture 4G :</span>
          {[['#10B981','≥85% Excellente'],['#F59E0B','65-85% Bonne'],['#F97316','45-65% Moyenne'],['#EF4444','<45% Faible']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: c }} /><span>{l}</span>
            </div>
          ))}
        </div>

        {/* Tableau régions */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs">
              <thead className="sticky top-0">
                <tr className="border-b border-dark-600 bg-dark-700">
                  {['Région','Pays','Couverture 4G','Couverture 2G'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-slate-400 font-medium uppercase tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...data].sort((a,b) => b.coverage_4g_pct - a.coverage_4g_pct).map((d, i) => (
                  <tr key={i} className="border-b border-dark-600/50 hover:bg-dark-700/50">
                    <td className="px-4 py-2 text-white font-medium">{d.region}</td>
                    <td className="px-4 py-2 text-slate-400">{d.country}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${d.coverage_4g_pct}%`, background: getCoverageColor(d.coverage_4g_pct) }} />
                        </div>
                        <span style={{ color: getCoverageColor(d.coverage_4g_pct) }} className="font-semibold">{d.coverage_4g_pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-300">{d.coverage_2g_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
