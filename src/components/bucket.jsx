import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import Hand from '@/components/Hand'

/*
 * Bucket — from @uselayouts/bucket, recoloured flat in the Tasharuky palette.
 * Same build as the original: back panels, a middle layer where things fall,
 * and the front panels drawn over it so whatever drops in disappears inside.
 * Coins replace the chips, and the box is carried in by the identity hand.
 */

const BOX = {
  flap: '#5aafac',
  inside: '#1c5d5c',
  corner: '#164e4d',
  body: 'var(--teal)',
  lid: '#3e9e9b',
}

const W = 655,
  H = 352
const OPEN_Y = 58 // where a coin enters, just above the opening
const SPAWN_MS = 720

function Coin() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="var(--gold-deep)" />
      <circle cx="24" cy="22.5" r="21" fill="var(--gold)" />
      <circle cx="24" cy="22.5" r="14" fill="none" stroke="var(--gold-deep)" strokeWidth="2" opacity=".55" />
    </svg>
  )
}

const Bucket = () => {
  const [coins, setCoins] = useState([])
  const [carried, setCarried] = useState(false)
  const id = useRef(0)
  const frame = useRef(null)
  // watch the still frame, not the moving box: a box parked off-screen never counts as "in view"
  const seen = useInView(frame, { once: true, amount: 0.5 })

  // a steady, unhurried drip of coins once the hand has brought the box in
  useEffect(() => {
    if (!carried || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let t
    const drop = () => {
      const n = ++id.current
      setCoins((c) => [
        ...c.slice(-7),
        {
          id: n,
          x: 205 + Math.random() * 250, // inside the mouth of the box
          r: (Math.random() - 0.5) * 50,
          d: 1.05 + Math.random() * 0.25,
        },
      ])
      t = setTimeout(drop, SPAWN_MS + Math.random() * 380)
    }
    drop()
    return () => clearTimeout(t)
  }, [carried])

  return (
    <div ref={frame} className="relative isolate w-full max-w-[600px]" style={{ aspectRatio: `${W}/${H}` }}>
      <motion.div
        className="absolute inset-0"
        initial={{ x: '62vw' }}
        animate={seen ? { x: 0 } : undefined}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => {
          if (seen) setCarried(true)
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={carried ? { y: [0, -5, 0] } : undefined}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* back panels */}
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 z-0 h-full w-full overflow-visible" aria-hidden="true">
            <path
              d="M535.59 78.7427L487.973 42.8776L558.738 13.9516C562.902 12.2494 564.984 11.3984 567.143 11.5597C569.301 11.7211 571.233 12.8723 575.098 15.1747L590.22 24.1832C603.923 32.347 610.775 36.4289 610.372 42.0779C609.97 47.7269 602.609 50.7964 587.887 56.9354L535.59 78.7427Z"
              fill={BOX.flap}
            />
            <path
              d="M123.116 79.1145L171.548 42.8776L97.2715 12.5164C94.8305 11.5186 93.61 11.0197 92.3446 11.1143C91.0793 11.2089 89.9465 11.8837 87.681 13.2334L56.155 32.0149C48.1832 36.7641 44.1973 39.1386 44.4205 42.4378C44.6438 45.737 48.9132 47.553 57.4522 51.1849L123.116 79.1145Z"
              fill={BOX.flap}
            />
            <path d="M487.973 42.8774L171.548 42.8775L123.116 79.1144L535.59 78.7424L487.973 42.8774Z" fill={BOX.inside} />
            <path d="M171.548 78.9088V42.8774L123.116 79.1144L171.548 78.9088Z" fill={BOX.corner} />
            <path d="M487.973 78.9088V42.8774L536.404 79.1144L487.973 78.9088Z" fill={BOX.corner} />
          </svg>

          {/* middle: coins fall into the mouth of the box */}
          <div className="pointer-events-none absolute inset-0 z-10">
            {coins.map((c) => (
              <motion.div
                key={c.id}
                className="absolute inset-0"
                initial={{ y: '-62%' }}
                animate={{ y: '24%' }}
                transition={{ duration: c.d, ease: [0.5, 0, 0.9, 0.5] }}
                onAnimationComplete={() => setCoins((all) => all.filter((x) => x.id !== c.id))}
              >
                <motion.div
                  className="absolute"
                  style={{
                    left: `${((c.x - 28) / W) * 100}%`,
                    top: `${(OPEN_Y / H) * 100}%`,
                    width: `${(56 / W) * 100}%`,
                    aspectRatio: '1',
                  }}
                  initial={{ rotate: 0, scaleX: 1 }}
                  animate={{ rotate: c.r, scaleX: [1, 0.35, 1, 0.5] }}
                  transition={{ duration: c.d, ease: 'easeInOut' }}
                >
                  <Coin />
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* front panels, over the coins */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <path
              d="M512.766 79.1595L147.766 79.1624C136.453 79.1625 130.796 79.1626 127.281 82.6773C123.766 86.192 123.766 91.8488 123.766 103.162V327.159C123.766 338.473 123.766 344.13 127.281 347.645C130.796 351.159 136.453 351.159 147.766 351.159H512.766C524.08 351.159 529.737 351.159 533.252 347.645C536.766 344.13 536.766 338.473 536.766 327.159V103.159C536.766 91.8457 536.766 86.1888 533.252 82.6741C529.737 79.1594 524.08 79.1594 512.766 79.1595Z"
              style={{ fill: BOX.body }}
            />
            <path
              d="M74.6011 164.033L123.116 79.1138L535.59 78.7419L581.532 164.469C588.006 176.55 591.243 182.59 588.568 187.06C585.892 191.529 579.039 191.529 565.333 191.529H90.5591C76.4759 191.529 69.4343 191.529 66.7781 186.953C64.1219 182.376 67.615 176.262 74.6011 164.033Z"
              fill={BOX.lid}
            />
          </svg>

          {/* the hand that carries it in, reaching from beyond the edge of the screen */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <Hand />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Bucket
