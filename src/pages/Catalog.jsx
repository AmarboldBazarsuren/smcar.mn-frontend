import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vehicleAPI, fuelTypeKo } from '../services/api'
import CarCard from '../components/CarCard'
import styles from './Catalog.module.css'

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Шинэ эхэнд' },
  { value: 'price',      label: 'Үнэ: бага → их' },
  { value: '-price',     label: 'Үнэ: их → бага' },
  { value: '-year',      label: 'Шинэ он' },
  { value: 'mileage',    label: 'Км бага' },
]

const FUEL_TYPES = ['Gasoline','Diesel','Electric','Hybrid','LPG']
const TRANSMISSIONS = [
  { value: 'Automatic', label: 'Автомат' },
  { value: 'Manual',    label: 'Механик' },
]

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [vehicles, setVehicles]   = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [hasNext, setHasNext]     = useState(false)
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setMore]    = useState(false)
  const [showFilter, setShowFilter] = useState(false)

  const [filters, setFilters] = useState({
    search:       searchParams.get('search') || '',
    brand:        searchParams.get('brand')  || '',
    year_min:     '',
    year_max:     '',
    price_min:    '',
    price_max:    '',
    fuel_type:    '',
    transmission: '',
    sort:         '-createdAt',
  })

  const debounceRef = useRef(null)

  const fetchVehicles = useCallback(async (pageNum = 1, reset = true) => {
    if (reset) setLoading(true)
    else setMore(true)

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
      if (filters.sort)         params.sort         = filters.sort

      const res = await vehicleAPI.list(params)
      const list = res?.data?.vehicles || []
      const pag  = res?.data?.pagination || {}

      if (reset) setVehicles(list)
      else setVehicles(v => [...v, ...list])

      setTotal(pag.total || 0)
      setHasNext(pag.hasNext || false)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setMore(false)
    }
  }, [filters])

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchVehicles(1, true)
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [filters])

  const updateFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({ search:'', brand:'', year_min:'', year_max:'', price_min:'', price_max:'', fuel_type:'', transmission:'', sort:'-createdAt' })
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchVehicles(next, false)
  }

  const activeFilterCount = [
    filters.brand, filters.year_min, filters.year_max,
    filters.price_min, filters.price_max, filters.fuel_type, filters.transmission,
  ].filter(Boolean).length

  return (
    <div className={styles.page}>
      <div className="container">

        {/* ── HEADER ── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Машины каталог</h1>
            {!loading && (
              <p className={styles.pageCount}>
                {total.toLocaleString()} машин олдлоо
              </p>
            )}
          </div>

          {/* Sort + Filter toggle */}
          <div className={styles.controls}>
            <select
              className={styles.sortSelect}
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button
              className={`${styles.filterToggle} ${showFilter ? styles.filterActive : ''}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/>
                <line x1="4" y1="18" x2="12" y2="18"/>
              </svg>
              Шүүлт
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Брэнд, загвар, онцлог хайх..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
            />
            {filters.search && (
              <button className={styles.clearSearch} onClick={() => updateFilter('search', '')}>✕</button>
            )}
          </div>
        </div>

        {/* ── FILTER PANEL ── */}
        {showFilter && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>

              {/* Brand */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Брэнд</label>
                <input className={styles.filterInput} placeholder="Hyundai, Kia..."
                  value={filters.brand} onChange={e => updateFilter('brand', e.target.value)} />
              </div>

              {/* Year */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Он</label>
                <div className={styles.rangeRow}>
                  <input className={styles.filterInput} placeholder="2018" type="number"
                    value={filters.year_min} onChange={e => updateFilter('year_min', e.target.value)} />
                  <span className={styles.rangeSep}>—</span>
                  <input className={styles.filterInput} placeholder="2025" type="number"
                    value={filters.year_max} onChange={e => updateFilter('year_max', e.target.value)} />
                </div>
              </div>

              {/* Price (만원) */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Үнэ (만원)</label>
                <div className={styles.rangeRow}>
                  <input className={styles.filterInput} placeholder="500" type="number"
                    value={filters.price_min} onChange={e => updateFilter('price_min', e.target.value)} />
                  <span className={styles.rangeSep}>—</span>
                  <input className={styles.filterInput} placeholder="5000" type="number"
                    value={filters.price_max} onChange={e => updateFilter('price_max', e.target.value)} />
                </div>
              </div>

              {/* Fuel */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Түлш</label>
                <div className={styles.chipRow}>
                  {FUEL_TYPES.map(f => (
                    <button key={f}
                      className={`${styles.chip} ${filters.fuel_type === f ? styles.chipActive : ''}`}
                      onClick={() => updateFilter('fuel_type', filters.fuel_type === f ? '' : f)}>
                      {fuelTypeKo[f] || f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Хурдны хайрцаг</label>
                <div className={styles.chipRow}>
                  {TRANSMISSIONS.map(t => (
                    <button key={t.value}
                      className={`${styles.chip} ${filters.transmission === t.value ? styles.chipActive : ''}`}
                      onClick={() => updateFilter('transmission', filters.transmission === t.value ? '' : t.value)}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {activeFilterCount > 0 && (
              <button className={styles.resetBtn} onClick={resetFilters}>
                Шүүлт арилгах ({activeFilterCount})
              </button>
            )}
          </div>
        )}

        {/* ── CAR LIST ── */}
        {loading ? (
          <div className="grid-cars" style={{ marginTop: 32 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 360, borderRadius: 18 }} />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🚗</div>
            <h3 className={styles.emptyTitle}>Машин олдсонгүй</h3>
            <p className={styles.emptyText}>Шүүлтийн нөхцлийг өөрчилж үзнэ үү</p>
            <button className={styles.emptyReset} onClick={resetFilters}>Шүүлт арилгах</button>
          </div>
        ) : (
          <>
            <div className="grid-cars" style={{ marginTop: 32 }}>
              {vehicles.map((car, i) => (
                <div key={car._id} className="fade-up" style={{ animationDelay: `${(i % 6) * 0.05}s` }}>
                  <CarCard car={car} />
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasNext && (
              <div className={styles.loadMore}>
                <button
                  className={styles.loadMoreBtn}
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <span className={styles.spinner} />
                  ) : (
                    <>Дараагийн {18} машин</>
                  )}
                </button>
                <p className={styles.loadMoreInfo}>
                  {vehicles.length} / {total.toLocaleString()} машин харуулж байна
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}