
import styles from '../CarDetail.module.css'

export function PRow({ l, v, total }) {
  return (
    <div className={`${styles.pRow} ${total ? styles.pRowTotal : ''}`}>
      <span>{l}</span>
      <span>{v}</span>
    </div>
  )
}
export function SpecRow({ l, v }) {
  return (
    <div className={styles.specRow}>
      <span className={styles.specL}>{l}</span>
      <span className={styles.specV}>{v}</span>
    </div>
  )
}

// ─────────────────────────────────────────
// HistItem — машины түүхийн нэг мөр
// ─────────────────────────────────────────
export function HistItem({ ok, label, value }) {
  return (
    <div className={styles.histItem}>
      <div className={ok ? styles.histOk : styles.histWarn}>
        {ok ? '✓' : '!'}
      </div>
      <div>
        <p className={styles.histLabel}>{label}</p>
        <p className={`${styles.histVal} ${ok ? styles.histValOk : styles.histValWarn}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// groupFeatures — тоноглолыг ангиллаар бүлэглэх
// ─────────────────────────────────────────
const FEATURE_GROUPS = [
  {
    title: 'Гадна тал, Дотор салон',
    keywords: ['гэрэл','толь','обуд','дугуй','спойлер','боёлт','бүрхэвч',
               'цонх','хаалга','луунги','хүрд','салон','арьс','суудал','хөшиг'],
  },
  {
    title: 'Аюулгүй байдал',
    keywords: ['аюул','airbag','abs','эвс','esp','tcs','камер','зорчигч',
               'дохиолол','хяналт','мэдрэгч','tpms'],
  },
  {
    title: 'Тав тух, Мультимедиа',
    keywords: ['навигац','bluetooth','usb','дуу','аудио','дулаан','хөргөлт',
               'агаар','wifi','экран','монитор','хаалт'],
  },
]

export function groupFeatures(features) {
  if (!features || features.length === 0) return []
  const used = new Set()
  const result = []

  FEATURE_GROUPS.forEach(g => {
    const items = features.filter((f, i) => {
      if (used.has(i)) return false
      return g.keywords.some(k => f.toLowerCase().includes(k))
    })
    items.forEach(f => used.add(features.indexOf(f)))
    if (items.length > 0) result.push({ title: g.title, items })
  })

  const rest = features.filter((_, i) => !used.has(i))
  if (rest.length > 0) result.push({ title: '', items: rest })

  return result
}