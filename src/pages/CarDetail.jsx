import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { vehicleAPI, getPriceBreakdown, formatMNT, formatKRW, formatMileage, carAge, fuelTypeLabel, transmissionLabel, getImageUrl } from '../services/api'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000'
const NAV_H = 60

// ─── Color tokens ───────────────────────────────
const C = {
  bg:      '#FAFAFA',
  white:   '#FFFFFF',
  black:   '#0A0A0A',
  gray1:   '#F4F4F5',
  gray2:   '#E4E4E7',
  gray3:   '#A1A1AA',
  gray5:   '#52525B',
  gray7:   '#18181B',
  red:     '#DC2626',
  green:   '#16A34A',
  amber:   '#D97706',
  blue:    '#2563EB',
  gold:    '#B45309',
  goldBg:  '#FFFBEB',
  goldBdr: '#FDE68A',
}

// ─── Responsive hook ─────────────────────────────
function useWidth() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

// ═══════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════
export default function CarDetail() {
  const { id } = useParams()
  const [car,     setCar]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const w = useWidth()
  const isMobile = w < 768
  const isTablet = w < 1100

  useEffect(() => {
    setLoading(true); setError(null)
    vehicleAPI.getById(id)
      .then(res => { setCar(res?.data || null); setLoading(false) })
      .catch(e  => { setError(String(e)); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:36, height:36, border:'3px solid #e4e4e7', borderTopColor:'#0a0a0a', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
      <p style={{ color:C.gray3, fontSize:14 }}>Ачааллаж байна...</p>
    </div>
  )

  if (error || !car) return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
      <span style={{ fontSize:52 }}>🚗</span>
      <h2 style={{ fontSize:22, fontWeight:700, color:C.black }}>Машин олдсонгүй</h2>
      <Link to="/catalog" style={{ color:C.black, fontSize:13, textDecoration:'underline', textUnderlineOffset:3 }}>← Каталог руу буцах</Link>
    </div>
  )

  const breakdown = getPriceBreakdown(car)

  return (
    <div style={{ background:C.bg, minHeight:'100vh', paddingTop: NAV_H + 24, paddingBottom:100 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 99px; }
      `}</style>

      <div style={{ maxWidth:1280, margin:'0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>

        {/* Breadcrumb */}
        <nav style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.gray3, marginBottom:16, flexWrap:'wrap' }}>
          <Link to="/" style={{ color:C.gray3, textDecoration:'none', transition:'color 0.15s' }}
            onMouseOver={e=>e.target.style.color=C.black} onMouseOut={e=>e.target.style.color=C.gray3}>Нүүр</Link>
          <span style={{ color:C.gray2 }}>/</span>
          <Link to="/catalog" style={{ color:C.gray3, textDecoration:'none', transition:'color 0.15s' }}
            onMouseOver={e=>e.target.style.color=C.black} onMouseOut={e=>e.target.style.color=C.gray3}>Машинууд</Link>
          <span style={{ color:C.gray2 }}>/</span>
          <span style={{ color:C.gray7, fontWeight:500 }}>{car.brand} {car.model}</span>
        </nav>

        {/* Title */}
        <div style={{ marginBottom:20 }}>
          <h1 style={{
            fontFamily:'var(--font-display, Georgia, serif)',
            fontSize: isMobile ? 22 : 30,
            fontWeight:700, color:C.black,
            letterSpacing:'-0.6px', lineHeight:1.15, marginBottom:10
          }}>
            {car.brand} {car.model}
            {car.badge && <span style={{ color:C.gray3, fontWeight:400 }}> {car.badge}</span>}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            {[
              car.year && `${car.year}он`,
              car.mileage > 0 && formatMileage(car.mileage),
              fuelTypeLabel[car.fuelType] || car.fuelType,
              transmissionLabel[car.transmission] || car.transmission,
              car.engineSize,
            ].filter(Boolean).map((chip, i) => (
              <span key={i} style={{
                background:C.white, border:`1px solid ${C.gray2}`,
                color:C.gray5, fontSize:12, fontWeight:500,
                padding:'3px 10px', borderRadius:99
              }}>{chip}</span>
            ))}
          </div>
        </div>

        {/* ── 2-col layout ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '1fr 360px',
          gap: isTablet ? 0 : 28,
          alignItems: 'start',
        }}>

          {/* LEFT: Gallery + Features */}
          <div>
            <Gallery car={car} />
            <Features features={car.features} />
          </div>

          {/* RIGHT: Price panel */}
          <div style={{
            position: isTablet ? 'static' : 'sticky',
            top: NAV_H + 16,
            marginTop: isTablet ? 24 : 0,
            display:'flex', flexDirection: isTablet ? 'column' : 'column',
            gap:12,
            ...(isTablet && w >= 600 ? {
              display:'grid', gridTemplateColumns:'1fr 1fr', gap:12
            } : {}),
          }}>
            <div style={{ ...(isTablet && w >= 600 ? { gridColumn:'1 / -1' } : {}) }}>
              <PriceCard car={car} breakdown={breakdown} />
            </div>
            <SpecCard car={car} />
            <HistCard car={car} />
            {car.encarId && !car.isManual && (
              <div style={{
                background:C.gray1, border:`1px solid ${C.gray2}`,
                borderRadius:10, padding:'10px 14px',
                display:'flex', justifyContent:'space-between', alignItems:'center', gap:8,
                ...(isTablet && w >= 600 ? { gridColumn:'1 / -1' } : {}),
              }}>
                <span style={{ fontSize:11, fontWeight:700, color:C.gray3, letterSpacing:'0.5px', textTransform:'uppercase' }}>Encar ID</span>
                <span style={{ fontSize:12, fontWeight:600, color:C.gray7, fontFamily:'monospace' }}>{car.encarId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// GALLERY — padding-bottom trick + horizontal thumbs
// ═══════════════════════════════════════════════════
function Gallery({ car }) {
  const [active,  setActive]  = useState(0)
  const [modal,   setModal]   = useState(false)
  const [images,  setImages]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActive(0); setImages([]); setLoading(true)
    if (car.isManual || !car.encarId) {
      setImages((car.images || []).map(i => getImageUrl(i.url)).filter(Boolean))
      setLoading(false); return
    }
    fetch(`${API_BASE}/api/images/encar/${car.encarId}/list`)
      .then(r => r.json())
      .then(({ indexes }) => {
        setImages(!indexes?.length
          ? (car.images || []).map(i => getImageUrl(i.url)).filter(Boolean)
          : indexes.map(i => `${API_BASE}/api/images/encar/${car.encarId}/${String(i).padStart(3,'0')}`)
        )
        setLoading(false)
      })
      .catch(() => {
        setImages((car.images || []).map(i => getImageUrl(i.url)).filter(Boolean))
        setLoading(false)
      })
  }, [car.encarId, car.isManual])

  useEffect(() => {
    if (!modal) return
    const fn = e => {
      if (e.key === 'ArrowLeft')  setActive(i => Math.max(0, i-1))
      if (e.key === 'ArrowRight') setActive(i => Math.min(images.length-1, i+1))
      if (e.key === 'Escape')     setModal(false)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [modal, images.length])

  const cur = images[active] || null

  return (
    <>
      {/* ── Main image: padding-bottom = aspect ratio trick ── */}
      <div style={{ position:'relative', width:'100%', paddingBottom:'62.5%', background:C.gray1, borderRadius:16, overflow:'hidden', border:`1px solid ${C.gray2}` }}>
        <div style={{ position:'absolute', inset:0 }}>
          {loading ? (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:28, height:28, border:`2px solid ${C.gray2}`, borderTopColor:C.black, borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
            </div>
          ) : cur ? (
            <img src={cur} alt={car.title} onClick={() => setModal(true)}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', cursor:'zoom-in' }}
              onError={e => { e.target.style.display='none' }}
            />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:C.gray2 }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="6" width="20" height="12" rx="2"/>
                <circle cx="8" cy="13" r="2"/><circle cx="16" cy="13" r="2"/>
                <path d="M6 6l2-3h8l2 3"/>
              </svg>
            </div>
          )}

          {/* Arrows */}
          {images.length > 1 && <>
            <button disabled={active===0} onClick={e => { e.stopPropagation(); setActive(i=>Math.max(0,i-1)) }}
              style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.92)', border:`1px solid rgba(0,0,0,0.08)`, fontSize:20, color:C.black, display:'flex', alignItems:'center', justifyContent:'center', cursor: active===0 ? 'not-allowed':'pointer', opacity: active===0 ? 0.35:1, zIndex:2, boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>‹</button>
            <button disabled={active===images.length-1} onClick={e => { e.stopPropagation(); setActive(i=>Math.min(images.length-1,i+1)) }}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.92)', border:`1px solid rgba(0,0,0,0.08)`, fontSize:20, color:C.black, display:'flex', alignItems:'center', justifyContent:'center', cursor: active===images.length-1 ? 'not-allowed':'pointer', opacity: active===images.length-1 ? 0.35:1, zIndex:2, boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>›</button>
            <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(0,0,0,0.5)', color:'#fff', fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:99 }}>{active+1} / {images.length}</div>
          </>}

          {car.history?.accidents === 0 && (
            <div style={{ position:'absolute', bottom:12, left:12, background:'rgba(22,163,74,0.12)', border:'1px solid rgba(22,163,74,0.3)', color:C.green, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99 }}>✓ Осолгүй</div>
          )}
          {car.status === 'sold' && (
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:C.red, letterSpacing:3 }}>ЗАРАГДСАН</div>
          )}
        </div>
      </div>

      {/* ── Thumbnail row: ALWAYS horizontal scroll ── */}
      {images.length > 1 && (
        <div style={{ display:'flex', flexDirection:'row', gap:6, marginTop:8, overflowX:'auto', overflowY:'hidden', paddingBottom:2, scrollbarWidth:'thin' }}>
          {images.map((url, i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{
                flexShrink:0, width:82, height:60,
                borderRadius:8, overflow:'hidden',
                border: active===i ? `2px solid ${C.black}` : `2px solid transparent`,
                background:C.gray1, padding:0, cursor:'pointer',
                transition:'border-color 0.15s', flexGrow:0,
              }}
            >
              <img src={url} alt={i+1}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                onError={e => { e.target.parentElement.style.display='none' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Fullscreen modal ── */}
      {modal && cur && (
        <div onClick={() => setModal(false)}
          style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.96)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <button onClick={() => setModal(false)}
            style={{ position:'absolute', top:16, right:16, width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.1)', color:'#fff', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'none' }}>✕</button>
          <button disabled={active===0} onClick={e => { e.stopPropagation(); setActive(i=>Math.max(0,i-1)) }}
            style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'none', opacity:active===0?0.3:1 }}>‹</button>
          <img src={cur} alt={active+1} onClick={e=>e.stopPropagation()}
            style={{ maxWidth:'92vw', maxHeight:'88vh', objectFit:'contain', borderRadius:8 }}/>
          <button disabled={active===images.length-1} onClick={e => { e.stopPropagation(); setActive(i=>Math.min(images.length-1,i+1)) }}
            style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'none', opacity:active===images.length-1?0.3:1 }}>›</button>
          <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', color:'rgba(255,255,255,0.5)', fontSize:13 }}>{active+1} / {images.length}</div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════
// PRICE CARD
// ═══════════════════════════════════════════════════
function PriceCard({ car, breakdown }) {
  const [open, setOpen] = useState(false)
  const label = `${car.brand} ${car.model}${car.badge?' '+car.badge:''} ${car.year}`
  const msg = encodeURIComponent(`Сайн байна уу!\n🚗 ${label}\nID: ${car.encarId}`)

  return (
    <div style={{ background:C.white, border:`1px solid ${C.gray2}`, borderRadius:20, padding:22, boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>

      {/* Price */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:34, fontWeight:800, color:C.black, letterSpacing:'-1.5px', lineHeight:1 }}>
          {breakdown ? formatMNT(breakdown.totalPriceMnt) : formatKRW(car.price)}
        </div>
        <div style={{ fontSize:13, color:C.gray3, marginTop:4 }}>
          {breakdown ? `Солонгос үнэ: ${formatKRW(car.price)}` : 'Солонгос вон'}
        </div>
      </div>

      {/* Breakdown */}
      {breakdown && (
        <div style={{ borderTop:`1px solid ${C.gray1}`, paddingTop:14, marginBottom:16 }}>
          {[
            { l:`Үндсэн үнэ (×${breakdown.wonToMnt}₮)`, v: formatMNT(breakdown.basePriceMnt) },
            ...breakdown.extraCosts.map(c => ({ l:c.label, v:formatMNT(c.amount) })),
          ].map((r,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.gray1}`, fontSize:13 }}>
              <span style={{ color:C.gray5 }}>{r.l}</span>
              <span style={{ fontWeight:600, color:C.black }}>{r.v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, marginTop:4, borderTop:`1.5px solid ${C.black}` }}>
            <span style={{ fontSize:14, fontWeight:700, color:C.black }}>Нийт дүн</span>
            <span style={{ fontSize:18, fontWeight:800, color:C.black, letterSpacing:'-0.5px' }}>{formatMNT(breakdown.totalPriceMnt)}</span>
          </div>
        </div>
      )}

      {car.adminNote && (
        <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'10px 12px', fontSize:12, color:C.blue, lineHeight:1.5, marginBottom:14 }}>
          ℹ️ {car.adminNote}
        </div>
      )}

      {/* Order */}
      <button onClick={() => setOpen(v=>!v)}
        style={{ width:'100%', padding:'14px 0', background:C.red, color:'#fff', fontSize:15, fontWeight:700, borderRadius:12, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.15s' }}
        onMouseOver={e=>e.currentTarget.style.background='#b91c1c'}
        onMouseOut={e=>e.currentTarget.style.background=C.red}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        Захиалах
      </button>

      {open && (
        <div style={{ marginTop:10, padding:14, background:C.gray1, borderRadius:12, display:'flex', flexDirection:'column', gap:8, animation:'fadeIn 0.2s ease' }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:C.gray3, marginBottom:2 }}>Холбоо барих</div>
          <a href={`https://m.me/YOUR_PAGE_ID?text=${msg}`} target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:10, background:'#0084ff', color:'#fff', fontWeight:600, fontSize:14, textDecoration:'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.905 1.408 5.504 3.623 7.22V21l3.323-1.83c.888.246 1.83.378 2.804.378 5.523 0 10-4.145 10-9.245S17.523 2 12 2zm1.07 12.458l-2.543-2.714-4.963 2.714 5.461-5.8 2.605 2.714 4.9-2.714-5.46 5.8z"/></svg>
            Messenger
          </a>
          <a href={`https://wa.me/976XXXXXXXX?text=${msg}`} target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:10, background:'#25d366', color:'#fff', fontWeight:600, fontSize:14, textDecoration:'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a6.606 6.606 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35C8.45 21.51 10.19 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
            WhatsApp
          </a>
          <div style={{ background:C.white, border:`1px solid ${C.gray2}`, borderRadius:8, padding:'10px 12px' }}>
            <div style={{ fontSize:11, color:C.gray3, marginBottom:3 }}>Машин</div>
            <div style={{ fontSize:13, fontWeight:600, color:C.black }}>{label}</div>
          </div>
        </div>
      )}

      {!car.isManual && car.encarId && (
        <button onClick={() => window.open(`https://www.encar.com/dc/dc_cardetailview.do?carid=${car.encarId}`,'_blank')}
          style={{ width:'100%', padding:13, background:C.black, color:'#fff', fontSize:14, fontWeight:600, borderRadius:12, border:'none', cursor:'pointer', marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.15s' }}
          onMouseOver={e=>e.currentTarget.style.background='#333'}
          onMouseOut={e=>e.currentTarget.style.background=C.black}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Encar дээр харах
        </button>
      )}
      <Link to="/catalog"
        style={{ display:'block', textAlign:'center', width:'100%', padding:'11px 0', background:C.white, color:C.gray5, fontSize:13, fontWeight:500, borderRadius:12, border:`1px solid ${C.gray2}`, marginTop:8, textDecoration:'none', transition:'all 0.15s' }}
        onMouseOver={e=>{ e.currentTarget.style.borderColor=C.black; e.currentTarget.style.color=C.black }}
        onMouseOut={e=>{ e.currentTarget.style.borderColor=C.gray2; e.currentTarget.style.color=C.gray5 }}
      >← Жагсаалт руу буцах</Link>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// SPEC CARD
// ═══════════════════════════════════════════════════
function SpecCard({ car }) {
  const rows = [
    ['Брэнд',          car.brand],
    ['Загвар',         car.model],
    ['Хувилбар',       car.badge],
    ['Он',             car.year ? `${car.year}он (${carAge(car.year)})` : null],
    ['Явсан зам',      formatMileage(car.mileage)],
    ['Түлш',           fuelTypeLabel[car.fuelType] || car.fuelType],
    ['Хурдны хайрцаг', transmissionLabel[car.transmission] || car.transmission],
    ['Хөдөлгүүр',      car.engineSize],
    ['Биеийн хэлбэр',  car.bodyType],
    ['Өнгө',           car.color],
    ['Байршил',        car.location],
    ['Дилер',          car.dealer?.name],
  ].filter(([,v]) => v)

  return (
    <div style={{ background:C.white, border:`1px solid ${C.gray2}`, borderRadius:20, padding:20 }}>
      <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:C.gray3, marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${C.gray1}` }}>Машины мэдээлэл</div>
      {rows.map(([l,v],i) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'7px 0', borderBottom: i<rows.length-1 ? `1px solid ${C.gray1}` : 'none', gap:12 }}>
          <span style={{ fontSize:12, color:C.gray3, flexShrink:0 }}>{l}</span>
          <span style={{ fontSize:13, fontWeight:600, color:C.black, textAlign:'right' }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// HISTORY CARD
// ═══════════════════════════════════════════════════
function HistCard({ car }) {
  const items = [
    { ok: car.history?.accidents===0, label:'Осол', value: car.history?.accidents===0 ? 'Осолгүй' : `${car.history?.accidents||0} удаа` },
    { ok: (car.history?.owners||1)<=1, label:'Өмчлөгч', value:`${car.history?.owners||1} эзэн` },
    { ok: !!car.history?.serviceRecords, label:'Засварын бүртгэл', value: car.history?.serviceRecords ? 'Бүртгэлтэй' : 'Мэдээлэлгүй' },
  ]
  return (
    <div style={{ background:C.white, border:`1px solid ${C.gray2}`, borderRadius:20, padding:20 }}>
      <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:C.gray3, marginBottom:14, paddingBottom:12, borderBottom:`1px solid ${C.gray1}` }}>Машины түүх</div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {items.map((it,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:28, height:28, borderRadius:'50%', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:800,
              background: it.ok ? '#dcfce7' : '#fef3c7',
              color:       it.ok ? C.green   : C.amber,
              border: `1.5px solid ${it.ok ? '#86efac' : '#fcd34d'}`,
            }}>{it.ok ? '✓' : '!'}</div>
            <div>
              <div style={{ fontSize:11, color:C.gray3, marginBottom:1 }}>{it.label}</div>
              <div style={{ fontSize:13, fontWeight:700, color: it.ok ? C.green : C.amber }}>{it.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// FEATURES
// ═══════════════════════════════════════════════════
function Features({ features }) {
  if (!features?.length) return null
  return (
    <div style={{ marginTop:28, paddingTop:24, borderTop:`1px solid ${C.gray2}` }}>
      <h2 style={{ fontSize:16, fontWeight:700, color:C.black, marginBottom:16 }}>Тоноглол</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:6 }}>
        {features.map((f,i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:7, padding:'7px 10px', background:C.gray1, borderRadius:8, fontSize:12, color:C.gray7, lineHeight:1.4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3" style={{ flexShrink:0, marginTop:2 }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {f}
          </div>
        ))}
      </div>
    </div>
  )
}