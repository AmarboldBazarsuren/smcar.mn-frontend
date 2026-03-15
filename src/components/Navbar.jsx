import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search,   setSearch]   = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const handleSearch = e => {
    e.preventDefault()
    if (search.trim()) navigate(`/catalog?search=${encodeURIComponent(search.trim())}`)
    else navigate('/catalog')
  }

  const active = path =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>

        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="14" height="11" viewBox="0 0 16 12" fill="none">
              <path d="M1 9L3.5 3H12.5L15 9H1Z" stroke="#fff" strokeWidth="1.5" fill="none"/>
              <circle cx="4" cy="10" r="1.5" fill="#fff"/>
              <circle cx="12" cy="10" r="1.5" fill="#fff"/>
            </svg>
          </div>
          <span className={styles.logoText}>smcar<span>.mn</span></span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/"        className={active('/')       ? styles.active : ''}>Нүүр</Link>
          <Link to="/catalog" className={active('/catalog') ? styles.active : ''}>Машинууд</Link>
        </nav>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Машин хайх..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        <button className={`${styles.burger} ${menuOpen ? styles.open : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span/><span/><span/>
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/">Нүүр</Link>
          <Link to="/catalog">Машинууд</Link>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input placeholder="Хайх..." value={search} onChange={e => setSearch(e.target.value)}/>
            <button type="submit">Хайх</button>
          </form>
        </div>
      )}
    </header>
  )
}