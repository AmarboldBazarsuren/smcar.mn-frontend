import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  vehicleAPI, getDisplayPrice, formatMNT, formatKRW,
  formatMileage, carAge, fuelTypeLabel, transmissionLabel,
  getPriceBreakdown, getImageUrl,
} from '../services/api'
import styles from './CarDetail.module.css'

export default function CarDetail() {
  const { id } = useParams()
  const [car, setCar]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [activeImg, setImg]   = useState(0)
  const [imgModal, setModal]  = useState(false)
  const thumbsRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setImg(0)
    vehicleAPI.getById(id)
      .then(res => { setCar(res?.data || null); setLoading(false) })
      .catch(e  => { setError(String(e));       setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!car) return
    const fn = e => {
      if (e.key === 'ArrowLeft')  setImg(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setImg(i => Math.min((car.images?.length || 1) - 1, i + 1))
      if (e.key === 'Escape')     setModal(false)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [car])

  if (loading) return (
    <div className={styles.loadPage}>
      <div className={styles.spin}/><p>Ачааллаж байна...</p>
    </div>
  )
  if (error || !car) return (
    <div className={styles.errPage}>
      <span className={styles.errIcon}>🚗</span>
      <h2>Машин олдсонгүй</h2>
      <Link to="/catalog" className={styles.errLink}>← Каталог руу буцах</Link>
    </div>
  )

  const images    = car.images || []
  const breakdown = getPriceBreakdown(car)
  const featureGroups = groupFeatures(car.features || [])

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Breadcrumb */}
        <nav className={styles.bc}>
          <Link to="/">Нүүр</Link>
          <span className={styles.bcSep}>/</span>
          <Link to="/catalog">Машинууд</Link>
          <span className={styles.bcSep}>/</span>
          <span>{car.brand} {car.model}</span>
        </nav>

        {/* Title */}
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.mainTitle}>
              {car.brand} {car.model}
              {car.badge ? <span className={styles.badgeText}> {car.badge}</span> : ''}
            </h1>
            <div className={styles.titleMeta}>
              {car.year && <span>{car.year}он</span>}
              {car.mileage > 0 && <><span className={styles.metaDot}>·</span><span>{car.mileage.toLocaleString()}km</span></>}
              {car.fuelType && <><span className={styles.metaDot}>·</span><span>{fuelTypeLabel[car.fuelType] || car.fuelType}</span></>}
              {car.transmission && <><span className={styles.metaDot}>·</span><span>{transmissionLabel[car.transmission] || car.transmission}</span></>}
              {car.engineSize && <><span className={styles.metaDot}>·</span><span>{car.engineSize}</span></>}
            </div>
          </div>
        </div>

        <div className={styles.layout}>

          {/* Gallery */}
          <div className={styles.galleryCol}>

            <div className={styles.mainImgWrap}>
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[activeImg]?.url)}
                  alt={car.title}
                  className={styles.mainImgEl}
                  onClick={() => setModal(true)}
                  onError={e => { e.target.style.display='none' }}
                />
              ) : (
                <div className={styles.noImg}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15">
                    <rect x="2" y="6" width="20" height="12" rx="2"/>
                    <circle cx="8" cy="13" r="2"/><circle cx="16" cy="13" r="2"/>
                    <path d="M6 6l2-3h8l2 3"/>
                  </svg>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button className={`${styles.navBtn} ${styles.navBtnL}`}
                    onClick={() => setImg(i => Math.max(0, i-1))} disabled={activeImg === 0}>‹</button>
                  <button className={`${styles.navBtn} ${styles.navBtnR}`}
                    onClick={() => setImg(i => Math.min(images.length-1, i+1))} disabled={activeImg === images.length-1}>›</button>
                  <div className={styles.imgCount}>{activeImg+1} / {images.length}</div>
                </>
              )}

              {car.history?.accidents === 0 && (
                <div className={styles.accBadge}>✓ 무사고 (Осолгүй)</div>
              )}
              {car.status === 'sold' && (
                <div className={styles.soldOverlay}>ЗАРАГДСАН</div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className={styles.thumbGrid} ref={thumbsRef}>
                {images.map((img, i) => (
                  <button key={i}
                    className={`${styles.thumb} ${activeImg === i ? styles.thumbOn : ''}`}
                    onClick={() => setImg(i)}>
                    <img
                      src={getImageUrl(img.url)}
                      alt={i+1}
                      onError={e => e.target.style.display='none'}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Features */}
            {car.features?.length > 0 && (
              <div className={styles.featuresSection}>
                <h2 className={styles.sectionTitle}>Тоноглол ба онцлогууд</h2>
                {featureGroups.length > 0 ? (
                  featureGroups.map((g, gi) => (
                    <div key={gi} className={styles.featGroup}>
                      {g.title && <h3 className={styles.featGroupTitle}>{g.title}</h3>}
                      <div className={styles.featGrid}>
                        {g.items.map((f, fi) => (
                          <div key={fi} className={styles.featItem}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.featGrid}>
                    {car.features.map((f, i) => (
                      <div key={i} className={styles.featItem}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className={styles.infoCol}>

            <div className={styles.priceCard}>
              {breakdown ? (
                <>
                  <div className={styles.priceMain}>{formatMNT(breakdown.totalPriceMnt)}</div>
                  <div className={styles.priceLabel}>Нийт үнэ (Монгол төгрөг)</div>
                  <div className={styles.priceDivider}/>
                  <div className={styles.priceBreak}>
                    <PRow l={`${breakdown.wonToMnt}₮ (ханш)`} v={formatMNT(breakdown.basePriceMnt)}/>
                    {breakdown.extraCosts.map((c, i) => (
                      <PRow key={i} l={c.label} v={formatMNT(c.amount)}/>
                    ))}
                    <PRow l="Нийт дүн" v={formatMNT(breakdown.totalPriceMnt)} total/>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.priceMain}>{formatKRW(car.price)}</div>
                  <div className={styles.priceLabel}>Солонгос вон</div>
                </>
              )}

              {car.adminNote && (
                <div className={styles.adminNote}>ℹ️ {car.adminNote}</div>
              )}

              {!car.isManual && car.encarId && (
                <button className={styles.encarBtn}
                  onClick={() => window.open('https://www.encar.com/dc/dc_cardetailview.do?carid=' + car.encarId, '_blank')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Encar.com дээр үзэх
                </button>
              )}
              <Link to="/catalog" className={styles.backBtn}>← Жагсаалт руу буцах</Link>
            </div>

            <div className={styles.specCard}>
              <h2 className={styles.specTitle}>Машины мэдээлэл</h2>
              <div className={styles.specTable}>
                <SpecRow l="Брэнд"           v={car.brand}/>
                <SpecRow l="Загвар"          v={car.model}/>
                {car.badge && <SpecRow l="Badge" v={car.badge}/>}
                <SpecRow l="Он"              v={car.year ? `${car.year}он (${carAge(car.year)})` : '—'}/>
                <SpecRow l="Явсан зам"       v={formatMileage(car.mileage)}/>
                <SpecRow l="Түлшний төрөл"  v={fuelTypeLabel[car.fuelType] || car.fuelType || '—'}/>
                <SpecRow l="Хурдны хайрцаг" v={transmissionLabel[car.transmission] || car.transmission || '—'}/>
                <SpecRow l="Хөдөлгүүр"      v={car.engineSize || '—'}/>
                <SpecRow l="Биеийн хэлбэр"  v={car.bodyType || '—'}/>
                <SpecRow l="Өнгө"            v={car.color || '—'}/>
                {car.doors && <SpecRow l="Хаалганы тоо" v={`${car.doors} хаалга`}/>}
                {car.seats && <SpecRow l="Суудлын тоо"  v={`${car.seats} суудал`}/>}
                <SpecRow l="Байршил"         v={car.location || '—'}/>
              </div>
            </div>

            <div className={styles.histCard}>
              <h2 className={styles.specTitle}>Машины түүх</h2>
              <div className={styles.histRow}>
                <HistItem ok={car.history?.accidents === 0} label="Осолын түүх"
                  value={car.history?.accidents === 0 ? 'Осол байгаагүй' : `${car.history?.accidents || 0} удаа осол`}/>
                <HistItem ok={(car.history?.owners || 1) <= 1} label="Өмчлөгч"
                  value={`${car.history?.owners || 1} эзэн`}/>
                <HistItem ok={!!car.history?.serviceRecords} label="Засварын бүртгэл"
                  value={car.history?.serviceRecords ? 'Бүртгэлтэй' : 'Мэдээлэлгүй'}/>
              </div>
            </div>

            {car.encarId && !car.isManual && (
              <div className={styles.vinCard}>
                <span className={styles.vinLabel}>Encar ID</span>
                <span className={styles.vinVal}>{car.encarId}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {imgModal && images.length > 0 && (
        <div className={styles.modal} onClick={() => setModal(false)}>
          <button className={styles.modalClose} onClick={() => setModal(false)}>✕</button>
          <button className={`${styles.modalNav} ${styles.modalNavL}`}
            onClick={e => { e.stopPropagation(); setImg(i => Math.max(0,i-1)) }} disabled={activeImg===0}>‹</button>
          <img src={getImageUrl(images[activeImg]?.url)} alt={activeImg+1}
            className={styles.modalImg} onClick={e => e.stopPropagation()}/>
          <button className={`${styles.modalNav} ${styles.modalNavR}`}
            onClick={e => { e.stopPropagation(); setImg(i => Math.min(images.length-1,i+1)) }}
            disabled={activeImg===images.length-1}>›</button>
          <div className={styles.modalCount}>{activeImg+1} / {images.length}</div>
        </div>
      )}
    </div>
  )
}

function PRow({ l, v, total }) {
  return (
    <div className={`${styles.pRow} ${total ? styles.pRowTotal : ''}`}>
      <span>{l}</span><span>{v}</span>
    </div>
  )
}
function SpecRow({ l, v }) {
  return (
    <div className={styles.specRow}>
      <span className={styles.specL}>{l}</span>
      <span className={styles.specV}>{v}</span>
    </div>
  )
}
function HistItem({ ok, label, value }) {
  return (
    <div className={styles.histItem}>
      <div className={ok ? styles.histOk : styles.histWarn}>{ok ? '✓' : '!'}</div>
      <div>
        <p className={styles.histLabel}>{label}</p>
        <p className={`${styles.histVal} ${ok ? styles.histValOk : styles.histValWarn}`}>{value}</p>
      </div>
    </div>
  )
}
function groupFeatures(features) {
  if (!features || features.length === 0) return []
  const GROUPS = [
    { title: 'Гадна тал, Дотор салон', keywords: ['гэрэл','толь','обуд','дугуй','спойлер','боёлт','бүрхэвч','цонх','хаалга','луунги','хүрд','салон','арьс','суудал','хөшиг'] },
    { title: 'Аюулгүй байдал', keywords: ['аюул','airbag','abs','эвс','esp','tcs','камер','зорчигч','дохиолол','хяналт','мэдрэгч','tpms'] },
    { title: 'Тав тух, Мультимедиа', keywords: ['навигац','bluetooth','usb','дуу','аудио','дулаан','хөргөлт','агаар','wifi','экран','монитор','хаалт'] },
  ]
  const used = new Set()
  const result = []
  GROUPS.forEach(g => {
    const items = features.filter((f, i) => {
      if (used.has(i)) return false
      const fl = f.toLowerCase()
      return g.keywords.some(k => fl.includes(k))
    })
    items.forEach(f => used.add(features.indexOf(f)))
    if (items.length > 0) result.push({ title: g.title, items })
  })
  const rest = features.filter((_, i) => !used.has(i))
  if (rest.length > 0) result.push({ title: '', items: rest })
  return result
}