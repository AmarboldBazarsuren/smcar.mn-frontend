import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import CarDetail from './pages/CarDetail'

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/catalog"   element={<Catalog />} />
        <Route path="/car/:id"   element={<CarDetail />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </>
  )
}

function NotFound() {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      fontFamily: 'var(--font-display)', color: 'var(--text-2)'
    }}>
      <span style={{ fontSize: 64 }}>🚗</span>
      <h1 style={{ fontSize: 40, color: 'var(--text-0)' }}>404</h1>
      <p>Хуудас олдсонгүй</p>
      <a href="/" style={{ color: 'var(--gold)', fontSize: 14 }}>← Нүүр хуудас руу буцах</a>
    </div>
  )
}