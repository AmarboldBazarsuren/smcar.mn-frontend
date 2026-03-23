import { useState, useEffect } from 'react'
import { getImageUrl } from '../../services/api'
import styles from '../CarDetail.module.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000'

export default function CarGallery({ car }) {
  const [activeImg, setImg]    = useState(0)
  const [imgModal,  setModal]  = useState(false)
  const [images,    setImages] = useState([])
  const [loading,   setLoading] = useState(true)

  useEffect(() => {
    setImg(0)
    setImages([])
    setLoading(true)

    if (car.isManual || !car.encarId) {
      const imgs = (car.images || []).map(img => getImageUrl(img.url)).filter(Boolean)
      setImages(imgs)
      setLoading(false)
      return
    }

    fetch(`${API_BASE}/api/images/encar/${car.encarId}/list`)
      .then(r => r.json())
      .then(({ indexes }) => {
        if (!indexes || indexes.length === 0) {
          const fallback = (car.images || []).map(img => getImageUrl(img.url)).filter(Boolean)
          setImages(fallback)
        } else {
          const urls = indexes.map(i =>
            `${API_BASE}/api/images/encar/${car.encarId}/${String(i).padStart(3, '0')}`
          )
          setImages(urls)
        }
        setLoading(false)
      })
      .catch(() => {
        const fallback = (car.images || []).map(img => getImageUrl(img.url)).filter(Boolean)
        setImages(fallback)
        setLoading(false)
      })
  }, [car.encarId, car.isManual])

  useEffect(() => {
    const fn = e => {
      if (e.key === 'ArrowLeft')  setImg(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setImg(i => Math.min(images.length - 1, i + 1))
      if (e.key === 'Escape')     setModal(false)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [images.length])

  const currentUrl = images[activeImg] || null

  return (
    <>
      <div className={styles.galleryWrapper}>

        {/* ── Том зураг ── */}
        <div className={styles.mainImgWrap}>
          {loading ? (
            <div className={styles.noImg}><div className={styles.spin} /></div>
          ) : currentUrl ? (
            <img
              key={currentUrl}
              src={currentUrl}
              alt={car.title}
              className={styles.mainImgEl}
              onClick={() => setModal(true)}
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className={styles.noImg}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1" opacity="0.15">
                <rect x="2" y="6" width="20" height="12" rx="2"/>
                <circle cx="8" cy="13" r="2"/>
                <circle cx="16" cy="13" r="2"/>
                <path d="M6 6l2-3h8l2 3"/>
              </svg>
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                className={`${styles.navBtn} ${styles.navBtnL}`}
                onClick={() => setImg(i => Math.max(0, i - 1))}
                disabled={activeImg === 0}
              >‹</button>
              <button
                className={`${styles.navBtn} ${styles.navBtnR}`}
                onClick={() => setImg(i => Math.min(images.length - 1, i + 1))}
                disabled={activeImg === images.length - 1}
              >›</button>
              <div className={styles.imgCount}>{activeImg + 1} / {images.length}</div>
            </>
          )}

          {car.history?.accidents === 0 && (
            <div className={styles.accBadge}>✓ 무사고 (Осолгүй)</div>
          )}
          {car.status === 'sold' && (
            <div className={styles.soldOverlay}>ЗАРАГДСАН</div>
          )}
        </div>

        {/* ── Thumbnail stack ── */}
        {images.length > 1 && (
          <div className={styles.thumbStack}>
            {images.map((url, i) => (
              <button
                key={i}
                className={`${styles.thumbStackItem} ${activeImg === i ? styles.thumbStackActive : ''}`}
                onClick={() => setImg(i)}
              >
                <img
                  src={url}
                  alt={`${i + 1}`}
                  onError={e => { e.target.parentElement.style.display = 'none' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Fullscreen modal ── */}
      {imgModal && currentUrl && (
        <div className={styles.modal} onClick={() => setModal(false)}>
          <button className={styles.modalClose} onClick={() => setModal(false)}>✕</button>
          <button
            className={`${styles.modalNav} ${styles.modalNavL}`}
            onClick={e => { e.stopPropagation(); setImg(i => Math.max(0, i - 1)) }}
            disabled={activeImg === 0}
          >‹</button>
          <img
            src={currentUrl}
            alt={`${activeImg + 1}`}
            className={styles.modalImg}
            onClick={e => e.stopPropagation()}
          />
          <button
            className={`${styles.modalNav} ${styles.modalNavR}`}
            onClick={e => { e.stopPropagation(); setImg(i => Math.min(images.length - 1, i + 1)) }}
            disabled={activeImg === images.length - 1}
          >›</button>
          <div className={styles.modalCount}>{activeImg + 1} / {images.length}</div>
        </div>
      )}
    </>
  )
}