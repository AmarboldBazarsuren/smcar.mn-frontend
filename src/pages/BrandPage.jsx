import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { vehicleAPI } from '../services/api'
import CarCard from '../components/CarCard'
import styles from './BrandPage.module.css'

const BRAND_ICONS = {
  'Hyundai': '🇰🇷', 'Kia': '🇰🇷', 'Genesis': '💎',
  'BMW': '🔵', 'Mercedes-Benz': '⭐', 'Audi': '🔘',
  'Volkswagen': '🔵', 'Porsche': '🏎️', 'Volvo': '🔷',
  'Toyota': '🔴', 'Honda': '🔴', 'Lexus': '🔷',
  'Nissan': '🔴', 'Mazda': '🔴',
'Land Rover': '🟢', 'Jaguar': '🐆', 'Mini': '🇬🇧',
  'Tesla': '⚡', 'Ford': '🔵', 'Chevrolet': '🇺🇸',
  'Jeep': '🟢', 'Cadillac': '🎩',
  'Renault': '🇫🇷', 'SsangYong': '🇰🇷',
}

export default function BrandPage() {
  const { brand } = useParams()
  const navigate = useNavigate()
  const decodedBrand = decodeURIComponent(brand)

  const [models, setModels] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeModel, setActiveModel] = useState(null)
  const [sort, setSort] = useState('-createdAt')
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // Загваруудыг авах
  useEffect(() => {
    vehicleAPI.list({ brand: decodedBrand, limit: 200, sort: '-createdAt' }).then(res => {
      const vehicles = res?.data?.vehicles || []
      // Загваруудыг тоогоор нь эрэмбэлэх
      const modelCount = {}
      vehicles.forEach(v => {
        modelCount[v.model] = (modelCount[v.model] || 0) + 1
      })
      const sortedModels = Object.entries(modelCount)
        .sort((a, b) => b[1] - a[1])
        .map(([model, count]) => ({ model, count }))
      setModels(sortedModels)
    }).catch(() => {})
  }, [decodedBrand])

  // Машинуудыг авах
  useEffect(() => {
    setLoading(true)
    setPage(1)
    const params = { brand: decodedBrand, sort, limit: 18 }
    if (activeModel) params.model = activeModel

    vehicleAPI.list(params).then(res => {
      setVehicles(res?.data?.vehicles || [])
      setTotal(res?.data?.pagination?.total || 0)
      setHasNext(res?.data?.pagination?.hasNext || false)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [decodedBrand, activeModel, sort])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    setLoadingMore(true)
    const params = { brand: decodedBrand, sort, limit: 18, page: next }
    if (activeModel) params.model = activeModel

    vehicleAPI.list(params).then(res => {
      setVehicles(v => [...v, ...(res?.data?.vehicles || [])])
      setHasNext(res?.data?.pagination?.hasNext || false)
      setLoadingMore(false)
    }).catch(() => setLoadingMore(false))
  }

  const icon = BRAND_ICONS[decodedBrand] || '🚗'

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Breadcrumb */}
        <nav className={styles.bc}>
          <Link to="/">Нүүр</Link>
          <span>/</span>
          <Link to="/catalog">Машинууд</Link>
          <span>/</span>
          <span>{decodedBrand}</span>
        </nav>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.brandIcon}>{icon}</span>
            <div>
              <h1 className={styles.title}>{decodedBrand}</h1>
              <p className={styles.subtitle}>{total.toLocaleString()} машин байна</p>
            </div>
          </div>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="-createdAt">Шинэ эхэнд</option>
            <option value="price">Үнэ: бага → их</option>
            <option value="-price">Үнэ: их → бага</option>
            <option value="-year">Шинэ он</option>
            <option value="mileage">Явсан зам бага</option>
          </select>
        </div>

        {/* Model filter tabs */}
        {models.length > 0 && (
          <div className={styles.modelTabs}>
            <button
              className={`${styles.modelTab} ${!activeModel ? styles.modelTabActive : ''}`}
              onClick={() => setActiveModel(null)}
            >
              Бүгд
              <span className={styles.modelCount}>{total}</span>
            </button>
            {models.slice(0, 20).map(m => (
              <button
                key={m.model}
                className={`${styles.modelTab} ${activeModel === m.model ? styles.modelTabActive : ''}`}
                onClick={() => {
                  if (activeModel === m.model) setActiveModel(null)
                  else setActiveModel(m.model)
                }}
              >
                {m.model}
                <span className={styles.modelCount}>{m.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Cars grid */}
        {loading ? (
          <div className="car-grid" style={{ marginTop: 24 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: 14 }} />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className={styles.empty}>
            <p>🚗</p>
            <h3>Машин олдсонгүй</h3>
            <button onClick={() => setActiveModel(null)} className={styles.resetBtn}>
              Шүүлт арилгах
            </button>
          </div>
        ) : (
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
                <button
                  className={styles.loadMoreBtn}
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? <span className={styles.spinner} /> : 'Дараагийн машинууд'}
                </button>
                <p className={styles.loadInfo}>{vehicles.length} / {total.toLocaleString()}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}