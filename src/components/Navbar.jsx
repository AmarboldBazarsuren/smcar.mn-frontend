import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [search, setSearch]       = useState('')
  const location                  = useLocation()
  const navigate                  = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/catalog?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>SM</span>
          <span className={styles.logoDomain}>car<span>.mn</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav}>
          <Link to="/" className={location.pathname === '/' ? styles.active : ''}>Нүүр</Link>
          <Link to="/catalog" className={location.pathname.startsWith('/catalog') ? styles.active : ''}>Машинууд</Link>
        </nav>

        {/* Search */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Машин хайх..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        {/* Mobile burger */}
        <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Цэс">
          <span className={menuOpen ? styles.burgerOpen : ''}/>
          <span className={menuOpen ? styles.burgerOpen : ''}/>
          <span className={menuOpen ? styles.burgerOpen : ''}/>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/">Нүүр</Link>
          <Link to="/catalog">Машинууд</Link>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input
              placeholder="Машин хайх..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">Хайх</button>
          </form>
        </div>
      )}
    </header>
  )
}