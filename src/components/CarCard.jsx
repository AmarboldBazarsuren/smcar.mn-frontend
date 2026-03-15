import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getDisplayPrice, formatMileage, fuelTypeLabel, transmissionLabel, fuelColor, getImageUrl } from '../services/api'
import styles from './CarCard.module.css'

export default function CarCard({ car }) {
  const [imgErr,    setImgErr]    = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const imgSrc = getImageUrl(car.thumbnailUrl || car.images?.[0]?.url)
  const fc     = fuelColor[car.fuelType] || '#999'

  return (
    <Link to={`/car/${car._id || car.encarId}`} className={styles.card}>
      {/* Image */}
      <div className={styles.imgWrap}>
        {imgSrc && !imgErr ? (
          <>
            {!imgLoaded && <div className={`skeleton ${styles.imgSkel}`}/>}
            <img
              src={imgSrc} alt={car.title}
              className={`${styles.img} ${imgLoaded ? styles.loaded : ''}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgErr(true)}
            />
          </>
        ) : (
          <div className={styles.noImg}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <circle cx="8" cy="13" r="2"/><circle cx="16" cy="13" r="2"/>
              <path d="M6 6l2-3h8l2 3"/>
            </svg>
          </div>
        )}
        <div className={styles.yearTag}>{car.year}</div>
        {car.history?.accidents === 0 && <div className={styles.safeTag}>무사고</div>}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <p className={styles.brand}>{car.brand}</p>
        <p className={styles.model}>{car.model}{car.badge ? ` ${car.badge}` : ''}</p>

        <p className={styles.price}>{getDisplayPrice(car)}</p>

        <div className={styles.specs}>
          <span>{formatMileage(car.mileage)}</span>
          <span className={styles.dot}/>
          <span style={{ color: fc }}>{fuelTypeLabel[car.fuelType] || car.fuelType || '—'}</span>
          {car.transmission && (
            <><span className={styles.dot}/><span>{transmissionLabel[car.transmission] || car.transmission}</span></>
          )}
        </div>
      </div>
    </Link>
  )
}