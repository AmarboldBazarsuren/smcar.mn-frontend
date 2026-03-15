import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { vehicleAPI, marketAPI, formatPrice } from '../services/api'
import CarCard from '../components/CarCard'
import styles from './Home.module.css'

const BRANDS = [
  { id: 'Hyundai',  label: '현대',  en: 'Hyundai' },
  { id: 'Kia',      label: '기아',  en: 'Kia' },
  { id: 'Genesis',  label: '제네시스', en: 'Genesis' },
  { id: 'BMW',      label: 'BMW',   en: 'BMW' },
  { id: 'Mercedes', label: '벤츠',  en: 'Benz' },
  { id: 'Audi',     label: '아우디', en: 'Audi' },
  { id: 'Tesla',    label: '테슬라', en: 'Tesla' },
  { id: 'Porsche',  label: '포르쉐', en: 'Porsche' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const navigate                = useNavigate()

  useEffect(() => {
    Promise.allSettled([
      vehicleAPI.featured(8),
      vehicleAPI.stats(),
    ]).then(([featRes, statsRes]) => {
      if (featRes.status === 'fulfilled') setFeatured(featRes.value?.data || [])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data || null)
      setLoading(false)
    })
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/catalog?search=${encodeURIComponent(search.trim())}`)
    else navigate('/catalog')
  }

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroGradient}/>
          <div className={styles.heroGrid}/>
        </div>

        <div className={`container ${styles.heroContent}`}>
          <p className={`${styles.heroEyebrow} fade-up`}>🇰🇷 Солонгосын бодит зах зээл</p>
          <h1 className={`${styles.heroTitle} fade-up fade-up-delay-1`}>
            Таны хүсэн<br />
            <span className={styles.heroAccent}>хүлээсэн машин</span><br />
            энд байна
          </h1>
          <p className={`${styles.heroSub} fade-up fade-up-delay-2`}>
            Encar.com-ийн {stats ? `${stats.totalActive?.toLocaleString()}+` : '200,000+'} машинаас Монголд хамгийн хямд, шилдэг машинаа олоорой
          </p>

          {/* Search bar */}
          <form className={`${styles.heroSearch} fade-up fade-up-delay-3`} onSubmit={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={styles.heroSearchInput}
              placeholder="Брэнд, загвар, жил хайх..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className={styles.heroSearchBtn}>Хайх</button>
          </form>

          {/* Quick tags */}
          <div className={`${styles.quickTags} fade-up fade-up-delay-4`}>
            {['Hyundai SUV', 'BMW 5-Series', 'Genesis G80', 'Electric'].map(tag => (
              <button key={tag} className={styles.quickTag}
                onClick={() => navigate(`/catalog?search=${encodeURIComponent(tag)}`)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      {stats && (
        <section className={styles.statsSection}>
          <div className="container">
            <div className={styles.statsGrid}>
              <StatCard icon="🚗" value={`${stats.totalActive?.toLocaleString()}+`} label="Нийт идэвхтэй машин" />
              <StatCard icon="⚡" value={`${stats.recentCount?.toLocaleString()}+`} label="7 хоногт шинэ машин" />
              <StatCard icon="🔄" value="30 мин" label="Автомат шинэчлэл" />
              <StatCard icon="✅" value="204,255+" label="Нийт бүртгэлтэй" />
            </div>
          </div>
        </section>
      )}

      {/* ── BRANDS ── */}
      <section className={`${styles.brandsSection} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEye}>Алдартай брэндүүд</p>
              <h2 className={styles.sectionTitle}>Брэндээр хайх</h2>
            </div>
            <Link to="/catalog" className={styles.seeAll}>Бүгдийг харах →</Link>
          </div>
          <div className={styles.brandsGrid}>
            {BRANDS.map(brand => (
              <Link
                key={brand.id}
                to={`/catalog?brand=${encodeURIComponent(brand.id)}`}
                className={styles.brandCard}
              >
                <span className={styles.brandKo}>{brand.label}</span>
                <span className={styles.brandEn}>{brand.en}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CARS ── */}
      <section className={`${styles.featuredSection} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEye}>Онцлох зарууд</p>
              <h2 className={styles.sectionTitle}>Сүүлийн машинууд</h2>
            </div>
            <Link to="/catalog" className={styles.seeAll}>Бүгдийг харах →</Link>
          </div>

          {loading ? (
            <div className="grid-cars">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 360, borderRadius: 18 }} />
              ))}
            </div>
          ) : (
            <div className="grid-cars">
              {featured.map((car, i) => (
                <div key={car._id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          )}

          <div className={styles.loadMoreWrap}>
            <Link to="/catalog" className={styles.loadMoreBtn}>
              Бүх машинуудыг харах
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className={`${styles.promoBanner} section`}>
        <div className="container">
          <div className={styles.promoCard}>
            <div className={styles.promoLeft}>
              <p className={styles.promoEye}>Шинэ зар нэмэгдэх тутамд</p>
              <h2 className={styles.promoTitle}>Автоматаар шинэчлэгддэг</h2>
              <p className={styles.promoText}>
                Encar.com дээр шинэ машин гарах бүрт манай систем автоматаар татан авч таны дэлгэцэнд харуулдаг. 30 минут тутамд шинэчлэгддэг.
              </p>
              <Link to="/catalog" className={styles.promoBtn}>Одоо хайх</Link>
            </div>
            <div className={styles.promoRight}>
              <div className={styles.promoStats}>
                <div className={styles.promoStat}>
                  <span className={styles.promoStatNum}>204K+</span>
                  <span className={styles.promoStatLabel}>Нийт машин</span>
                </div>
                <div className={styles.promoStat}>
                  <span className={styles.promoStatNum}>30мин</span>
                  <span className={styles.promoStatLabel}>Шинэчлэл</span>
                </div>
                <div className={styles.promoStat}>
                  <span className={styles.promoStatNum}>100%</span>
                  <span className={styles.promoStatLabel}>Бодит дата</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div>
              <div className={styles.footerLogo}>
                <span className={styles.footerLogoMark}>SM</span>
                <span className={styles.footerLogoDomain}>car<span>.mn</span></span>
              </div>
              <p className={styles.footerDesc}>Солонгосын машины зах зээлийг Монголд</p>
            </div>
            <div className={styles.footerLinks}>
              <Link to="/">Нүүр</Link>
              <Link to="/catalog">Машинууд</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2025 smcar.mn — Encar.com-тэй хамтарсан</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}