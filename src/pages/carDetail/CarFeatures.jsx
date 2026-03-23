import styles from '../CarDetail.module.css'
import { groupFeatures } from './carDetailHelpers'

export default function CarFeatures({ features }) {
  if (!features?.length) return null
  const groups = groupFeatures(features)

  return (
    <div className={styles.featSection}>
      <h2 className={styles.featTitle}>Тоноглол</h2>
      {groups.map((g, gi) => (
        <div key={gi} className={styles.featGroup}>
          {g.title && <div className={styles.featGroupTitle}>{g.title}</div>}
          <div className={styles.featGrid}>
            {g.items.map((f, i) => (
              <div key={i} className={styles.featItem}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {f}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}