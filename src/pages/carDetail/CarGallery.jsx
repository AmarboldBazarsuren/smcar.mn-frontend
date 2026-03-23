import { useState, useEffect } from 'react'
import { getImageUrl } from '../../services/api'
import styles from '../CarDetail.module.css'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000'

export default function CarGallery({ car }) {
  const [activeImg, setImg]    = useState(0)
  const [imgModal,  setModal]  = useState(false)
  const [images,    setImages] = useState([])
  const [loading,   setLoading] = useState(true)
  const [mobile,    setMobile]  = useState(window.innerWidth < 769)

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 769)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    setImg(0); setImages([]); setLoading(true)
    if (car.isManual || !car.encarId) {
      setImages((car.images || []).map(img => getImageUrl(img.url)).filter(Boolean))
      setLoading(false); return
    }
    fetch(`${API_BASE}/api/images/encar/${car.encarId}/list`)
      .then(r => r.json())
      .then(({ indexes }) => {
        setImages(!indexes?.length
          ? (car.images || []).map(img => getImageUrl(img.url)).filter(Boolean)
          : indexes.map(i => `${API_BASE}/api/images/encar/${car.encarId}/${String(i).padStart(3,'0')}`)
        )
        setLoading(false)
      })
      .catch(() => {
        setImages((car.images || []).map(img => getImageUrl(img.url)).filter(Boolean))
        setLoading(false)
      })
  }, [car.encarId, car.isManual])

  useEffect(() => {
    const fn = e => {
      if (e.key === 'ArrowLeft')  setImg(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setImg(i => Math.min(images.length - 1, i + 1))
      if (e.key === 'Escape')     setModal(false)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [images.length])

  const cur = images[activeImg] || null

  // ── Inline styles — CSS-аас огт хамаарахгүй ──
  const S = {
    // Desktop: row. Mobile: column
    wrapper: mobile
      ? { display:'flex', flexDirection:'column', gap:6 }
      : { display:'flex', flexDirection:'row', gap:8, height:460, overflow:'hidden' },

    // Том зураг
    mainWrap: {
      position:'relative', borderRadius:12, overflow:'hidden',
      background:'#f3f3f3', border:'1px solid #e8e8e8', cursor:'zoom-in',
      ...(mobile
        ? { width:'100%', height:250, flexShrink:0 }
        : { flex:1, minWidth:0, height:460 }),
    },
    mainImg: { width:'100%', height:'100%', objectFit:'cover', display:'block' },

    // Thumbnail container
    // Desktop: column + overflow-y scroll, fixed width
    // Mobile:  row    + overflow-x scroll, fixed height
    thumbCon: mobile
      ? {
          display:'flex', flexDirection:'row', gap:5,
          overflowX:'auto', overflowY:'hidden',
          height:70, width:'100%', flexShrink:0,
        }
      : {
          display:'flex', flexDirection:'column', gap:5,
          overflowY:'auto', overflowX:'hidden',
          width:90, height:460, flexShrink:0,
        },

    // Thumbnail item — FIXED size, never shrinks
    thumbBtn: (active) => ({
      display:'block', padding:0,
      width:  mobile ? 88 : 90,
      minWidth: mobile ? 88 : 90,
      height: mobile ? 64 : 68,
      minHeight: mobile ? 64 : 68,
      flexShrink: 0,
      flexGrow: 0,
      borderRadius:6, overflow:'hidden',
      background:'#f3f3f3', cursor:'pointer',
      border: active ? '2px solid #111' : '2px solid transparent',
      transition:'border-color 0.15s',
      boxSizing:'border-box',
    }),
    thumbImg: { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  }

  return (
    <>
      <div style={S.wrapper}>

        {/* Том зураг */}
        <div style={S.mainWrap}>
          {loading
            ? <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div className={styles.spin}/>
              </div>
            : cur
              ? <img key={cur} src={cur} alt={car.title} style={S.mainImg}
                  onClick={() => setModal(true)}
                  onError={e => { e.target.style.display='none' }}/>
              : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#d0d0d0'}}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                    <rect x="2" y="6" width="20" height="12" rx="2"/>
                    <circle cx="8" cy="13" r="2"/><circle cx="16" cy="13" r="2"/>
                    <path d="M6 6l2-3h8l2 3"/>
                  </svg>
                </div>
          }

          {images.length > 1 && <>
            <button className={`${styles.navBtn} ${styles.navBtnL}`}
              onClick={() => setImg(i => Math.max(0,i-1))} disabled={activeImg===0}>‹</button>
            <button className={`${styles.navBtn} ${styles.navBtnR}`}
              onClick={() => setImg(i => Math.min(images.length-1,i+1))} disabled={activeImg===images.length-1}>›</button>
            <div className={styles.imgCount}>{activeImg+1} / {images.length}</div>
          </>}

          {car.history?.accidents === 0 &&
            <div className={styles.accBadge}>✓ 무사고 (Осолгүй)</div>}
          {car.status === 'sold' &&
            <div className={styles.soldOverlay}>ЗАРАГДСАН</div>}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={S.thumbCon}>
            {images.map((url, i) => (
              <button key={i} style={S.thumbBtn(activeImg===i)} onClick={() => setImg(i)}>
                <img src={url} alt={`${i+1}`} style={S.thumbImg}
                  onError={e => { e.target.parentElement.style.display='none' }}/>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {imgModal && cur && (
        <div className={styles.modal} onClick={() => setModal(false)}>
          <button className={styles.modalClose} onClick={() => setModal(false)}>✕</button>
          <button className={`${styles.modalNav} ${styles.modalNavL}`}
            onClick={e => { e.stopPropagation(); setImg(i => Math.max(0,i-1)) }}
            disabled={activeImg===0}>‹</button>
          <img src={cur} alt={`${activeImg+1}`} className={styles.modalImg}
            onClick={e => e.stopPropagation()}/>
          <button className={`${styles.modalNav} ${styles.modalNavR}`}
            onClick={e => { e.stopPropagation(); setImg(i => Math.min(images.length-1,i+1)) }}
            disabled={activeImg===images.length-1}>›</button>
          <div className={styles.modalCount}>{activeImg+1} / {images.length}</div>
        </div>
      )}
    </>
  )
}