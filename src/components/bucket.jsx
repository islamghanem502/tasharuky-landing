import { motion } from 'motion/react'

/*
 * Bucket — from @uselayouts/bucket, recoloured flat in the Tasharuky palette.
 * Same build as the original: back panels, a middle layer where things fall,
 * and the front panels drawn over it so whatever drops in disappears inside.
 * A single coin replaces the chips: it falls from above, turns once, and is gone — slowly, on a loop.
 */

const BOX = {
  flap: '#5aafac',
  inside: '#1c5d5c',
  corner: '#164e4d',
  body: 'var(--teal)',
  lid: '#3e9e9b',
}

const W = 655
const H = 352
const COIN = 124
const REST = { x: 330, y: 182 } // where the coin ends up, hidden inside the box
const DROP = 600 // how far above that it starts
const LOOP = { duration: 2.6, repeat: Infinity, repeatDelay: 2.4 }
const px = (v) => `${(v / W) * 100}%`
const py = (v) => `${(v / H) * 100}%`

function Coin() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <circle cx="60" cy="60" r="58" fill="var(--gold-deep)" />
      <circle cx="60" cy="56" r="54" fill="var(--gold)" />
      <circle cx="60" cy="56" r="38" fill="none" stroke="var(--gold-deep)" strokeWidth="4" opacity=".5" />
    </svg>
  )
}

const Bucket = ({ active = true }) => {
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const run = active && !still

  return (
    <div className="relative isolate w-full" style={{ aspectRatio: `${W}/${H}` }}>
      {/* the box gives a little as the coin lands */}
      <motion.div
        className="absolute inset-0"
        animate={run ? { y: [0, 0, 5, 0] } : undefined}
        transition={{ ...LOOP, times: [0, 0.9, 0.95, 1], ease: 'easeOut' }}
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

        {/* middle: the coin falls into the mouth of the box */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {run && (
            <motion.div
              className="absolute inset-0"
              initial={{ y: py(-DROP), opacity: 0 }}
              animate={{ y: [py(-DROP), py(0)], opacity: [0, 1, 1] }}
              transition={{
                y: { ...LOOP, ease: [0.5, 0, 0.8, 0.45] },
                opacity: { ...LOOP, times: [0, 0.18, 1] },
              }}
            >
              <motion.div
                className="absolute"
                style={{
                  left: px(REST.x - COIN / 2),
                  top: py(REST.y - COIN / 2),
                  width: px(COIN),
                  aspectRatio: '1',
                  transformPerspective: 600,
                }}
                animate={{ rotateY: [0, 360] }}
                transition={{ ...LOOP, ease: 'linear' }}
              >
                <Coin />
              </motion.div>
            </motion.div>
          )}
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
      </motion.div>
    </div>
  )
}

export default Bucket
