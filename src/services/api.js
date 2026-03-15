import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
})

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data?.message || err.message || 'Алдаа гарлаа')
)

// ── Vehicles ──
export const vehicleAPI = {
  list:     (params) => api.get('/vehicles', { params }),
  getById:  (id)     => api.get(`/vehicles/${id}`),
  featured: (limit=8)=> api.get('/vehicles/featured', { params: { limit } }),
  stats:    ()       => api.get('/vehicles/stats'),
}

// ── Market ──
export const marketAPI = {
  brands:     ()      => api.get('/market/brands'),
  models:     (brand) => api.get(`/market/models/${brand}`),
  syncStatus: ()      => api.get('/market/sync/status'),
  triggerSync:()      => api.post('/market/sync'),
}

// ── Helpers ──
export const formatPrice = (won) => {
  if (!won) return '—'
  const man = Math.round(won / 10000)
  return `₩${man.toLocaleString()}만`
}

export const formatPriceMNT = (won) => {
  if (!won) return '—'
  const mnt = Math.round(won * 2.8)
  return `₮${mnt.toLocaleString()}`
}

export const formatMileage = (km) => {
  if (!km) return '—'
  return `${km.toLocaleString()} км`
}

export const carAge = (year) => {
  if (!year) return ''
  const age = new Date().getFullYear() - year
  return age === 0 ? 'Шинэ' : `${age} жилтэй`
}

export const fuelTypeKo = {
  'Gasoline': 'Бензин',
  'Diesel':   'Дизель',
  'Electric': 'Цахилгаан',
  'Hybrid':   'Хибрид',
  'LPG':      'Шингэн хий',
}

export const transmissionKo = {
  'Automatic': 'Автомат',
  'Manual':    'Механик',
  'A':         'Автомат',
  'M':         'Механик',
}

export default api