import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminAPI, formatMNT, formatKRW, getImageUrl } from '../../services/api'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const [admin,    setAdmin]    = useState(null)
  const [stats,    setStats]    = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd,  setShowAdd]  = useState(false)
  const [editCar,  setEditCar]  = useState(null)
  const [pricingCar, setPricingCar] = useState(null)
  const [globalRate, setGlobalRate] = useState('')
  const [globalLoading, setGlobalLoading] = useState(false)
  const navigate = useNavigate()

  // Load
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { navigate('/admin/login'); return }
    loadAll()
  }, [page, search, statusFilter])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [meRes, statsRes, vRes] = await Promise.allSettled([
        adminAPI.getMe(),
        adminAPI.getStats(),
        adminAPI.listVehicles({ page, limit: 15, search, status: statusFilter }),
      ])
      if (meRes.status    === 'fulfilled') setAdmin(meRes.value?.admin)
      if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data)
      if (vRes.status     === 'fulfilled') {
        setVehicles(vRes.value?.data?.vehicles || [])
        setTotal(vRes.value?.data?.pagination?.total || 0)
      }
    } catch {
      navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`"${title}" устгах уу?`)) return
    try {
      await adminAPI.deleteVehicle(id)
      loadAll()
    } catch (e) {
      alert('Устгахад алдаа: ' + e)
    }
  }

  const handleGlobalRate = async (e) => {
    e.preventDefault()
    if (!globalRate) return
    setGlobalLoading(true)
    try {
      const res = await adminAPI.globalRate({ wonToMnt: parseFloat(globalRate) })
      alert(res.message)
      loadAll()
    } catch (e) {
      alert('Алдаа: ' + e)
    } finally {
      setGlobalLoading(false)
    }
  }

  const totalPages = Math.ceil(total / 15)

  return (
    <div className={styles.page}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.sideLogoMark}>
            <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
              <path d="M1 9L3.5 3H12.5L15 9H1Z" stroke="#000" strokeWidth="1.5" fill="none"/>
              <circle cx="4"  cy="10" r="1.5" fill="#000"/>
              <circle cx="12" cy="10" r="1.5" fill="#000"/>
            </svg>
          </div>
          <span className={styles.sideLogoText}>Admin</span>
        </div>

        <nav className={styles.sideNav}>
          <div className={`${styles.sideNavItem} ${styles.sideNavActive}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </div>
          <Link to="/" className={styles.sideNavItem} target="_blank">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Вэбсайт харах
          </Link>
        </nav>

        <div className={styles.sideAdmin}>
          <div className={styles.sideAdminAvatar}>
            {admin?.name?.[0] || 'A'}
          </div>
          <div>
            <p className={styles.sideAdminName}>{admin?.name || 'Admin'}</p>
            <p className={styles.sideAdminRole}>Удирдлага</p>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Гарах">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>

        {/* Stats */}
        <div className={styles.statsRow}>
          <StatCard label="Нийт машин"     value={stats?.total || 0}  color="gold"/>
          <StatCard label="Идэвхтэй"       value={stats?.active || 0} color="green"/>
          <StatCard label="Зарагдсан"      value={stats?.sold || 0}   color="red"/>
          <StatCard label="Гараар нэмсэн"  value={stats?.manual || 0} color="blue"/>
        </div>

        {/* Global WON → MNT rate */}
        <div className={styles.rateCard}>
          <div className={styles.rateLeft}>
            <p className={styles.rateTitle}>Глобал ханш тохируулах</p>
            <p className={styles.rateSub}>1 ₩ = X ₮ гэж оруулахад бүх машины үнэ шинэчлэгдэнэ</p>
          </div>
          <form className={styles.rateForm} onSubmit={handleGlobalRate}>
            <span className={styles.ratePrefix}>1 ₩ =</span>
            <input
              className={styles.rateInput}
              type="number"
              step="0.01"
              placeholder="3.20"
              value={globalRate}
              onChange={e => setGlobalRate(e.target.value)}
            />
            <span className={styles.rateSuffix}>₮</span>
            <button
              type="submit"
              className={styles.rateBtn}
              disabled={globalLoading}
            >
              {globalLoading ? '...' : 'Хадгалах'}
            </button>
          </form>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <h2 className={styles.sectionTitle}>Машинууд</h2>
            <span className={styles.totalBadge}>{total.toLocaleString()}</span>
          </div>
          <div className={styles.toolbarRight}>
            {/* Search */}
            <div className={styles.searchWrap}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className={styles.searchInput}
                placeholder="Хайх..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>

            {/* Status filter */}
            <select
              className={styles.statusSelect}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            >
              <option value="">Бүгд</option>
              <option value="active">Идэвхтэй</option>
              <option value="sold">Зарагдсан</option>
              <option value="hidden">Нуугдсан</option>
            </select>

            {/* Add button */}
            <button
              className={styles.addBtn}
              onClick={() => setShowAdd(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Машин нэмэх
            </button>
          </div>
        </div>

        {/* Vehicle table */}
        {loading ? (
          <div className={styles.loadingRow}>
            <div className={styles.spinner}/>
            <span>Ачааллаж байна...</span>
          </div>
        ) : vehicles.length === 0 ? (
          <div className={styles.empty}>
            <p>Машин олдсонгүй</p>
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              Машин нэмэх
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Машин</th>
                  <th>Он / КМ</th>
                  <th>₩ Үнэ</th>
                  <th>₮ Үнэ</th>
                  <th>Статус</th>
                  <th>Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <VehicleRow
                    key={v._id}
                    v={v}
                    onEdit={() => setEditCar(v)}
                    onPricing={() => setPricingCar(v)}
                    onDelete={() => handleDelete(v._id, v.title)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >←</button>
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(p)}
                >{p}</button>
              )
            })}
            <button
              className={styles.pageBtn}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >→</button>
          </div>
        )}

      </main>

      {/* ── Modal: Машин нэмэх/засах ── */}
      {(showAdd || editCar) && (
        <VehicleModal
          car={editCar}
          onClose={() => { setShowAdd(false); setEditCar(null) }}
          onSave={() => { setShowAdd(false); setEditCar(null); loadAll() }}
        />
      )}

      {/* ── Modal: Үнэ тохируулах ── */}
      {pricingCar && (
        <PricingModal
          car={pricingCar}
          onClose={() => setPricingCar(null)}
          onSave={() => { setPricingCar(null); loadAll() }}
        />
      )}

    </div>
  )
}

// ── Stat card ──
function StatCard({ label, value, color }) {
  const colors = {
    gold:  { bg: 'rgba(201,168,76,0.1)',  border: 'rgba(201,168,76,0.25)',  text: '#C9A84C' },
    green: { bg: 'rgba(61,214,140,0.1)',  border: 'rgba(61,214,140,0.25)', text: '#3DD68C' },
    red:   { bg: 'rgba(232,64,64,0.1)',   border: 'rgba(232,64,64,0.25)',  text: '#E84040' },
    blue:  { bg: 'rgba(74,142,255,0.1)',  border: 'rgba(74,142,255,0.25)', text: '#4A8EFF' },
  }
  const c = colors[color] || colors.gold
  return (
    <div className={styles.statCard} style={{ background: c.bg, borderColor: c.border }}>
      <span className={styles.statValue} style={{ color: c.text }}>{value.toLocaleString()}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

// ── Vehicle row ──
function VehicleRow({ v, onEdit, onPricing, onDelete }) {
  const statusMap = {
    active:  { label: 'Идэвхтэй', cls: styles.statusActive },
    sold:    { label: 'Зарагдсан', cls: styles.statusSold },
    pending: { label: 'Хүлээгдэж байна', cls: styles.statusPending },
    hidden:  { label: 'Нуугдсан', cls: styles.statusHidden },
  }
  const s = statusMap[v.status] || statusMap.active
  const imgUrl = getImageUrl(v.thumbnailUrl || v.images?.[0]?.url)

  return (
    <tr className={styles.tableRow}>
      <td>
        <div className={styles.carCell}>
          <div className={styles.carThumb}>
            {imgUrl
              ? <img src={imgUrl} alt={v.title} onError={e => e.target.style.display='none'}/>
              : <span>🚗</span>
            }
          </div>
          <div>
            <p className={styles.carBrand}>{v.brand}</p>
            <p className={styles.carModel}>{v.model} {v.badge || ''}</p>
            {v.isManual && <span className={styles.manualBadge}>Гараар</span>}
          </div>
        </div>
      </td>
      <td>
        <p className={styles.tdMain}>{v.year}</p>
        <p className={styles.tdSub}>{v.mileage ? `${v.mileage.toLocaleString()} км` : '—'}</p>
      </td>
      <td className={styles.tdPrice}>{formatKRW(v.price)}</td>
      <td className={styles.tdPriceMnt}>
        {v.totalPriceMnt > 0 ? formatMNT(v.totalPriceMnt) : <span className={styles.noRate}>—</span>}
      </td>
      <td>
        <span className={`${styles.statusBadge} ${s.cls}`}>{s.label}</span>
      </td>
      <td>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={onPricing} title="Үнэ тохируулах">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </button>
          <button className={styles.actionBtn} onClick={onEdit} title="Засах">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionDel}`}
            onClick={onDelete}
            title="Устгах"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Машин нэмэх/засах modal ──
function VehicleModal({ car, onClose, onSave }) {
  const isEdit = !!car
  const fileRef = useRef()

  const [form, setForm] = useState({
    brand:        car?.brand        || '',
    model:        car?.model        || '',
    badge:        car?.badge        || '',
    year:         car?.year         || new Date().getFullYear(),
    price:        car?.price        || '',
    mileage:      car?.mileage      || '',
    fuelType:     car?.fuelType     || '',
    transmission: car?.transmission || '',
    engineSize:   car?.engineSize   || '',
    bodyType:     car?.bodyType     || '',
    color:        car?.color        || '',
    location:     car?.location     || '',
    description:  car?.description  || '',
    features:     car?.features?.join(', ') || '',
    accidents:    car?.history?.accidents ?? 0,
    owners:       car?.history?.owners    ?? 1,
    adminNote:    car?.adminNote    || '',
    status:       car?.status       || 'active',
  })
  const [files,   setFiles]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('history[accidents]', form.accidents)
      fd.append('history[owners]',    form.owners)
      files.forEach(f => fd.append('images', f))

      if (isEdit) {
        await adminAPI.updateVehicle(car._id, fd)
      } else {
        await adminAPI.createVehicle(fd)
      }
      onSave()
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? 'Машин засах' : 'Шинэ машин нэмэх'}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className={styles.modalError}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.modalGrid}>

            {/* Үндсэн мэдээлэл */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Үндсэн мэдээлэл</h3>
              <div className={styles.formGrid}>
                <Field label="Брэнд *" required>
                  <input className={styles.formInput} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Hyundai" required/>
                </Field>
                <Field label="Загвар *" required>
                  <input className={styles.formInput} value={form.model} onChange={e => set('model', e.target.value)} placeholder="Sonata" required/>
                </Field>
                <Field label="Badge">
                  <input className={styles.formInput} value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="2.0 Premium"/>
                </Field>
                <Field label="Он *">
                  <input className={styles.formInput} type="number" value={form.year} onChange={e => set('year', e.target.value)} required/>
                </Field>
                <Field label="Үнэ (₩ вон) *">
                  <input className={styles.formInput} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="25000000" required/>
                </Field>
                <Field label="Явсан зам (км)">
                  <input className={styles.formInput} type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="50000"/>
                </Field>
              </div>
            </div>

            {/* Техникийн мэдээлэл */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Техникийн мэдээлэл</h3>
              <div className={styles.formGrid}>
                <Field label="Түлшний төрөл">
                  <select className={styles.formInput} value={form.fuelType} onChange={e => set('fuelType', e.target.value)}>
                    <option value="">Сонгох</option>
                    <option value="Gasoline">Бензин</option>
                    <option value="Diesel">Дизель</option>
                    <option value="Electric">Цахилгаан</option>
                    <option value="Hybrid">Хибрид</option>
                    <option value="LPG">Шингэн хий</option>
                  </select>
                </Field>
                <Field label="Хурдны хайрцаг">
                  <select className={styles.formInput} value={form.transmission} onChange={e => set('transmission', e.target.value)}>
                    <option value="">Сонгох</option>
                    <option value="Automatic">Автомат</option>
                    <option value="Manual">Механик</option>
                  </select>
                </Field>
                <Field label="Хөдөлгүүр">
                  <input className={styles.formInput} value={form.engineSize} onChange={e => set('engineSize', e.target.value)} placeholder="2000cc"/>
                </Field>
                <Field label="Биеийн хэлбэр">
                  <select className={styles.formInput} value={form.bodyType} onChange={e => set('bodyType', e.target.value)}>
                    <option value="">Сонгох</option>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Седан</option>
                    <option value="Hatchback">Хэчбэк</option>
                    <option value="Wagon">Вагон</option>
                    <option value="Coupe">Купэ</option>
                    <option value="Pickup">Пикап</option>
                    <option value="Van">Ван</option>
                  </select>
                </Field>
                <Field label="Өнгө">
                  <input className={styles.formInput} value={form.color} onChange={e => set('color', e.target.value)} placeholder="Цагаан"/>
                </Field>
                <Field label="Байршил">
                  <input className={styles.formInput} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Seoul"/>
                </Field>
              </div>
            </div>

            {/* Түүх */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Түүх / Статус</h3>
              <div className={styles.formGrid}>
                <Field label="Осол (удаа)">
                  <input className={styles.formInput} type="number" value={form.accidents} onChange={e => set('accidents', e.target.value)} min="0"/>
                </Field>
                <Field label="Эзэд (хэд)">
                  <input className={styles.formInput} type="number" value={form.owners} onChange={e => set('owners', e.target.value)} min="1"/>
                </Field>
                <Field label="Статус">
                  <select className={styles.formInput} value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="active">Идэвхтэй</option>
                    <option value="pending">Хүлээгдэж байна</option>
                    <option value="hidden">Нуугдсан</option>
                    <option value="sold">Зарагдсан</option>
                  </select>
                </Field>
                <Field label="Admin тэмдэглэл" wide>
                  <input className={styles.formInput} value={form.adminNote} onChange={e => set('adminNote', e.target.value)} placeholder="Тусгай мэдээлэл..."/>
                </Field>
              </div>
            </div>

            {/* Тайлбар / Онцлог */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Тайлбар</h3>
              <Field label="Тайлбар" wide>
                <textarea
                  className={`${styles.formInput} ${styles.formTextarea}`}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Машины дэлгэрэнгүй тайлбар..."
                  rows={3}
                />
              </Field>
              <Field label="Онцлогууд (таслалаар тусгаарлана)" wide>
                <textarea
                  className={`${styles.formInput} ${styles.formTextarea}`}
                  value={form.features}
                  onChange={e => set('features', e.target.value)}
                  placeholder="Навигац, Дулаан суудал, Камер, Bluetooth..."
                  rows={2}
                />
              </Field>
            </div>

            {/* Зурагнууд */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Зурагнууд</h3>
              <div
                className={styles.dropZone}
                onClick={() => fileRef.current?.click()}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>{files.length > 0 ? `${files.length} зураг сонгогдсон` : 'Зураг сонгох (20 хүртэл)'}</p>
                <span>JPG, PNG, WEBP — 10MB хүртэл</span>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => setFiles([...e.target.files])}
                />
              </div>
              {/* Preview */}
              {files.length > 0 && (
                <div className={styles.imgPreview}>
                  {[...files].map((f, i) => (
                    <div key={i} className={styles.previewThumb}>
                      <img src={URL.createObjectURL(f)} alt={f.name}/>
                    </div>
                  ))}
                </div>
              )}
              {/* Existing images when editing */}
              {isEdit && car.images?.length > 0 && (
                <div className={styles.existingImgs}>
                  <p className={styles.existingLabel}>Одоогийн зурагнууд</p>
                  <div className={styles.imgPreview}>
                    {car.images.map((img, i) => (
                      <div key={i} className={styles.previewThumb}>
                        <img src={getImageUrl(img.url)} alt={`${i+1}`}
                          onError={e => e.target.style.display='none'}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={`btn btn-secondary`} onClick={onClose}>
              Цуцлах
            </button>
            <button type="submit" className={`btn btn-primary`} disabled={loading}>
              {loading ? '...' : (isEdit ? 'Хадгалах' : 'Нэмэх')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Үнэ тохируулах modal ──
function PricingModal({ car, onClose, onSave }) {
  const [wonToMnt,    setWonToMnt]    = useState(car.wonToMnt || '')
  const [extraCosts,  setExtraCosts]  = useState(car.extraCosts || [])
  const [newLabel,    setNewLabel]    = useState('')
  const [newAmount,   setNewAmount]   = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const addCost = () => {
    if (!newLabel || !newAmount) return
    setExtraCosts(c => [...c, { label: newLabel, amount: parseInt(newAmount) }])
    setNewLabel('')
    setNewAmount('')
  }

  const removeCost = (i) => setExtraCosts(c => c.filter((_, idx) => idx !== i))

  const base  = car.price && wonToMnt ? Math.round(car.price * parseFloat(wonToMnt)) : 0
  const extra = extraCosts.reduce((s, c) => s + (c.amount || 0), 0)
  const total = base + extra

  const handleSave = async () => {
    setError('')
    setLoading(true)
    try {
      await adminAPI.updatePricing(car._id, {
        wonToMnt:   parseFloat(wonToMnt) || 0,
        extraCosts,
      })
      onSave()
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ maxWidth: 500 }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Үнэ тохируулах</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.pricingBody}>
          <p className={styles.pricingCarName}>{car.brand} {car.model} {car.year}</p>

          {/* WON → MNT rate */}
          <div className={styles.pricingRow}>
            <label className={styles.pricingLabel}>1 ₩ = X ₮ (ханш)</label>
            <div className={styles.pricingInputRow}>
              <input
                className={styles.formInput}
                type="number"
                step="0.01"
                placeholder="3.20"
                value={wonToMnt}
                onChange={e => setWonToMnt(e.target.value)}
              />
              <span className={styles.pricingSuffix}>₮</span>
            </div>
          </div>

          {/* Extra costs */}
          <div className={styles.pricingRow}>
            <label className={styles.pricingLabel}>Нэмэлт зардлууд</label>
            <div className={styles.addCostRow}>
              <input
                className={styles.formInput}
                placeholder="Тайлбар (жишээ: Тээврийн зардал)"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                style={{ flex: 2 }}
              />
              <input
                className={styles.formInput}
                type="number"
                placeholder="Дүн (₮)"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className={styles.addCostBtn} onClick={addCost}>+</button>
            </div>
            {extraCosts.map((c, i) => (
              <div key={i} className={styles.costItem}>
                <span>{c.label}</span>
                <span className={styles.costAmt}>{c.amount?.toLocaleString()}₮</span>
                <button className={styles.costDel} onClick={() => removeCost(i)}>×</button>
              </div>
            ))}
          </div>

          {/* Нийт тооцоолол */}
          <div className={styles.pricingTotal}>
            <div className={styles.pricingTotalRow}>
              <span>Үндсэн үнэ ({formatKRW(car.price)})</span>
              <span>{base > 0 ? `${base.toLocaleString()}₮` : '—'}</span>
            </div>
            {extraCosts.map((c, i) => (
              <div key={i} className={styles.pricingTotalRow}>
                <span>{c.label}</span>
                <span>{c.amount?.toLocaleString()}₮</span>
              </div>
            ))}
            <div className={`${styles.pricingTotalRow} ${styles.pricingTotalFinal}`}>
              <span>Нийт дүн</span>
              <span>{total > 0 ? `${total.toLocaleString()}₮` : '—'}</span>
            </div>
          </div>

          {error && <div className={styles.modalError}>{error}</div>}

          <div className={styles.modalFooter} style={{ marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={onClose}>Цуцлах</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? '...' : 'Хадгалах'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, wide }) {
  return (
    <div className={wide ? styles.fieldWide : styles.fieldNormal}>
      <label className={styles.formLabel}>{label}</label>
      {children}
    </div>
  )
}