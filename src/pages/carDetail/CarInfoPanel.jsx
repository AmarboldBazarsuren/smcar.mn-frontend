/**
 * CarInfoPanel.jsx
 *
 * Машины мэдээллийн баруун талын panel:
 *   - Үнийн карт (MNT breakdown эсвэл KRW)
 *   - Техникийн мэдээлэл хүснэгт
 *   - Машины түүхийн карт
 *   - Encar ID карт
 */

import { Link } from 'react-router-dom'
import {
  formatMNT, formatKRW,
  getPriceBreakdown, getImageUrl,
  formatMileage, carAge,
  fuelTypeLabel, transmissionLabel,
} from '../../services/api'
import { PRow, SpecRow, HistItem } from './carDetailHelpers'
import styles from '../CarDetail.module.css'

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
// Үнийн карт
// ─────────────────────────────────────────
function PriceCard({ car, breakdown }) {
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
          {/* Encar.com дээр үзэх */}
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
  // Condition монголоор
  const conditionMap = {
    Inspection:    'Үзлэг хийгдсэн',
    Record:        'Бүртгэлтэй',
    Resume:        'Түүхтэй',
    Guarantee:     'Баталгаатай',
  }
  // Trust монголоор
  const trustMap = {
    ExtendWarranty: 'Баталгааны хугацаа сунгасан',
    HomeService:    'Гэрийн үйлчилгээ',
    EncarMeetgo:    'Encar Meetgo',
  }
  // GreenType монголоор
  const greenTypeMap = {
    'Y': 'Экологи тээврийн хэрэгсэл',
    'N': '',
    'H': 'Хибрид',
    'E': 'Цахилгаан',
    'P': 'Plug-in Хибрид',
  }

  const conditions = (car.condition || [])
    .map(c => conditionMap[c] || c).filter(Boolean)
  const trusts = (car.trust || [])
    .map(t => trustMap[t] || t).filter(Boolean)
  const greenLabel = greenTypeMap[car.greenType] || ''

  return (
    <div className={styles.specCard}>
      <h2 className={styles.specTitle}>Машины мэдээлэл</h2>
      <div className={styles.specTable}>

        {/* ── Үндсэн мэдээлэл ── */}
        <SpecRow l="Брэнд"          v={car.brand} />
        <SpecRow l="Загвар"         v={car.model} />
        {car.badge       && <SpecRow l="Хувилбар"       v={car.badge} />}
        {car.badgeDetail && <SpecRow l="Дэлгэрэнгүй"    v={car.badgeDetail} />}
        <SpecRow l="Он"             v={car.year ? `${car.year}он (${carAge(car.year)})` : '—'} />
        <SpecRow l="Явсан зам"      v={formatMileage(car.mileage)} />

        {/* ── Техникийн мэдээлэл ── */}
        {car.fuelType     && <SpecRow l="Түлшний төрөл"  v={fuelTypeLabel[car.fuelType] || car.fuelType} />}
        {car.transmission && <SpecRow l="Хурдны хайрцаг" v={transmissionLabel[car.transmission] || car.transmission} />}
        {car.engineSize   && <SpecRow l="Хөдөлгүүр"      v={car.engineSize} />}
        {car.bodyType     && <SpecRow l="Биеийн хэлбэр"   v={car.bodyType} />}
        {car.color        && <SpecRow l="Өнгө"            v={car.color} />}
        {car.doors        && <SpecRow l="Хаалганы тоо"    v={`${car.doors} хаалга`} />}
        {car.seats        && <SpecRow l="Суудлын тоо"     v={`${car.seats} суудал`} />}

        {/* ── Байршил ── */}
        {car.location     && <SpecRow l="Байршил"         v={car.location} />}
        {car.locationDetail && <SpecRow l="Дэлгэрэнгүй байршил" v={car.locationDetail} />}

        {/* ── Дилер ── */}
        {car.dealer?.name  && <SpecRow l="Дилер"          v={car.dealer.name} />}
        {car.dealer?.phone && <SpecRow l="Утас"           v={car.dealer.phone} />}

        {/* ── Тусгай тэмдэглэгээ ── */}
        {greenLabel        && <SpecRow l="Экологи"        v={greenLabel} />}
        {conditions.length > 0 && <SpecRow l="Шалгалт"   v={conditions.join(', ')} />}
        {trusts.length > 0     && <SpecRow l="Баталгаа"   v={trusts.join(', ')} />}

        {/* ── Энкар мэдээлэл ── */}
        {car.encarCreatedAt && (
          <SpecRow l="Зарагдсан огноо" v={new Date(car.encarCreatedAt).toLocaleDateString('mn-MN')} />
        )}
        {car.encarUpdatedAt && (
          <SpecRow l="Шинэчлэгдсэн"   v={new Date(car.encarUpdatedAt).toLocaleDateString('mn-MN')} />
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