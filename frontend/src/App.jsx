import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Overview from './pages/Overview'
import Penetration from './pages/Penetration'
import ARPU from './pages/ARPU'
import Churn from './pages/Churn'
import GeoMap from './pages/GeoMap'
import Operators from './pages/Operators'

const PAGES = { overview: Overview, penetration: Penetration, arpu: ARPU, churn: Churn, geo: GeoMap, operators: Operators }

export default function App() {
  const [page, setPage] = useState('overview')
  const Page = PAGES[page]
  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar current={page} onChange={setPage} />
      <main className="flex-1 overflow-y-auto animate-fade-in"><Page /></main>
    </div>
  )
}
