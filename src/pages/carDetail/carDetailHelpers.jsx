import styles from '../CarDetail.module.css'

export function PRow({ label, value, total }) {
  return (
    <div className={`${styles.pRow} ${total ? styles.pRowTotal : ''}`}>
      <span className={styles.pRowLabel}>{label}</span>
      <span className={styles.pRowValue}>{value}</span>
    </div>
  )
}

export function SpecRow({ label, value }) {
  if (!value) return null
  return (
    <div className={styles.specRow}>
      <span className={styles.specLabel}>{label}</span>
      <span className={styles.specValue}>{value}</span>
    </div>
  )
}

export function HistItem({ ok, label, value }) {
  return (
    <div className={styles.histItem}>
      <div className={`${styles.histDot} ${ok ? styles.histDotOk : styles.histDotWarn}`}>
        {ok ? '✓' : '!'}
      </div>
      <div>
        <div className={styles.histLabel}>{label}</div>
        <div className={`${styles.histValue} ${ok ? styles.histValueOk : styles.histValueWarn}`}>
          {value}
        </div>
      </div>
    </div>
  )
}

const GROUPS = [
  { title: 'Аюулгүй байдал', keys: ['airbag','abs','esp','камер','мэдрэгч','дохиолол','tpms','аюул','зорчигч'] },
  { title: 'Тав тух',        keys: ['навигац','bluetooth','usb','дуу','аудио','дулаан','хөргөлт','агаар','экран','wifi'] },
  { title: 'Гадна / Дотор',  keys: ['гэрэл','толь','обуд','дугуй','хаалга','луунги','суудал','арьс','цонх','хүрд'] },
]

export function groupFeatures(features) {
  if (!features?.length) return []
  const used = new Set()
  const result = []
  GROUPS.forEach(g => {
    const items = features.filter((f, i) => {
      if (used.has(i)) return false
      return g.keys.some(k => f.toLowerCase().includes(k))
    })
    items.forEach(f => used.add(features.indexOf(f)))
    if (items.length) result.push({ title: g.title, items })
  })
  const rest = features.filter((_, i) => !used.has(i))
  if (rest.length) result.push({ title: 'Бусад', items: rest })
  return result
}