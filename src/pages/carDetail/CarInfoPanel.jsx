import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatMNT, formatKRW, getPriceBreakdown, formatMileage, carAge, fuelTypeLabel, transmissionLabel } from '../../services/api'
import { PRow, SpecRow, HistItem } from './carDetailHelpers'
import styles from '../CarDetail.module.css'

const MESSENGER = 'YOUR_PAGE_ID'
const WHATSAPP  = '976XXXXXXXX'

export default function CarInfoPanel({ car }) {
  const breakdown = getPriceBreakdown(car)

  return (
    <div className={styles.infoCol}>
      <PriceCard car={car} breakdown={breakdown} />
      <SpecCard  car={car} />
      <HistCard  car={car} />
      {car.encarId && !car.isManual && (
        <div className={styles.vinCard}>
          <span className={styles.vinLabel}>ENCAR ID</span>
          <span className={styles.vinValue}>{car.encarId}</span>
        </div>
      )}
    </div>
  )
}

function PriceCard({ car, breakdown }) {
  const [open, setOpen] = useState(false)
  const carLabel = `${car.brand} ${car.model}${car.badge ? ' ' + car.badge : ''} ${car.year}`
  const msg = encodeURIComponent(`Сайн байна уу!\n🚗 ${carLabel}\nEncar ID: ${car.encarId}`)

  return (
    <div className={styles.priceCard}>
      <div className={styles.priceTop}>
        <div>
          <div className={styles.priceMnt}>
            {breakdown ? formatMNT(breakdown.totalPriceMnt) : formatKRW(car.price)}
          </div>
          <div className={styles.priceKrw}>
            {breakdown ? `Солонгос үнэ: ${formatKRW(car.price)}` : 'Солонгос вон'}
          </div>
        </div>
        {breakdown && <div className={styles.priceBadge}>MNT</div>}
      </div>

      {breakdown && (
        <>
          <div className={styles.priceDivider} />
          <div className={styles.priceBreakdown}>
            <PRow label={`Үндсэн үнэ (×${breakdown.wonToMnt}₮)`} value={formatMNT(breakdown.basePriceMnt)} />
            {breakdown.extraCosts.map((c, i) => (
              <PRow key={i} label={c.label} value={formatMNT(c.amount)} />
            ))}
            <PRow label="Нийт дүн" value={formatMNT(breakdown.totalPriceMnt)} total />
          </div>
        </>
      )}

      {car.adminNote && (
        <div className={styles.adminNote}>ℹ️ {car.adminNote}</div>
      )}

      <button className={styles.orderBtn} onClick={() => setOpen(v => !v)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        Захиалах
      </button>

      {open && (
        <div className={styles.orderPanel}>
          <div className={styles.orderPanelTitle}>Холбоо барих</div>
          <a href={`https://m.me/${MESSENGER}?text=${msg}`} target="_blank" rel="noopener noreferrer" className={styles.messengerBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.905 1.408 5.504 3.623 7.22V21l3.323-1.83c.888.246 1.83.378 2.804.378 5.523 0 10-4.145 10-9.245S17.523 2 12 2zm1.07 12.458l-2.543-2.714-4.963 2.714 5.461-5.8 2.605 2.714 4.9-2.714-5.46 5.8z"/>
            </svg>
            Messenger
          </a>
          <a href={`https://wa.me/${WHATSAPP}?text=${msg}`} target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35C8.45 21.51 10.19 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
            WhatsApp
          </a>
          <div className={styles.orderCarInfo}>
            <span className={styles.orderCarLabel}>Машин:</span>
            <span className={styles.orderCarValue}>{carLabel}</span>
            {car.encarId && !car.isManual && <>
              <span className={styles.orderCarLabel}>ID:</span>
              <span className={styles.orderCarValue}>{car.encarId}</span>
            </>}
          </div>
        </div>
      )}

      {!car.isManual && car.encarId && (
        <button className={styles.encarBtn}
          onClick={() => window.open(`https://www.encar.com/dc/dc_cardetailview.do?carid=${car.encarId}`, '_blank')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Encar дээр харах
        </button>
      )}
      <Link to="/catalog" className={styles.backBtn}>← Жагсаалт руу буцах</Link>
    </div>
  )
}

function SpecCard({ car }) {
  return (
    <div className={styles.specCard}>
      <div className={styles.cardTitle}>Машины мэдээлэл</div>
      <div className={styles.specGrid}>
        <SpecRow label="Брэнд"       value={car.brand} />
        <SpecRow label="Загвар"      value={car.model} />
        <SpecRow label="Хувилбар"    value={car.badge} />
        <SpecRow label="Он"          value={car.year ? `${car.year}он (${carAge(car.year)})` : null} />
        <SpecRow label="Явсан зам"   value={formatMileage(car.mileage)} />
        <SpecRow label="Түлш"        value={fuelTypeLabel[car.fuelType] || car.fuelType} />
        <SpecRow label="Хурдны хайрцаг" value={transmissionLabel[car.transmission] || car.transmission} />
        <SpecRow label="Хөдөлгүүр"   value={car.engineSize} />
        <SpecRow label="Биеийн хэлбэр" value={car.bodyType} />
        <SpecRow label="Өнгө"        value={car.color} />
        <SpecRow label="Байршил"     value={car.location} />
        <SpecRow label="Дилер"       value={car.dealer?.name} />
      </div>
    </div>
  )
}

function HistCard({ car }) {
  return (
    <div className={styles.histCard}>
      <div className={styles.cardTitle}>Машины түүх</div>
      <div className={styles.histGrid}>
        <HistItem
          ok={car.history?.accidents === 0}
          label="Осол"
          value={car.history?.accidents === 0 ? 'Осолгүй' : `${car.history?.accidents || 0} удаа`}
        />
        <HistItem
          ok={(car.history?.owners || 1) <= 1}
          label="Өмчлөгч"
          value={`${car.history?.owners || 1} эзэн`}
        />
        <HistItem
          ok={!!car.history?.serviceRecords}
          label="Засварын бүртгэл"
          value={car.history?.serviceRecords ? 'Бүртгэлтэй' : 'Мэдээлэлгүй'}
        />
      </div>
    </div>
  )
}