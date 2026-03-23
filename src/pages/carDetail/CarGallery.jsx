import { useState, useEffect, useCallback } from 'react'
import { getImageUrl } from '../../services/api'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000'

export default function CarGallery({ car }) {
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
    const fn = e => {
      if (!modal) return
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
      {/* ── Main image ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '62%',
        background: '#f0f0f0',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #e5e5e5',
        cursor: cur ? 'zoom-in' : 'default',
      }}>
        <div style={{ position:'absolute', inset:0 }}>
          {loading ? (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Spinner />
            </div>
          ) : cur ? (
            <img src={cur} alt={car.title}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.4s' }}
              onClick={() => setModal(true)}
              onError={e => { e.target.style.display='none' }}
            />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc' }}>
              <CarIcon />
            </div>
          )}
        </div>

        {/* Arrows */}
        {images.length > 1 && <>
          <NavBtn dir="left"  disabled={active===0}              onClick={() => setActive(i => Math.max(0,i-1))} />
          <NavBtn dir="right" disabled={active===images.length-1} onClick={() => setActive(i => Math.min(images.length-1,i+1))} />
          <div style={{
            position:'absolute', bottom:12, right:12,
            background:'rgba(0,0,0,0.5)', color:'#fff',
            fontSize:12, fontWeight:600, padding:'3px 10px',
            borderRadius:99, pointerEvents:'none',
          }}>{active+1} / {images.length}</div>
        </>}

        {car.history?.accidents === 0 && (
          <div style={{
            position:'absolute', bottom:12, left:12,
            background:'rgba(22,163,74,0.12)', border:'1px solid rgba(22,163,74,0.3)',
            color:'#16a34a', fontSize:11, fontWeight:700,
            padding:'3px 10px', borderRadius:99, pointerEvents:'none',
          }}>✓ Осолгүй</div>
        )}
        {car.status === 'sold' && (
          <div style={{
            position:'absolute', inset:0, background:'rgba(0,0,0,0.6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, fontWeight:800, color:'#ef4444', letterSpacing:3,
          }}>ЗАРАГДСАН</div>
        )}
      </div>

      {/* ── Thumbnail horizontal scroll ── */}
      {images.length > 1 && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 6,
          marginTop: 8,
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: 4,
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}>
          {images.map((url, i) => (
            <button key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                width: 80,
                height: 58,
                borderRadius: 8,
                overflow: 'hidden',
                border: active===i ? '2px solid #111' : '2px solid transparent',
                background: '#f0f0f0',
                padding: 0,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                boxSizing: 'border-box',
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
          style={{
            position:'fixed', inset:0, zIndex:1000,
            background:'rgba(0,0,0,0.95)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}
        >
          <button onClick={() => setModal(false)}
            style={{
              position:'absolute', top:16, right:16,
              width:40, height:40, borderRadius:'50%',
              background:'rgba(255,255,255,0.1)', color:'#fff',
              fontSize:20, display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', border:'none',
            }}>✕</button>
          <button disabled={active===0}
            onClick={e => { e.stopPropagation(); setActive(i=>Math.max(0,i-1)) }}
            style={{
              position:'absolute', left:16, top:'50%', transform:'translateY(-50%)',
              width:48, height:48, borderRadius:'50%',
              background:'rgba(255,255,255,0.15)', color:'#fff',
              fontSize:26, display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', border:'none', opacity: active===0 ? 0.3 : 1,
            }}>‹</button>
          <img src={cur} alt={active+1}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth:'92vw', maxHeight:'88vh', objectFit:'contain', borderRadius:8 }}
          />
          <button disabled={active===images.length-1}
            onClick={e => { e.stopPropagation(); setActive(i=>Math.min(images.length-1,i+1)) }}
            style={{
              position:'absolute', right:16, top:'50%', transform:'translateY(-50%)',
              width:48, height:48, borderRadius:'50%',
              background:'rgba(255,255,255,0.15)', color:'#fff',
              fontSize:26, display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', border:'none', opacity: active===images.length-1 ? 0.3 : 1,
            }}>›</button>
          <div style={{
            position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)',
            color:'rgba(255,255,255,0.5)', fontSize:13,
          }}>{active+1} / {images.length}</div>
        </div>
      )}
    </>
  )
}

function NavBtn({ dir, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        position:'absolute', top:'50%', transform:'translateY(-50%)',
        [dir==='left' ? 'left' : 'right']: 10,
        width:38, height:38, borderRadius:'50%',
        background:'rgba(255,255,255,0.9)', border:'1px solid rgba(0,0,0,0.08)',
        fontSize:20, color:'#111',
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        zIndex:2, boxShadow:'0 2px 8px rgba(0,0,0,0.12)',
      }}
    >{dir==='left' ? '‹' : '›'}</button>
  )
}

function Spinner() {
  return (
    <div style={{
      width:28, height:28,
      border:'2px solid #e5e5e5',
      borderTopColor:'#111',
      borderRadius:'50%',
      animation:'spin 0.7s linear infinite',
    }}/>
  )
}

function CarIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="8" cy="13" r="2"/><circle cx="16" cy="13" r="2"/>
      <path d="M6 6l2-3h8l2 3"/>
    </svg>
  )
}