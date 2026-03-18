import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { vehicleAPI, marketAPI } from '../services/api'
import CarCard from '../components/CarCard'
import styles from './Home.module.css'

const BRANDS = [
  { id: 'Hyundai',       label: 'Hyundai'       },
  { id: 'Kia',           label: 'Kia'           },
  { id: 'Genesis',       label: 'Genesis'       },
  { id: 'BMW',           label: 'BMW'           },
  { id: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { id: 'Audi',          label: 'Audi'          },
  { id: 'Porsche',       label: 'Porsche'       },
  { id: 'Toyota',        label: 'Toyota'        },
{ id: 'Land Rover', label: 'Range Rover' },
  { id: 'Lexus',         label: 'Lexus'         },
  { id: 'Volvo',         label: 'Volvo'         },
  { id: 'Tesla',         label: 'Tesla'         },
  { id: 'Chevrolet',     label: 'Chevrolet'     },
  { id: 'Mini',          label: 'Mini'          },
  { id: 'Renault',       label: 'Renault'       },
  { id: 'Volkswagen',    label: 'Volkswagen'    },
  { id: 'Nissan',        label: 'Nissan'        },
  { id: 'Honda',         label: 'Honda'         },
]

const CATEGORIES = [
  { label: 'SUV / Кроссовер', q: { body_type: 'SUV' } },
  { label: 'Седан',           q: { body_type: 'Sedan' } },
  { label: 'Цахилгаан',      q: { fuel_type: 'Electric' } },
  { label: 'Хибрид',         q: { fuel_type: 'Hybrid' } },
  { label: 'Хэчбэк',         q: { body_type: 'Hatchback' } },
  { label: 'Пикап',          q: { body_type: 'Pickup' } },
]

export default function Home() {
  const [featured,    setFeatured]    = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [brandCounts, setBrandCounts] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    Promise.allSettled([
      vehicleAPI.featured(8),
      vehicleAPI.stats(),
      marketAPI.brands(),   // ← брэнд бүрийн жинхэнэ тоог авна
    ]).then(([f, s, b]) => {
      if (f.status === 'fulfilled') {
        setFeatured(f.value?.data || [])
      }
      if (s.status === 'fulfilled') {
        setStats(s.value?.data || null)
      }
      if (b.status === 'fulfilled') {
        // marketAPI.brands() → [{ id, name, count }]
        const counts = {}
        ;(b.value?.data || []).forEach(item => {
          counts[item.name] = item.count
        })
        setBrandCounts(counts)
      }
      setLoading(false)
    })
  }, [])

  const goSearch = e => {
    e.preventDefault()
    navigate('/catalog' + (search.trim() ? '?search=' + encodeURIComponent(search.trim()) : ''))
  }

  const goCategory = q => {
    const params = new URLSearchParams(q)
    navigate('/catalog?' + params.toString())
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
                <em className={styles.accent}> Хүссэн машинаа Солонгосоос захиалцаая</em>
              </h1>
              <form className={'fade-up fade-up-2 ' + styles.heroSearch} onSubmit={goSearch}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className={styles.heroInput}
                  placeholder="Брэнд, загвар хайх..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button type="submit" className={styles.heroBtn}>Хайх</button>
              </form>
              <div className={'fade-up fade-up-3 ' + styles.tags}>
                {['Hyundai Tucson', 'BMW 5 Series', 'Genesis G80', 'Цахилгаан'].map(t => (
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
                <Stat n="Өдөрт 1" l="Шинэчлэл"/>
                <Stat n={stats ? (stats.recentCount || 0).toLocaleString() + '+' : '—'} l="7 хоногт шинэ"/>
                <Stat n="100%" l="Бодит дата"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* АНГИЛАЛ + БРЭНД */}
      <section className={styles.quickSection}>
        <div className="container">
          <div className={styles.quickGrid}>

            {/* Төрлөөр хайх */}
            <div className={styles.quickBlock}>
              <h2 className={styles.quickTitle}>Төрлөөр хайх</h2>
              <div className={styles.catList}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.label}
                    className={styles.catItem}
                    onClick={() => goCategory(c.q)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Брэндээр хайх */}
            <div className={styles.quickBlock}>
              <h2 className={styles.quickTitle}>Брэндээр хайх</h2>
              <div className={styles.brandList}>
                {BRANDS.map(b => (
                  <Link
                    key={b.id}
                    to={`/catalog/${encodeURIComponent(b.id)}`}
                    className={styles.brandItem}
                  >
                    {b.label}
                    {brandCounts[b.id] > 0 && (
                      <span className={styles.brandItemCount}>
                        {brandCounts[b.id].toLocaleString()}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ШИНЭ МАШИНУУД */}
      <section className={styles.section}>
        <div className="container">
          <SecHead eye="Шинэ зарууд" title="Сүүлд нэмэгдсэн машинууд" link="/catalog"/>
          {loading ? (
            <div className="car-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 280, borderRadius: 14 }}/>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <p className={styles.empty}>Одоогоор машин байхгүй байна</p>
          ) : (
            <div className="car-grid">
              {featured.map((car, i) => (
                <div key={car._id} className="fade-up" style={{ animationDelay: i * 0.04 + 's' }}>
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
                Солонгос вон (₩) дэх үнийг Монгол төгрөгт хөрвүүлж,
                тээвэр, татвар зэрэг бүх зардлыг нэг дор харуулна.
              </p>
              {['Нэг дор бүх зардал харагдана', 'Тээвэр, татварыг тусад нь нэмнэ', 'Өдөрт нэг удаа шинэчлэгддэг'].map(t => (
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
                  ['Солонгос үнэ',      '₩3,500만'],
                  ['Үндсэн үнэ (×3.2)', '112,000,000₮'],
                  ['Тээврийн зардал',   '5,343,000₮'],
                  ['Гааль / татвар',    '26,601,255₮'],
                ].map(([l, v]) => (
                  <div key={l} className={styles.promoRow}>
                    <span>{l}</span><span>{v}</span>
                  </div>
                ))}
                <div className={styles.promoTotal}>
                  <span>Нийт дүн</span><span>143,944,255₮</span>
                </div>
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