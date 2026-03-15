import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
const IMG_BASE  = process.env.REACT_APP_API_BASE || 'http://localhost:5000'

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken')
      if (window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err.response?.data?.message || err.message || 'Алдаа гарлаа')
  }
)

// ── Public API ──
export const vehicleAPI = {
  list:     params  => api.get('/vehicles',          { params }),
  getById:  id      => api.get(`/vehicles/${id}`),
  featured: (n=8)   => api.get('/vehicles/featured', { params: { limit: n } }),
  stats:    ()      => api.get('/vehicles/stats'),
}

// ── Admin API ──
export const adminAPI = {
  login:         data       => api.post('/admin/login', data),
  getMe:         ()         => api.get('/admin/me'),
  getStats:      ()         => api.get('/admin/stats'),
  listVehicles:  params     => api.get('/admin/vehicles', { params }),
  createVehicle: data       => api.post('/admin/vehicles', data),
  updateVehicle: (id, data) => api.put(`/admin/vehicles/${id}`, data),
  deleteVehicle: id         => api.delete(`/admin/vehicles/${id}`),
  updatePricing: (id, data) => api.put(`/admin/vehicles/${id}/pricing`, data),
  globalRate:    data       => api.post('/admin/pricing/global', data),
  deleteImage:   (id, idx)  => api.delete(`/admin/vehicles/${id}/images/${idx}`),
  setup:         data       => api.post('/admin/setup', data),
}

export const marketAPI = {
  brands:      ()    => api.get('/market/brands'),
  syncStatus:  ()    => api.get('/market/sync/status'),
  triggerSync: ()    => api.post('/market/sync'),
}

// ── Formatters ──
export const formatKRW = won => {
  if (!won) return '—'
  return `₩${Math.round(won / 10000).toLocaleString()}만`
}
export const formatPrice    = formatKRW   // alias

export const formatMNT = mnt => {
  if (!mnt) return '—'
  return `${mnt.toLocaleString()}₮`
}
export const formatPriceMNT = formatMNT   // alias

export const getDisplayPrice = car => {
  if (!car) return '—'
  if (car.totalPriceMnt > 0)             return formatMNT(car.totalPriceMnt)
  if (car.wonToMnt > 0 && car.price > 0) return formatMNT(Math.round(car.price * car.wonToMnt))
  return formatKRW(car.price)
}

export const getPriceBreakdown = car => {
  if (!car?.wonToMnt || !car?.price) return null
  const base  = Math.round(car.price * car.wonToMnt)
  const extra = (car.extraCosts || []).reduce((s, c) => s + (c.amount || 0), 0)
  return { basePriceMnt: base, extraCosts: car.extraCosts || [], totalPriceMnt: base + extra, wonToMnt: car.wonToMnt }
}

export const formatMileage = km => km ? `${km.toLocaleString()} км` : '—'

export const carAge = year => {
  if (!year) return ''
  const a = new Date().getFullYear() - year
  return a === 0 ? 'Шинэ' : `${a} жилтэй`
}

export const fuelTypeLabel = {
  Gasoline: 'Бензин', Diesel: 'Дизель', Electric: 'Цахилгаан', Hybrid: 'Хибрид', LPG: 'Шингэн хий',
}
export const fuelTypeKo = fuelTypeLabel   // alias

export const transmissionLabel = {
  Automatic: 'Автомат', Manual: 'Механик', A: 'Автомат', M: 'Механик',
}
export const transmissionKo = transmissionLabel   // alias

export const fuelColor = {
  Gasoline: '#F59E0B', Diesel: '#3B7AFF', Electric: '#16A34A', Hybrid: '#10B981', LPG: '#8B5CF6',
}

export const getImageUrl = url => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${IMG_BASE}${url}`
}

export default api