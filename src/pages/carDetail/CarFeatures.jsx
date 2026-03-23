/**
 * CarFeatures.jsx
 *
 * Машины тоноглол, онцлогуудыг бүлэглэж харуулах секц.
 * groupFeatures() ашиглан ангилалд хуваана.
 */

import { groupFeatures } from './carDetailHelpers'
import styles from '../CarDetail.module.css'

// ← carDetailHelpers нь ижил carDetail/ фолдерт байна → './'
// ← CarDetail.module.css нь дээд pages/ фолдерт байна → '../'

export default function CarFeatures({ features }) {
  if (!features || features.length === 0) return null

  const groups = groupFeatures(features)

  return (
    <div className={styles.featuresSection}>
      <h2 className={styles.sectionTitle}>Тоноглол ба онцлогууд</h2>

      {groups.length > 0 ? (
        groups.map((g, gi) => (
          <div key={gi} className={styles.featGroup}>
            {g.title && (
              <h3 className={styles.featGroupTitle}>{g.title}</h3>
            )}
            <FeatGrid items={g.items} />
          </div>
        ))
      ) : (
        <FeatGrid items={features} />
      )}
    </div>
  )
}

function FeatGrid({ items }) {
  return (
    <div className={styles.featGrid}>
      {items.map((f, i) => (
        <div key={i} className={styles.featItem}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {f}
        </div>
      ))}
    </div>
  )
}