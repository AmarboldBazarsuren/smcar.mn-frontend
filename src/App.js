import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import CarDetail from './pages/CarDetail'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

// Scroll to top
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Admin route guard
function AdminRoute({ children }) {
  const token = localStorage.getItem('adminToken')
  if (!token) return <Navigate to="/admin/login" replace/>
  return children
}

// Admin pages - navbar-гүй
function AdminLayout({ children }) {
  return <>{children}</>
}

// Public pages - navbar-тай
function PublicLayout({ children }) {
  return (
    <>
      <Navbar/>
      {children}
    </>
  )
}

export default function App() {
  const location = useLocation()
  const isAdmin  = location.pathname.startsWith('/admin')

  return (
    <>
      <ScrollToTop/>
      {!isAdmin && <Navbar/>}

      <Routes>
        {/* Public */}
        <Route path="/"         element={<Home/>}/>
        <Route path="/catalog"  element={<Catalog/>}/>
        <Route path="/car/:id"  element={<CarDetail/>}/>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin/>}/>
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard/>
          </AdminRoute>
        }/>

        {/* 404 */}
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </>
  )
}

function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, fontFamily: 'var(--font-display)',
    }}>
      <span style={{ fontSize: 56 }}>🚗</span>
      <h1 style={{ fontSize: 40, color: 'var(--text-0)' }}>404</h1>
      <p style={{ color: 'var(--text-2)' }}>Хуудас олдсонгүй</p>
      <a href="/" style={{ color: 'var(--gold)', fontSize: 14 }}>← Нүүр хуудас руу буцах</a>
    </div>
  )
}