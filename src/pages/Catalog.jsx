import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { vehicleAPI } from '../services/api'
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
  // 'grouped' = брэндээр ангилсан, 'grid' = бүгд нэг grid
  const [viewMode,    setViewMode]    = useState('grouped')

  const [filters, setFilters] = useState({
    search:       searchParams.get('search')       || '',
    brand:        searchParams.get('brand')        || '',
    year_min:     '',
    year_max:     '',
    price_min:    '',
    price_max:    '',
    fuel_type:    searchParams.get('fuel_type')    || '',
    transmission: searchParams.get('transmission') || '',
    body_type:    searchParams.get('body_type')    || '',
    sort:         '-createdAt',
  })

  const debounceRef = useRef(null)
  const hasActiveFilter = !!(filters.search || filters.brand || filters.year_min ||
    filters.year_max || filters.price_min || filters.price_max ||
    filters.fuel_type || filters.transmission || filters.body_type)

  const fetchVehicles = useCallback(async (pageNum = 1, reset = true) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)
    try {
      const params = { page: pageNum, limit: 36, sort: filters.sort }
      if (filters.search)       params.search       = filters.search
      if (filters.brand)        params.brand        = filters.brand
      if (filters.year_min)     params.year_min     = filters.year_min
      if (filters.year_max)     params.year_max     = filters.year_max
      if (filters.price_min)    params.price_min    = parseInt(filters.price_min) * 10000
      if (filters.price_max)    params.price_max    = parseInt(filters.price_max) * 10000
      if (filters.fuel_type)    params.fuel_type    = filters.fuel_type
      if (filters.transmission) params.transmission = filters.transmission
      if (filters.body_type)    params.body_type    = filters.body_type

      const res  = await vehicleAPI.list(params)
      const list = res?.data?.vehicles || []
      const pag  = res?.data?.pagination || {}

      if (reset) setVehicles(list)
      else       setVehicles(v => [...v, ...list])
      setTotal(pag.total || 0)
      setHasNext(pag.hasNext || false)
    } catch (e) { console.error(e) }
    finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setPage(1); fetchVehicles(1, true) }, 380)
    return () => clearTimeout(debounceRef.current)
  }, [filters])

  // Filter өөрчлөгдөхөд filter байгаа бол grid горим руу шилжих
  useEffect(() => {
    if (hasActiveFilter) setViewMode('grid')
    else setViewMode('grouped')
  }, [hasActiveFilter])

  const set    = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const toggle = (key, val) => setFilters(f => ({ ...f, [key]: f[key] === val ? '' : val }))
  const resetFilters = () => setFilters({
    search: '', brand: '', year_min: '', year_max: '',
    price_min: '', price_max: '', fuel_type: '',
    transmission: '', body_type: '', sort: '-createdAt',
  })

  const loadMore = () => {
    const next = page + 1; setPage(next); fetchVehicles(next, false)
  }

  const activeCount = [
    filters.brand, filters.year_min, filters.year_max,
    filters.price_min, filters.price_max, filters.fuel_type,
    filters.transmission, filters.body_type,
  ].filter(Boolean).length

  // Брэндээр ангилах
  const groupedByBrand = (() => {
    if (viewMode !== 'grouped') return {}
    const groups = {}
    vehicles.forEach(car => {
      const b = car.brand || 'Бусад'
      if (!groups[b]) groups[b] = []
      groups[b].push(car)
    })
    return Object.entries(groups)
      .sort((a, b) => b[1].length - a[1].length)
  })()

  const pageTitle = (() => {
    if (filters.body_type) return BODY_TYPES.find(b => b.v === filters.body_type)?.l + ' машинууд'
    if (filters.fuel_type) return FUEL_TYPES.find(f => f.v === filters.fuel_type)?.l + ' машинууд'
    if (filters.brand)     return filters.brand + ' машинууд'
    if (filters.search)    return `"${filters.search}" хайлт`
    return 'Машины каталог'
  })()

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{pageTitle}</h1>
            {!loading && <p className={styles.count}>{total.toLocaleString()} машин</p>}
          </div>
          <div className={styles.controls}>
            {/* View toggle — зөвхөн filter байхгүй үед */}
            {!hasActiveFilter && (
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'grouped' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('grouped')}
                  title="Брэндээр ангилах"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                </button>
                <button
                  className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Бүгдийг харах"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </button>
              </div>
            )}
            <select className={styles.sortSelect} value={filters.sort} onChange={e => set('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              className={`${styles.filterBtn} ${showFilter ? styles.filterBtnActive : ''}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="4" y1="12" x2="16" y2="12"/>
                <line x1="4" y1="18" x2="12" y2="18"/>
              </svg>
              Шүүлт
              {activeCount > 0 && <span className={styles.filterCount}>{activeCount}</span>}
            </button>
          </div>
        </div>

        {/* Active filter badges */}
        {activeCount > 0 && (
          <div className={styles.activeBadges}>
            {filters.brand     && <Badge label={filters.brand} onRemove={() => set('brand', '')} />}
            {filters.body_type && <Badge label={BODY_TYPES.find(b => b.v === filters.body_type)?.l || filters.body_type} onRemove={() => set('body_type', '')} />}
            {filters.fuel_type && <Badge label={FUEL_TYPES.find(f => f.v === filters.fuel_type)?.l || filters.fuel_type} onRemove={() => set('fuel_type', '')} />}
            {filters.transmission && <Badge label={filters.transmission === 'Automatic' ? 'Автомат' : 'Механик'} onRemove={() => set('transmission', '')} />}
            {(filters.year_min || filters.year_max) && <Badge label={`${filters.year_min || ''}–${filters.year_max || ''} он`} onRemove={() => { set('year_min', ''); set('year_max', '') }} />}
            <button className={styles.clearAll} onClick={resetFilters}>Бүгдийг арилгах</button>
          </div>
        )}

        {/* Search */}
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
              <button className={styles.clearBtn} onClick={() => set('search', '')}>✕</button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Брэнд</label>
                <input className={styles.filterInput} placeholder="Hyundai, Kia, BMW..." value={filters.brand} onChange={e => set('brand', e.target.value)} />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Үйлдвэрлэсэн он</label>
                <div className={styles.rangeRow}>
                  <input className={styles.filterInput} placeholder="2018" type="number" value={filters.year_min} onChange={e => set('year_min', e.target.value)} />
                  <span className={styles.rangeDash}>—</span>
                  <input className={styles.filterInput} placeholder="2025" type="number" value={filters.year_max} onChange={e => set('year_max', e.target.value)} />
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Үнэ (万원)</label>
                <div className={styles.rangeRow}>
                  <input className={styles.filterInput} placeholder="500" type="number" value={filters.price_min} onChange={e => set('price_min', e.target.value)} />
                  <span className={styles.rangeDash}>—</span>
                  <input className={styles.filterInput} placeholder="5000" type="number" value={filters.price_max} onChange={e => set('price_max', e.target.value)} />
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Түлшний төрөл</label>
                <div className={styles.chips}>
                  {FUEL_TYPES.map(f => <button key={f.v} className={`${styles.chip} ${filters.fuel_type === f.v ? styles.chipActive : ''}`} onClick={() => toggle('fuel_type', f.v)}>{f.l}</button>)}
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Хурдны хайрцаг</label>
                <div className={styles.chips}>
                  {TRANSMISSIONS.map(t => <button key={t.v} className={`${styles.chip} ${filters.transmission === t.v ? styles.chipActive : ''}`} onClick={() => toggle('transmission', t.v)}>{t.l}</button>)}
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Биеийн хэлбэр</label>
                <div className={styles.chips}>
                  {BODY_TYPES.map(b => <button key={b.v} className={`${styles.chip} ${filters.body_type === b.v ? styles.chipActive : ''}`} onClick={() => toggle('body_type', b.v)}>{b.l}</button>)}
                </div>
              </div>
            </div>
            {activeCount > 0 && (
              <button className={styles.resetBtn} onClick={resetFilters}>Шүүлт арилгах ({activeCount})</button>
            )}
          </div>
        )}

        {/* ── Car list ── */}
        {loading ? (
          <div className="car-grid" style={{ marginTop: 24 }}>
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 14 }} />)}
          </div>
        ) : vehicles.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🚗</div>
            <h3>Машин олдсонгүй</h3>
            <p>Шүүлтийн нөхцлийг өөрчилж үзнэ үү</p>
            {activeCount > 0 && <button className={styles.emptyBtn} onClick={resetFilters}>Шүүлт арилгах</button>}
          </div>
        ) : viewMode === 'grouped' ? (
          /* ── GROUPED VIEW: брэндээр ангилсан ── */
          <div className={styles.groupedView}>
            {groupedByBrand.map(([brand, cars]) => (
              <div key={brand} className={styles.brandSection}>
                <div className={styles.brandSectionHeader}>
                  <h2 className={styles.brandSectionTitle}>{brand}</h2>
                  <span className={styles.brandSectionCount}>{cars.length} машин</span>
                  <Link
                    to={`/catalog/${encodeURIComponent(brand)}`}
                    className={styles.brandSectionLink}
                  >
                    Бүгдийг харах →
                  </Link>
                </div>
                <div className="car-grid">
                  {cars.slice(0, 4).map((car, i) => (
                    <div key={car._id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                      <CarCard car={car} />
                    </div>
                  ))}
                </div>
                {cars.length > 4 && (
                  <div className={styles.brandSeeMore}>
                    <Link to={`/catalog/${encodeURIComponent(brand)}`} className={styles.seeMoreBtn}>
                      + {cars.length - 4} машин дэлгэрэнгүй харах
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {hasNext && (
              <div className={styles.loadMore}>
                <button className={styles.loadMoreBtn} onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? <span className={styles.spinner}/> : 'Дараагийн брэндүүд'}
                </button>
                <p className={styles.loadMoreInfo}>{vehicles.length} / {total.toLocaleString()}</p>
              </div>
            )}
          </div>
        ) : (
          /* ── GRID VIEW: бүгд нэг grid ── */
          <>
            <div className="car-grid" style={{ marginTop: 24 }}>
              {vehicles.map((car, i) => (
                <div key={car._id} className="fade-up" style={{ animationDelay: `${(i % 9) * 0.04}s` }}>
                  <CarCard car={car} />
                </div>
              ))}
            </div>
            {hasNext && (
              <div className={styles.loadMore}>
                <button className={styles.loadMoreBtn} onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? <span className={styles.spinner}/> : 'Дараагийн машинууд'}
                </button>
                <p className={styles.loadMoreInfo}>{vehicles.length} / {total.toLocaleString()}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Badge({ label, onRemove }) {
  return (
    <span className={styles.badge}>
      {label}
      <button onClick={onRemove}>×</button>
    </span>
  )
}