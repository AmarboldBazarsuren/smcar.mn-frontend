import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vehicleAPI, fuelTypeLabel } from '../services/api'
import CarCard from '../components/CarCard'
import styles from './Catalog.module.css'

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Шинэ эхэнд' },
  { value: 'price',      label: 'Үнэ: бага → их' },
  { value: '-price',     label: 'Үнэ: их → бага' },
  { value: '-year',      label: 'Шинэ он эхэнд' },
  { value: 'mileage',    label: 'Явсан зам бага' },
]

const FUEL_TYPES = [
  { v: 'Gasoline', l: 'Бензин' },
  { v: 'Diesel',   l: 'Дизель' },
  { v: 'Electric', l: 'Цахилгаан' },
  { v: 'Hybrid',   l: 'Хибрид' },
  { v: 'LPG',      l: 'Шингэн хий' },
]

const TRANSMISSIONS = [
  { v: 'Automatic', l: 'Автомат' },
  { v: 'Manual',    l: 'Механик' },
]

const BODY_TYPES = [
  { v: 'SUV',       l: 'SUV' },
  { v: 'Sedan',     l: 'Седан' },
  { v: 'Hatchback', l: 'Хэчбэк' },
  { v: 'Wagon',     l: 'Вагон' },
  { v: 'Coupe',     l: 'Купэ' },
  { v: 'Pickup',    l: 'Пикап' },
]

export default function Catalog() {
  const [searchParams] = useSearchParams()
  const [vehicles,    setVehicles]    = useState([])
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [hasNext,     setHasNext]     = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showFilter,  setShowFilter]  = useState(false)

  const [filters, setFilters] = useState({
    search:       searchParams.get('search') || '',
    brand:        searchParams.get('brand')  || '',
    year_min:     '',
    year_max:     '',
    price_min:    '',
    price_max:    '',
    fuel_type:    '',
    transmission: '',
    body_type:    '',
    sort:         '-createdAt',
  })

  const debounceRef = useRef(null)

  const fetchVehicles = useCallback(async (pageNum = 1, reset = true) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = { page: pageNum, limit: 18 }
      if (filters.search)       params.search       = filters.search
      if (filters.brand)        params.brand        = filters.brand
      if (filters.year_min)     params.year_min     = filters.year_min
      if (filters.year_max)     params.year_max     = filters.year_max
      if (filters.price_min)    params.price_min    = parseInt(filters.price_min) * 10000
      if (filters.price_max)    params.price_max    = parseInt(filters.price_max) * 10000
      if (filters.fuel_type)    params.fuel_type    = filters.fuel_type
      if (filters.transmission) params.transmission = filters.transmission
      if (filters.body_type)    params.body_type    = filters.body_type
      if (filters.sort)         params.sort         = filters.sort

      const res  = await vehicleAPI.list(params)
      const list = res?.data?.vehicles || []
      const pag  = res?.data?.pagination || {}

      if (reset) setVehicles(list)
      else       setVehicles(v => [...v, ...list])

      setTotal(pag.total || 0)
      setHasNext(pag.hasNext || false)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchVehicles(1, true)
    }, 380)
    return () => clearTimeout(debounceRef.current)
  }, [filters])

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const toggle = (key, val) => setFilters(f => ({ ...f, [key]: f[key] === val ? '' : val }))

  const resetFilters = () => setFilters({
    search: '', brand: '', year_min: '', year_max: '',
    price_min: '', price_max: '', fuel_type: '',
    transmission: '', body_type: '', sort: '-createdAt',
  })

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchVehicles(next, false)
  }

  const activeCount = [
    filters.brand, filters.year_min, filters.year_max,
    filters.price_min, filters.price_max, filters.fuel_type,
    filters.transmission, filters.body_type,
  ].filter(Boolean).length

  return (
    <div className={styles.page}>
      <div className="container">

        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Машины каталог</h1>
            {!loading && (
              <p className={styles.count}>
                {total.toLocaleString()} машин олдлоо
              </p>
            )}
          </div>
          <div className={styles.controls}>
            <select
              className={styles.sortSelect}
              value={filters.sort}
              onChange={e => set('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              className={`${styles.filterBtn} ${showFilter ? styles.filterBtnActive : ''}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="4" y1="6"  x2="20" y2="6"/>
                <line x1="4" y1="12" x2="16" y2="12"/>
                <line x1="4" y1="18" x2="12" y2="18"/>
              </svg>
              Шүүлт
              {activeCount > 0 && (
                <span className={styles.filterCount}>{activeCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Брэнд, загвар, он хайх..."
              value={filters.search}
              onChange={e => set('search', e.target.value)}
            />
            {filters.search && (
              <button className={styles.clearBtn} onClick={() => set('search', '')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Filter panel ── */}
        {showFilter && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>

              {/* Brand */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Брэнд</label>
                <input
                  className={styles.filterInput}
                  placeholder="Hyundai, Kia, BMW..."
                  value={filters.brand}
                  onChange={e => set('brand', e.target.value)}
                />
              </div>

              {/* Year */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Үйлдвэрлэсэн он</label>
                <div className={styles.rangeRow}>
                  <input
                    className={styles.filterInput}
                    placeholder="2018"
                    type="number"
                    value={filters.year_min}
                    onChange={e => set('year_min', e.target.value)}
                  />
                  <span className={styles.rangeDash}>—</span>
                  <input
                    className={styles.filterInput}
                    placeholder="2025"
                    type="number"
                    value={filters.year_max}
                    onChange={e => set('year_max', e.target.value)}
                  />
                </div>
              </div>

              {/* Price (만원 단위) */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Үнэ (만원)</label>
                <div className={styles.rangeRow}>
                  <input
                    className={styles.filterInput}
                    placeholder="500"
                    type="number"
                    value={filters.price_min}
                    onChange={e => set('price_min', e.target.value)}
                  />
                  <span className={styles.rangeDash}>—</span>
                  <input
                    className={styles.filterInput}
                    placeholder="5000"
                    type="number"
                    value={filters.price_max}
                    onChange={e => set('price_max', e.target.value)}
                  />
                </div>
              </div>

              {/* Fuel */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Түлшний төрөл</label>
                <div className={styles.chips}>
                  {FUEL_TYPES.map(f => (
                    <button
                      key={f.v}
                      className={`${styles.chip} ${filters.fuel_type === f.v ? styles.chipActive : ''}`}
                      onClick={() => toggle('fuel_type', f.v)}
                    >{f.l}</button>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Хурдны хайрцаг</label>
                <div className={styles.chips}>
                  {TRANSMISSIONS.map(t => (
                    <button
                      key={t.v}
                      className={`${styles.chip} ${filters.transmission === t.v ? styles.chipActive : ''}`}
                      onClick={() => toggle('transmission', t.v)}
                    >{t.l}</button>
                  ))}
                </div>
              </div>

              {/* Body type */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Биеийн хэлбэр</label>
                <div className={styles.chips}>
                  {BODY_TYPES.map(b => (
                    <button
                      key={b.v}
                      className={`${styles.chip} ${filters.body_type === b.v ? styles.chipActive : ''}`}
                      onClick={() => toggle('body_type', b.v)}
                    >{b.l}</button>
                  ))}
                </div>
              </div>

            </div>

            {activeCount > 0 && (
              <button className={styles.resetBtn} onClick={resetFilters}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Шүүлт арилгах ({activeCount})
              </button>
            )}
          </div>
        )}

        {/* ── Car list ── */}
        {loading ? (
          <div className="car-grid" style={{ marginTop: 28 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 340, borderRadius: 16 }}/>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🚗</div>
            <h3 className={styles.emptyTitle}>Машин олдсонгүй</h3>
            <p className={styles.emptyText}>Шүүлтийн нөхцлийг өөрчилж үзнэ үү</p>
            {activeCount > 0 && (
              <button className={`btn btn-secondary ${styles.emptyBtn}`} onClick={resetFilters}>
                Шүүлт арилгах
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="car-grid" style={{ marginTop: 28 }}>
              {vehicles.map((car, i) => (
                <div
                  key={car._id}
                  className="fade-up"
                  style={{ animationDelay: `${(i % 9) * 0.04}s` }}
                >
                  <CarCard car={car}/>
                </div>
              ))}
            </div>

            {hasNext && (
              <div className={styles.loadMore}>
                <button
                  className={styles.loadMoreBtn}
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore
                    ? <span className={styles.spinner}/>
                    : <>Дараагийн 18 машин</>
                  }
                </button>
                <p className={styles.loadMoreInfo}>
                  {vehicles.length} / {total.toLocaleString()} машин
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}