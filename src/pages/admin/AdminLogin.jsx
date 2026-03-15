import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminAPI.login({ username, password })
      localStorage.setItem('adminToken', res.token)
      navigate('/admin')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Нэвтрэх нэр эсвэл нууц үг буруу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M1 9L3.5 3H12.5L15 9H1Z" stroke="#000" strokeWidth="1.5" fill="none"/>
              <circle cx="4"  cy="10" r="1.5" fill="#000"/>
              <circle cx="12" cy="10" r="1.5" fill="#000"/>
            </svg>
          </div>
          <span className={styles.logoText}>smcar<span>.mn</span></span>
        </div>

        <h1 className={styles.title}>Admin нэвтрэх</h1>
        <p className={styles.sub}>Удирдлагын хэсэгт нэвтрэх</p>

        {error && (
          <div className={styles.error}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Нэвтрэх нэр</label>
            <input
              className={styles.input}
              type="text"
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Нууц үг</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner}/>
            ) : (
              <>
                Нэвтрэх
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className={styles.back}>
          <a href="/">← Нүүр хуудас руу буцах</a>
        </p>
      </div>
    </div>
  )
}