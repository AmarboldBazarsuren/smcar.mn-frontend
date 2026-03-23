/**
 * CarInfoPanel.jsx
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  formatMNT, formatKRW,
  getPriceBreakdown,
  formatMileage, carAge,
  fuelTypeLabel, transmissionLabel,
} from '../../services/api'
import { PRow, SpecRow, HistItem } from './carDetailHelpers'
import styles from '../CarDetail.module.css'

// ── Таны мэдээллүүд ──
const MESSENGER_PAGE_ID = 'YOUR_PAGE_ID'   // ← Facebook Page ID солино
const WHATSAPP_NUMBER   = '976XXXXXXXX'    // ← WhatsApp дугаар солино (+ тэмдэггүй)

export default function CarInfoPanel({ car }) {
  const breakdown = getPriceBreakdown(car)

  return (
    <div className={styles.infoCol}>
      <PriceCard car={car} breakdown={breakdown} />
      <SpecCard car={car} />
      <HistCard car={car} />
      {car.encarId && !car.isManual && (
        <div className={styles.vinCard}>
          <span className={styles.vinLabel}>Encar ID</span>
          <span className={styles.vinVal}>{car.encarId}</span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Үнийн карт + Захиалах товч
// ─────────────────────────────────────────
function PriceCard({ car, breakdown }) {
  const [orderOpen, setOrderOpen] = useState(false)

  const carLabel = `${car.brand} ${car.model}${car.badge ? ' ' + car.badge : ''} ${car.year}`
  const msgText  = encodeURIComponent(
    `Сайн байна уу! Дараах машиныг захиалмаар байна:\n🚗 ${carLabel}\nEncar ID: ${car.encarId}`
  )

  return (
    <div className={styles.priceCard}>
      {breakdown ? (
        <>
          <div className={styles.priceMain}>{formatMNT(breakdown.totalPriceMnt)}</div>
          <div className={styles.priceLabel}>Нийт үнэ (Монгол төгрөг)</div>
          <div className={styles.priceDivider} />
          <div className={styles.priceBreak}>
            <PRow l={`${breakdown.wonToMnt}₮ (ханш)`} v={formatMNT(breakdown.basePriceMnt)} />
            {breakdown.extraCosts.map((c, i) => (
              <PRow key={i} l={c.label} v={formatMNT(c.amount)} />
            ))}
            <PRow l="Нийт дүн" v={formatMNT(breakdown.totalPriceMnt)} total />
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

      {/* Захиалах товч */}
      <button
        className={styles.orderBtn}
        onClick={() => setOrderOpen(v => !v)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        Захиалах
      </button>

      {/* Холбоо барих хэсэг */}
      {orderOpen && (
        <div className={styles.orderPanel}>
          <p className={styles.orderTitle}>Холбоо барих</p>

          <a
            href={`https://m.me/${MESSENGER_PAGE_ID}?text=${msgText}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.messengerBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.905 1.408 5.504 3.623 7.22V21l3.323-1.83c.888.246 1.83.378 2.804.378 5.523 0 10-4.145 10-9.245S17.523 2 12 2zm1.07 12.458l-2.543-2.714-4.963 2.714 5.461-5.8 2.605 2.714 4.9-2.714-5.46 5.8z"/>
            </svg>
            Messenger-ээр захиалах
          </a>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msgText}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35C8.45 21.51 10.19 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.69 0-3.27-.49-4.61-1.33l-.33-.2-3.01.8.81-2.97-.21-.34C3.49 15.25 3 13.68 3 12c0-4.96 4.04-9 9-9s9 4.04 9 9-4.04 9-9 9z"/>
            </svg>
            WhatsApp-аар захиалах
          </a>

          <div className={styles.orderCarInfo}>
            <span className={styles.orderCarLabel}>Машин:</span>
            <span className={styles.orderCarValue}>{carLabel}</span>
            {car.encarId && !car.isManual && (
              <>
                <span className={styles.orderCarLabel}>Encar ID:</span>
                <span className={styles.orderCarValue}>{car.encarId}</span>
              </>
            )}
          </div>
        </div>
      )}

      {!car.isManual && car.encarId && (
        <button
          className={styles.encarBtn}
          onClick={() => window.open(
            `https://www.encar.com/dc/dc_cardetailview.do?carid=${car.encarId}`, '_blank'
          )}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </button>
      )}
      <Link to="/catalog" className={styles.backBtn}>← Жагсаалт руу буцах</Link>
    </div>
  )
}

// ─────────────────────────────────────────
// Техникийн мэдээлэл
// ─────────────────────────────────────────
function SpecCard({ car }) {
  const conditionMap = {
    Inspection: 'Үзлэг хийгдсэн',
    Record:     'Бүртгэлтэй',
    Resume:     'Түүхтэй',
    Guarantee:  'Баталгаатай',
  }
  const trustMap = {
    ExtendWarranty: 'Баталгааны хугацаа сунгасан',
    HomeService:    'Гэрийн үйлчилгээ',
    EncarMeetgo:    'Encar Meetgo',
  }
  const greenTypeMap = {
    'Y': 'Экологи тээврийн хэрэгсэл',
    'N': '',
    'H': 'Хибрид',
    'E': 'Цахилгаан',
    'P': 'Plug-in Хибрид',
  }

  const conditions  = (car.condition || []).map(c => conditionMap[c] || c).filter(Boolean)
  const trusts      = (car.trust     || []).map(t => trustMap[t]     || t).filter(Boolean)
  const greenLabel  = greenTypeMap[car.greenType] || ''

  return (
    <div className={styles.specCard}>
      <h2 className={styles.specTitle}>Машины мэдээлэл</h2>
      <div className={styles.specTable}>
        <SpecRow l="Брэнд"    v={car.brand} />
        <SpecRow l="Загвар"   v={car.model} />
        {car.badge       && <SpecRow l="Хувилбар"    v={car.badge} />}
        {car.badgeDetail && <SpecRow l="Дэлгэрэнгүй" v={car.badgeDetail} />}
        <SpecRow l="Он"       v={car.year ? `${car.year}он (${carAge(car.year)})` : '—'} />
        <SpecRow l="Явсан зам" v={formatMileage(car.mileage)} />

        {car.fuelType     && <SpecRow l="Түлшний төрөл"  v={fuelTypeLabel[car.fuelType]         || car.fuelType} />}
        {car.transmission && <SpecRow l="Хурдны хайрцаг" v={transmissionLabel[car.transmission] || car.transmission} />}
        {car.engineSize   && <SpecRow l="Хөдөлгүүр"      v={car.engineSize} />}
        {car.bodyType     && <SpecRow l="Биеийн хэлбэр"   v={car.bodyType} />}
        {car.color        && <SpecRow l="Өнгө"            v={car.color} />}
        {car.doors        && <SpecRow l="Хаалганы тоо"    v={`${car.doors} хаалга`} />}
        {car.seats        && <SpecRow l="Суудлын тоо"     v={`${car.seats} суудал`} />}

        {car.location       && <SpecRow l="Байршил"              v={car.location} />}
        {car.locationDetail && <SpecRow l="Дэлгэрэнгүй байршил" v={car.locationDetail} />}

        {car.dealer?.name  && <SpecRow l="Дилер" v={car.dealer.name} />}
        {car.dealer?.phone && <SpecRow l="Утас"  v={car.dealer.phone} />}

        {greenLabel        && <SpecRow l="Экологи"  v={greenLabel} />}
        {conditions.length > 0 && <SpecRow l="Шалгалт" v={conditions.join(', ')} />}
        {trusts.length > 0     && <SpecRow l="Баталгаа" v={trusts.join(', ')} />}

        {car.encarCreatedAt && (
          <SpecRow l="Зарагдсан огноо" v={new Date(car.encarCreatedAt).toLocaleDateString('mn-MN')} />
        )}
        {car.encarUpdatedAt && (
          <SpecRow l="Шинэчлэгдсэн" v={new Date(car.encarUpdatedAt).toLocaleDateString('mn-MN')} />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Машины түүх
// ─────────────────────────────────────────
function HistCard({ car }) {
  return (
    <div className={styles.histCard}>
      <h2 className={styles.specTitle}>Машины түүх</h2>
      <div className={styles.histRow}>
        <HistItem
          ok={car.history?.accidents === 0}
          label="Осолын түүх"
          value={car.history?.accidents === 0
            ? 'Осол байгаагүй'
            : `${car.history?.accidents || 0} удаа осол`}
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