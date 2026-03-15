import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, formatMileage, fuelTypeKo, transmissionKo } from '../services/api'
import styles from './CarCard.module.css'

export default function CarCard({ car, className = '' }) {
  const [imgErr, setImgErr] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const img = car.thumbnailUrl || car.images?.[0]?.url

  const fuelColors = {
    'Gasoline': '#F59E0B', 'Diesel': '#3B7AFF',
    'Electric': '#22C55E', 'Hybrid': '#10B981', 'LPG': '#8B5CF6',
  }
  const fuelColor = fuelColors[car.fuelType] || 'var(--text-2)'

  return (
    <Link to={`/car/${car._id || car.encarId}`} className={`${styles.card} ${className}`}>
      {/* Image */}
      <div className={styles.imgWrap}>
        {img && !imgErr ? (
          <>
            {!imgLoaded && <div className={`skeleton ${styles.imgSkeleton}`} />}
            <img
              src={img} alt={car.title}
              className={`${styles.img} ${imgLoaded ? styles.imgVisible : ''}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgErr(true)}
            />
          </>
        ) : (
          <div className={styles.imgPlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="16" r="1"/><circle cx="20" cy="16" r="1"/>
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className={styles.badges}>
          {car.history?.accidents === 0 && (
            <span className={styles.badgeSafe}>무사고</span>
          )}
          {car.year && car.year >= new Date().getFullYear() - 1 && (
            <span className={styles.badgeNew}>신차급</span>
          )}
        </div>

        {/* Year pill */}
        <div className={styles.yearPill}>{car.year}</div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <p className={styles.brand}>{car.brand?.toUpperCase()}</p>
        <h3 className={styles.model}>{car.model}
          {car.badge && <span className={styles.badge}> {car.badge}</span>}
        </h3>

        <p className={styles.price}>{formatPrice(car.price)}</p>

        {/* Specs row */}
        <div className={styles.specs}>
          <span className={styles.spec}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>
            </svg>
            {formatMileage(car.mileage)}
          </span>
          <span className={styles.specDot}/>
          <span className={styles.spec} style={{ color: fuelColor }}>
            {fuelTypeKo[car.fuelType] || car.fuelType || '—'}
          </span>
          {car.transmission && (
            <>
              <span className={styles.specDot}/>
              <span className={styles.spec}>
                {transmissionKo[car.transmission] || car.transmission}
              </span>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.location}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {car.location || 'Солонгос'}
          </span>
          <span className={styles.views}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {(car.viewCount || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}