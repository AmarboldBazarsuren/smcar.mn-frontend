import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { vehicleAPI, fuelTypeLabel, transmissionLabel } from '../services/api'
import CarGallery   from './carDetail/CarGallery'
import CarFeatures  from './carDetail/CarFeatures'
import CarInfoPanel from './carDetail/CarInfoPanel'
import styles from './CarDetail.module.css'

export default function CarDetail() {
  const { id } = useParams()
  const [car,     setCar]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true); setError(null)
    vehicleAPI.getById(id)
      .then(res => { setCar(res?.data || null); setLoading(false) })
      .catch(e  => { setError(String(e));       setLoading(false) })
  }, [id])

  if (loading) return (
    <div className={styles.loadPage}>
      <div className={styles.spin} />
      <p>Ачааллаж байна...</p>
    </div>
  )

  if (error || !car) return (
    <div className={styles.errPage}>
      <span className={styles.errIcon}>🚗</span>
      <h2>Машин олдсонгүй</h2>
      <Link to="/catalog" className={styles.errLink}>← Каталог руу буцах</Link>
    </div>
  )

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
          <h1 className={styles.mainTitle}>
            {car.brand} {car.model}
            {car.badge && <span className={styles.badgeText}> {car.badge}</span>}
          </h1>
          <div className={styles.titleMeta}>
            {car.year && <span className={styles.metaChip}>{car.year}он</span>}
            {car.mileage > 0 && <span className={styles.metaChip}>{car.mileage.toLocaleString()} км</span>}
            {car.fuelType && <span className={styles.metaChip}>{fuelTypeLabel[car.fuelType] || car.fuelType}</span>}
            {car.transmission && <span className={styles.metaChip}>{transmissionLabel[car.transmission] || car.transmission}</span>}
          </div>
        </div>

        {/* Layout */}
        <div className={styles.layout}>

          {/* Left: gallery + features */}
          <div className={styles.galleryCol}>
            <CarGallery car={car} />
            <CarFeatures features={car.features} />
          </div>

          {/* Right: price + spec + history */}
          <CarInfoPanel car={car} />

        </div>
      </div>
    </div>
  )
}