import { motion, useInView } from 'motion/react'
import { useRef, useState } from 'react'
import Bucket from '@/components/bucket'
import Hand from '@/components/Hand'
import { HAND_W } from '@/components/hand-art'
import './Give.css'

// The hand drawing is cropped to the band that holds the arm, the palm and the air above it.
const VIEW = { y: 140, h: 720 }
// Where the box frame sits in the hand's space: its body rests on the palm,
// between the thumb and the fingers, which curl up in front of it.
const BOX = { left: 800, top: 380, width: 372 }
const pctX = (v) => `${(v / HAND_W) * 100}%`
const pctY = (v) => `${((v - VIEW.y) / VIEW.h) * 100}%`

export default function Give() {
  const art = useRef(null)
  const seen = useInView(art, { once: true, amount: 0.5 })
  const [carried, setCarried] = useState(false)

  return (
    <section className="give">
      <h2>كل مساهمة منك تصنع أثرًا يمكن تتبعه بوضوح</h2>

      <div className="give__art" ref={art} style={{ aspectRatio: `${HAND_W}/${VIEW.h}` }}>
        <motion.div
          className="give__carry"
          initial={{ x: '-55vw' }}
          animate={seen ? { x: 0 } : undefined}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => seen && setCarried(true)}
        >
          <div className="give__box" style={{ left: pctX(BOX.left), top: pctY(BOX.top), width: pctX(BOX.width) }}>
            <Bucket active={carried} />
          </div>
          <svg className="give__hand" viewBox={`0 ${VIEW.y} ${HAND_W} ${VIEW.h}`} aria-hidden="true">
            <Hand />
          </svg>
        </motion.div>
      </div>
    </section>
  )
}
