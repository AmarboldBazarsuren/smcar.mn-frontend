import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { vehicleAPI, formatPrice, formatPriceMNT, formatMileage, carAge, fuelTypeKo, transmissionKo } from '../services/api'
import styles from './CarDetail.module.css'

export default function CarDetail() {
  const { id }                = useParams()
  const [car, setCar]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setImg]   = useState(0)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    vehicleAPI.getById(id)
      .then(res => { setCar(res?.data || null); setLoading(false) })
      .catch(e  => { setError(String(e)); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingSpinner}/>
      <p>Мэдээлэл ачааллаж байна...</p>
    </div>
  )

  if (error || !car) return (
    <div className={styles.errorPage}>
      <p className={styles.errorIcon}>🚗</p>
      <h2>Машин олдсонгүй</h2>
      <Link to="/catalog" className={styles.backLink}>← Каталог руу буцах</Link>
    </div>
  )

  const images = car.images?.length > 0 ? car.images : []
  const hasImages = images.length > 0

  const openEncar = () => {
    if (car.encarId) window.open(`https://www.encar.com/dc/dc_cardetailview.do?carid=${car.encarId}`, '_blank')
  }

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Нүүр</Link>
          <span>/</span>
          <Link to="/catalog">Машинууд</Link>
          <span>/</span>
          <span>{car.brand} {car.model}</span>
        </nav>

        <div className={styles.layout}>

          {/* ── LEFT: Gallery ── */}
          <div className={styles.gallery}>
            {/* Main image */}
            <div className={styles.mainImg}>
              {hasImages && !images[activeImg]?.imgErr ? (
                <img
                  src={images[activeImg]?.url}
                  alt={car.title}
                  className={styles.mainImgEl}
                  onError={e => { e.target.style.display='none' }}
                />
              ) : (
                <div className={styles.noImg}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
                    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                    <rect x="9" y="11" width="14" height="10" rx="2"/>
                  </svg>
                </div>
              )}

              {/* Status overlay */}
              {car.status === 'sold' && (
                <div className={styles.soldOverlay}>
                  <span>ЗАРАГДСАН</span>
                </div>
              )}

              {/* Safety badge */}
              {car.history?.accidents === 0 && (
                <div className={styles.safetyBadge}>
                  <span>✓</span> 무사고 (Осолгүй)
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className={styles.thumbs}>
                {images.slice(0, 8).map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                    onClick={() => setImg(i)}
                  >
                    <img src={img.url} alt={`Зураг ${i+1}`} />
                  </button>
                ))}
                {images.length > 8 && (
                  <div className={styles.thumbMore}>+{images.length - 8}</div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Info ── */}
          <div className={styles.info}>
            <p className={styles.infoMeta}>
              <span className={styles.infoBrand}>{car.brand?.toUpperCase()}</span>
              <span>{car.year} · {carAge(car.year)}</span>
            </p>
            <h1 className={styles.infoTitle}>{car.model}</h1>
            {car.badge && <p className={styles.infoBadge}>{car.badge}</p>}

            {/* Prices */}
            <div className={styles.priceBox}>
              <div className={styles.priceMain}>{formatPrice(car.price)}</div>
              <div className={styles.priceMNT}>{formatPriceMNT(car.price)} (ойролцоо)</div>
              {car.originalPrice && car.originalPrice > car.price && (
                <div className={styles.priceOld}>{formatPrice(car.originalPrice)}</div>
              )}
            </div>

            {/* Key specs */}
            <div className={styles.keySpecs}>
              <SpecItem label="Явсан зам"  value={formatMileage(car.mileage)} />
              <SpecItem label="Түлшний төрөл" value={fuelTypeKo[car.fuelType] || car.fuelType || '—'} />
              <SpecItem label="Хурдны хайрцаг" value={transmissionKo[car.transmission] || car.transmission || '—'} />
              <SpecItem label="Хөдөлгүүр"  value={car.engineSize || '—'} />
              <SpecItem label="Өнгө"        value={car.color || '—'} />
              <SpecItem label="Байршил"     value={car.location || '—'} />
            </div>

            {/* History */}
            <div className={styles.histBox}>
              <HistItem
                ok={car.history?.accidents === 0}
                label="Осол"
                value={car.history?.accidents === 0 ? '무사고 (Осол байхгүй)' : `${car.history?.accidents} удаа осол`}
              />
              <HistItem
                ok={car.history?.owners <= 1}
                label="Өмчлөгч"
                value={`${car.history?.owners || 1} эзэн`}
              />
              <HistItem
                ok={car.history?.serviceRecords}
                label="Засвар"
                value={car.history?.serviceRecords ? 'Бүртгэлтэй' : 'Мэдээлэлгүй'}
              />
            </div>

            {/* Dealer */}
            {car.dealer?.name && (
              <div className={styles.dealerBox}>
                <p className={styles.dealerLabel}>Дилер</p>
                <div className={styles.dealerInfo}>
                  <div className={styles.dealerAvatar}>🏢</div>
                  <div>
                    <p className={styles.dealerName}>{car.dealer.name}</p>
                    {car.dealer.address && (
                      <p className={styles.dealerAddr}>{car.dealer.address}</p>
                    )}
                  </div>
                  {car.dealer.phone && (
                    <a href={`tel:${car.dealer.phone}`} className={styles.dealerPhone}>
                      📞 {car.dealer.phone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              <button className={styles.actionPrimary} onClick={openEncar}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Encar.com дээр харах
              </button>
              <Link to="/catalog" className={styles.actionSecondary}>
                ← Буцах
              </Link>
            </div>

          </div>
        </div>

        {/* ── Features ── */}
        {car.features?.length > 0 && (
          <div className={styles.featuresSection}>
            <h2 className={styles.featuresTitle}>Тоноглол ба онцлогууд</h2>
            <div className={styles.featuresGrid}>
              {car.features.map((f, i) => (
                <div key={i} className={styles.featureItem}>
                  <span className={styles.featureCheck}>✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function SpecItem({ label, value }) {
  return (
    <div className={styles.specItem}>
      <span className={styles.specLabel}>{label}</span>
      <span className={styles.specValue}>{value}</span>
    </div>
  )
}

function HistItem({ ok, label, value }) {
  return (
    <div className={styles.histItem}>
      <div className={`${styles.histIcon} ${ok ? styles.histOk : styles.histWarn}`}>
        {ok ? '✓' : '!'}
      </div>
      <div>
        <p className={styles.histLabel}>{label}</p>
        <p className={`${styles.histValue} ${ok ? styles.histValueOk : styles.histValueWarn}`}>{value}</p>
      </div>
    </div>
  )
}