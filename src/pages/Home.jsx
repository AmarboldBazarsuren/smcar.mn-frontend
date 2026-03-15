import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { vehicleAPI } from '../services/api'
import CarCard from '../components/CarCard'
import styles from './Home.module.css'

const BRANDS = [
  { id: 'Hyundai',       label: 'Hyundai' },
  { id: 'Kia',           label: 'Kia' },
  { id: 'Genesis',       label: 'Genesis' },
  { id: 'BMW',           label: 'BMW' },
  { id: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { id: 'Audi',          label: 'Audi' },
  { id: 'Porsche',       label: 'Porsche' },
  { id: 'Chevrolet',     label: 'Chevrolet' },
  { id: 'Renault',       label: 'Renault' },
  { id: 'Volvo',         label: 'Volvo' },
  { id: 'Land Rover',    label: 'Land Rover' },
  { id: 'Mini',          label: 'Mini' },
]

const CATEGORIES = [
  { label: 'SUV / Кросс',   search: 'SUV',      icon: '🚙' },
  { label: 'Седан',         search: 'Sedan',     icon: '🚗' },
  { label: 'Цахилгаан',    search: 'Electric',  icon: '⚡' },
  { label: 'Хибрид',       search: 'Hybrid',    icon: '🌿' },
  { label: 'Хэчбэк',       search: 'Hatchback', icon: '🚘' },
  { label: 'Пикап / Жийп', search: 'Pickup',    icon: '🛻' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.allSettled([vehicleAPI.featured(8), vehicleAPI.stats()]).then(([f, s]) => {
      if (f.status === 'fulfilled') setFeatured(f.value?.data || [])
      if (s.status === 'fulfilled') setStats(s.value?.data || null)
      setLoading(false)
    })
  }, [])

  const goSearch = e => {
    e.preventDefault()
    navigate('/catalog' + (search.trim() ? '?search=' + encodeURIComponent(search.trim()) : ''))
  }

  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heroLeft}>
              <p className={'fade-up ' + styles.heroTag}>Солонгосын шууд зах зээл</p>
              <h1 className={'fade-up fade-up-1 ' + styles.heroTitle}>
                Smcar.mn
                <em className={styles.accent}> Солонгос улсаас машин захиалга</em>
              </h1>
              <p className={'fade-up fade-up-2 ' + styles.heroSub}>
                {/* {stats ? (stats.totalActive || 0).toLocaleString() + '+' : '200,000+'} машин — Encar.com-ийн шууд мэдээлэл. Үнэ төгрөгөөр. */}
              </p>
              <form className={'fade-up fade-up-3 ' + styles.heroSearch} onSubmit={goSearch}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className={styles.heroInput}
                  placeholder="Брэнд, загвар, он хайх..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button type="submit" className={styles.heroBtn}>Хайх</button>
              </form>
              <div className={'fade-up fade-up-4 ' + styles.tags}>
                {['Hyundai SUV', 'BMW 5 Series', 'Genesis G80', 'Цахилгаан'].map(t => (
                  <button key={t} className={styles.tag}
                    onClick={() => navigate('/catalog?search=' + encodeURIComponent(t))}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className={'fade-up fade-up-2 ' + styles.heroRight}>
              <div className={styles.statGrid}>
                <Stat n={stats ? (stats.totalActive || 0).toLocaleString() + '+' : '—'} l="Идэвхтэй машин"/>
                <Stat n="30 мин" l="Шинэчлэл"/>
                <Stat n={stats ? (stats.recentCount || 0).toLocaleString() + '+' : '—'} l="7 хоногт шинэ"/>
                <Stat n="100%" l="Бодит дата"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* АНГИЛАЛ
      <section className={styles.section}>
        <div className="container">
          <SecHead eye="Ангилал" title="Төрлөөр нь хайх"/>
          <div className={styles.catGrid}>
            {CATEGORIES.map((c, i) => (
              <Link key={c.label}
                to={'/catalog?search=' + encodeURIComponent(c.search)}
                className={styles.catCard + ' fade-up'}
                style={{ animationDelay: i * 0.05 + 's' }}
              >
                <span className={styles.catIcon}>{c.icon}</span>
                <span className={styles.catLabel}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      {/* БРЭНД */}
      <section className={styles.sectionGray}>
        <div className="container">
          <SecHead eye="Үйлдвэрлэгч" title="Брэндээр хайх"/>
          <div className={styles.brandGrid}>
            {BRANDS.map((b, i) => (
              <Link key={b.id}
                to={'/catalog?brand=' + encodeURIComponent(b.id)}
                className={styles.brandCard + ' fade-up'}
                style={{ animationDelay: i * 0.04 + 's' }}
              >
                {b.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* МАШИНУУД */}
      <section className={styles.section}>
        <div className="container">
          <SecHead eye="Шинэ зарууд" title="Сүүлд нэмэгдсэн машинууд" link="/catalog"/>
          {loading ? (
            <div className="car-grid">
              {[...Array(8)].map((_,i) => <div key={i} className="skeleton" style={{height:280,borderRadius:14}}/>)}
            </div>
          ) : featured.length === 0 ? (
            <p className={styles.empty}>Одоогоор машин байхгүй байна</p>
          ) : (
            <div className="car-grid">
              {featured.map((car, i) => (
                <div key={car._id} className="fade-up" style={{animationDelay: i*0.04+'s'}}>
                  <CarCard car={car}/>
                </div>
              ))}
            </div>
          )}
          <div className={styles.more}>
            <Link to="/catalog" className={styles.moreBtn}>
              Бүх машинуудыг үзэх
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* PROMO */}
      <section className={styles.sectionGray}>
        <div className="container">
          <div className={styles.promo}>
            <div className={styles.promoLeft}>
              <p className={styles.secEye}>Яаж ажилладаг вэ?</p>
              <h2 className={styles.promoTitle}>Төгрөгийн үнэ шууд харагдана</h2>
              <p className={styles.promoText}>
                Admin тохиргооноос 1 ₩ = X ₮ гэж тохируулахад бүх машины үнэ
                автоматаар хөрвүүлэгдэнэ. Тээвэр, татвар зэрэг зардлуудыг тусад нь нэмнэ.
              </p>
              {['Нэг дор бүх зардал харагдана', 'Тээвэр, татварыг тусад нь нэмнэ', '30 минут тутамд шинэ машин'].map(t => (
                <div key={t} className={styles.promoFeat}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {t}
                </div>
              ))}
              <Link to="/catalog" className={styles.promoBtn}>Машин хайж эхлэх</Link>
            </div>
            <div className={styles.promoRight}>
              <div className={styles.promoBox}>
                <p className={styles.promoBoxTitle}>Үнийн жишээ тооцоолол</p>
                {[
                  ['Солонгос үнэ', '₩3,500만'],
                  ['Үндсэн үнэ (×3.2)', '112,000,000₮'],
                  ['Тээврийн зардал', '5,343,000₮'],
                  ['Гааль / татвар', '26,601,255₮'],
                ].map(([l, v]) => (
                  <div key={l} className={styles.promoRow}><span>{l}</span><span>{v}</span></div>
                ))}
                <div className={styles.promoTotal}><span>Нийт дүн</span><span>143,944,255₮</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerTop}>
            <div className={styles.footerLogo}>
              <div className={styles.footerIcon}/>
              <span className={styles.footerBrand}>smcar.mn</span>
            </div>
            <p className={styles.footerDesc}>Солонгосын машинуудыг Монголд — Encar.com</p>
          </div>
          <div className={styles.footerLinks}>
            <Link to="/">Нүүр</Link>
            <Link to="/catalog">Машинууд</Link>
          </div>
          <p className={styles.footerCopy}>© 2025 smcar.mn</p>
        </div>
      </footer>
    </div>
  )
}

function Stat({ n, l }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statNum}>{n}</span>
      <span className={styles.statLabel}>{l}</span>
    </div>
  )
}

function SecHead({ eye, title, link }) {
  return (
    <div className={styles.secHead}>
      <div>
        <p className={styles.secEye}>{eye}</p>
        <h2 className={styles.secTitle}>{title}</h2>
      </div>
      {link && <Link to={link} className={styles.seeAll}>Бүгдийг харах →</Link>}
    </div>
  )
}