import { useEffect, useRef } from 'react'
import Coin, { COIN_ASPECT } from '@/components/Coin'

/*
 * Bucket — from @uselayouts/bucket, recoloured flat in the Tasharuky palette.
 * Same build as the original: back panels, a middle layer where things fall,
 * and the front panels drawn over it so whatever drops in disappears inside.
 *
 * Everything moves off one clock, so the fall, the turn of the coin, the light and
 * the flaps can never drift apart:
 *   the coin falls and makes one full turn → it goes in → light spills from the mouth
 *   and the flaps answer on a soft, dying spring → a pause → again.
 */

const BOX = { flap: '#5aafac', inside: '#1c5d5c', corner: '#164e4d', body: 'var(--teal)', lid: '#3e9e9b' }

const W = 655
const H = 352
const COIN_W = 165
const REST = { x: 330, y: 190 } // where the coin ends up, hidden inside the box
const DROP = 560 // how far above that it starts

const PERIOD = 6.4 // seconds, one full cycle
const FALL = 2.9 // seconds the coin is in the air

const px = (v) => `${(v / W) * 100}%`
const py = (v) => `${(v / H) * 100}%`
const clamp01 = (v) => Math.min(1, Math.max(0, v))

const Bucket = ({ active = true }) => {
  const coinWrap = useRef(null)
  const coin = useRef(null)
  const glow = useRef(null)
  const flapL = useRef(null)
  const flapR = useRef(null)

  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let last = performance.now()
    let clock = 0
    let visible = true

    const frame = (now) => {
      clock += Math.min(now - last, 50) / 1000
      last = now
      const t = clock % PERIOD

      // the fall: starts gently, gathers speed like a real drop
      const u = clamp01(t / FALL)
      const y = -DROP * (1 - (0.18 * u + 0.82 * u * u))
      coinWrap.current.style.transform = `translate3d(0, ${((y / H) * 100).toFixed(3)}%, 0)`
      coinWrap.current.style.opacity = (t < FALL ? clamp01(t / 0.45) : 0).toFixed(3)
      coin.current?.turn(u * Math.PI * 2)

      // after it goes in
      const tau = t - FALL
      const g = tau > 0 ? (1 - Math.exp(-tau / 0.12)) * Math.exp(-tau / 0.85) : 0
      glow.current.style.opacity = (g * 1.25).toFixed(3)
      glow.current.style.transform = `scale(${(0.85 + 0.25 * clamp01(tau / 1.2)).toFixed(3)})`
      const a = tau > 0 ? 8 * Math.exp(-tau * 2.4) * Math.sin(2 * Math.PI * 1.05 * tau) : 0
      flapR.current.style.transform = `rotate(${a.toFixed(3)}deg)`
      flapL.current.style.transform = `rotate(${(-a).toFixed(3)}deg)`

      raf = visible ? requestAnimationFrame(frame) : 0
    }
    const wake = () => {
      if (!raf && visible) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden
      wake()
    })
    io.observe(coinWrap.current.parentElement)
    const onVis = () => {
      visible = !document.hidden
      wake()
    }
    document.addEventListener('visibilitychange', onVis)
    wake()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [active])

  const flapStyle = (origin) => ({ transformBox: 'view-box', transformOrigin: origin })

  return (
    <div className="relative isolate w-full" style={{ aspectRatio: `${W}/${H}` }}>
      {/* the shadow it casts on the page: light from the upper left */}
      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="bk-cast" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1e1a17" stopOpacity=".42" />
            <stop offset=".5" stopColor="#1e1a17" stopOpacity=".2" />
            <stop offset="1" stopColor="#1e1a17" stopOpacity="0" />
          </linearGradient>
          <filter id="bk-blur-l" x="-30%" y="-200%" width="160%" height="500%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="bk-blur-s" x="-20%" y="-300%" width="140%" height="700%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>
        {/* cast shadow, falling back and to the right along the ground */}
        <path d="M160 352 L536 352 L790 306 L380 306 Z" fill="url(#bk-cast)" filter="url(#bk-blur-l)" />
        {/* contact: where the box meets the ground */}
        <ellipse cx="330" cy="352" rx="212" ry="6" fill="#1e1a17" opacity=".42" filter="url(#bk-blur-s)" />
      </svg>

      {/* back panels */}
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <path
          ref={flapR}
          style={flapStyle('512px 61px')}
          d="M535.59 78.7427L487.973 42.8776L558.738 13.9516C562.902 12.2494 564.984 11.3984 567.143 11.5597C569.301 11.7211 571.233 12.8723 575.098 15.1747L590.22 24.1832C603.923 32.347 610.775 36.4289 610.372 42.0779C609.97 47.7269 602.609 50.7964 587.887 56.9354L535.59 78.7427Z"
          fill={BOX.flap}
        />
        <path
          ref={flapL}
          style={flapStyle('147px 61px')}
          d="M123.116 79.1145L171.548 42.8776L97.2715 12.5164C94.8305 11.5186 93.61 11.0197 92.3446 11.1143C91.0793 11.2089 89.9465 11.8837 87.681 13.2334L56.155 32.0149C48.1832 36.7641 44.1973 39.1386 44.4205 42.4378C44.6438 45.737 48.9132 47.553 57.4522 51.1849L123.116 79.1145Z"
          fill={BOX.flap}
        />
        <path d="M487.973 42.8774L171.548 42.8775L123.116 79.1144L535.59 78.7424L487.973 42.8774Z" fill={BOX.inside} />
        <path d="M171.548 78.9088V42.8774L123.116 79.1144L171.548 78.9088Z" fill={BOX.corner} />
        <path d="M487.973 78.9088V42.8774L536.404 79.1144L487.973 78.9088Z" fill={BOX.corner} />
      </svg>

      {/* middle: the coin, and the light that answers it */}
      <div className="pointer-events-none absolute inset-0">
        <div
          ref={glow}
          className="absolute"
          style={{
            left: px(120),
            top: py(-170),
            width: px(420),
            height: py(260),
            opacity: 0,
            transformOrigin: '50% 85%',
            background: 'radial-gradient(50% 50% at 50% 72%, rgba(255, 214, 120, 0.8), rgba(255, 214, 120, 0) 70%)',
          }}
        />
        <div ref={coinWrap} className="absolute inset-0" style={{ opacity: 0, willChange: 'transform' }}>
          <div
            className="absolute"
            style={{
              left: px(REST.x - COIN_W / 2),
              top: py(REST.y - COIN_W / COIN_ASPECT / 2),
              width: px(COIN_W),
              aspectRatio: COIN_ASPECT,
            }}
          >
            <Coin ref={coin} />
          </div>
        </div>
      </div>

      {/* front panels, over the coin */}
      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id="bk-body">
            <path d="M512.766 79.1595L147.766 79.1624C136.453 79.1625 130.796 79.1626 127.281 82.6773C123.766 86.192 123.766 91.8488 123.766 103.162V327.159C123.766 338.473 123.766 344.13 127.281 347.645C130.796 351.159 136.453 351.159 147.766 351.159H512.766C524.08 351.159 529.737 351.159 533.252 347.645C536.766 344.13 536.766 338.473 536.766 327.159V103.159C536.766 91.8457 536.766 86.1888 533.252 82.6741C529.737 79.1594 524.08 79.1594 512.766 79.1595Z" />
          </clipPath>
          <linearGradient id="bk-under-lid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d3332" stopOpacity=".32" />
            <stop offset="1" stopColor="#0d3332" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bk-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d3332" stopOpacity="0" />
            <stop offset="1" stopColor="#0d3332" stopOpacity=".2" />
          </linearGradient>
          <linearGradient id="bk-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".07" />
            <stop offset=".5" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#0d3332" stopOpacity=".1" />
          </linearGradient>
        </defs>
        <path
          d="M512.766 79.1595L147.766 79.1624C136.453 79.1625 130.796 79.1626 127.281 82.6773C123.766 86.192 123.766 91.8488 123.766 103.162V327.159C123.766 338.473 123.766 344.13 127.281 347.645C130.796 351.159 136.453 351.159 147.766 351.159H512.766C524.08 351.159 529.737 351.159 533.252 347.645C536.766 344.13 536.766 338.473 536.766 327.159V103.159C536.766 91.8457 536.766 86.1888 533.252 82.6741C529.737 79.1594 524.08 79.1594 512.766 79.1595Z"
          style={{ fill: BOX.body }}
        />
        {/* light on the body: the lid's shadow, a darker foot, the right side turning away */}
        <g clipPath="url(#bk-body)">
          <rect x="120" y="191" width="420" height="34" fill="url(#bk-under-lid)" />
          <rect x="120" y="290" width="420" height="62" fill="url(#bk-ground)" />
          <rect x="120" y="79" width="420" height="273" fill="url(#bk-side)" />
        </g>
        <path
          d="M74.6011 164.033L123.116 79.1138L535.59 78.7419L581.532 164.469C588.006 176.55 591.243 182.59 588.568 187.06C585.892 191.529 579.039 191.529 565.333 191.529H90.5591C76.4759 191.529 69.4343 191.529 66.7781 186.953C64.1219 182.376 67.615 176.262 74.6011 164.033Z"
          fill={BOX.lid}
        />
      </svg>
    </div>
  )
}

export default Bucket
