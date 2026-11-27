import { motion, useInView } from 'motion/react'
import { useRef, useState } from 'react'
import Bucket from '@/components/bucket'
import { HAND_D } from '@/components/hand-art'
import './Give.css'

/*
 * The box floats where it is. The hand comes in from the edge of the screen and
 * stops just beneath it — close, never touching — as if presenting it.
 * Everything is placed in the hand drawing's own units.
 */
const SCENE = { x: 0, y: -660, w: 1560, h: 1500 }
const BOX = { left: 332, top: -262, width: 1205 } // the box frame; its body hovers clear of the thumb and palm
// the drawing stops at its left edge; the arm carries on, off-screen
const ARM = 'M6 577.5C-200 561 -600 545 -3200 520L-3200 940C-600 880 -200 857 6 817.5Z'

const PALM = { x: 930, y: 575 }
const HAND_SCALE = 0.72 // the hand stays small: it presents, the box is the subject
const pct = (v, total) => `${(v / total) * 100}%`
const FLOAT = { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }

export default function Give() {
  const stage = useRef(null)
  const seen = useInView(stage, { once: true, amount: 0.45 })
  const [arrived, setArrived] = useState(false)

  return (
    <section className="give">
      <h2>كل مساهمة منك تصنع أثرًا يمكن تتبعه بوضوح</h2>

      <div className="give__stage" ref={stage} style={{ aspectRatio: `${SCENE.w}/${SCENE.h}` }}>
        {/* the box: already there, hovering */}
        <motion.div
          className="give__box"
          style={{ left: pct(BOX.left - SCENE.x, SCENE.w), top: pct(BOX.top - SCENE.y, SCENE.h), width: pct(BOX.width, SCENE.w) }}
          initial={{ opacity: 0, y: 24 }}
          animate={seen ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ y: ['0%', '-4%', '0%'], rotate: [-1.2, 1.2, -1.2] }}
            transition={{ y: FLOAT, rotate: { ...FLOAT, duration: 9 } }}
          >
            <Bucket active={arrived} />
          </motion.div>
        </motion.div>

        {/* the hand, reaching in underneath */}
        <svg className="give__hand" viewBox={`${SCENE.x} ${SCENE.y} ${SCENE.w} ${SCENE.h}`} aria-hidden="true">
          <defs>
            <filter id="give-soft" x="-50%" y="-300%" width="200%" height="700%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <clipPath id="give-palm">
              <path d={HAND_D} clipRule="evenodd" />
            </clipPath>
          </defs>
          <motion.g
            initial={{ x: -2300 }}
            animate={seen ? { x: 0 } : undefined}
            transition={{ duration: 2.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => seen && setArrived(true)}
          >
            <motion.g animate={{ y: [0, 10, 0] }} transition={FLOAT}>
              <g transform={`translate(${PALM.x} ${PALM.y}) scale(${HAND_SCALE}) translate(${-PALM.x} ${-PALM.y})`}>
                <path d={ARM} style={{ fill: 'var(--brick)' }} />
                <path d={HAND_D} fillRule="evenodd" style={{ fill: 'var(--brick)' }} />
                {/* the box's shadow on the palm: smaller and fainter as it rises */}
                <g clipPath="url(#give-palm)">
                  <motion.ellipse
                    cx="930"
                    cy="578"
                    rx="250"
                    ry="34"
                    filter="url(#give-soft)"
                    style={{ fill: 'rgba(40, 8, 2, 0.22)', transformBox: 'fill-box', transformOrigin: 'center' }}
                    animate={{ scaleX: [1, 0.8, 1], opacity: [1, 0.55, 1] }}
                    transition={FLOAT}
                  />
                </g>
              </g>
            </motion.g>
          </motion.g>
        </svg>
      </div>
    </section>
  )
}
