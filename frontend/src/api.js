import axios from 'axios'
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const api = {
  health:      ()        => axios.get(`${BASE}/health`).then(r => r.data),
  stats:       ()        => axios.get(`${BASE}/stats`).then(r => r.data),
  overview:    (year)    => axios.get(`${BASE}/overview`, { params: { year } }).then(r => r.data),
  penetration: (country) => axios.get(`${BASE}/penetration`, { params: { country } }).then(r => r.data),
  arpu:        (p)       => axios.get(`${BASE}/arpu`, { params: p }).then(r => r.data),
  churn:       (country) => axios.get(`${BASE}/churn`, { params: { country } }).then(r => r.data),
  marketShare: (p)       => axios.get(`${BASE}/market-share`, { params: p }).then(r => r.data),
  geo:         (year)    => axios.get(`${BASE}/geo`, { params: { year } }).then(r => r.data),
  operators:   ()        => axios.get(`${BASE}/operators`).then(r => r.data),
  trends:      (metric)  => axios.get(`${BASE}/trends`, { params: { metric } }).then(r => r.data),
}
