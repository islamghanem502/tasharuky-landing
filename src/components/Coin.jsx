import { motion } from 'motion/react'
import './Coin.css'

/*
 * A real 3-D coin: two struck faces and a stack of thin rim layers between them,
 * so the edge shows as it turns. The face carries the Tasharuky mark in relief.
 */
const RIM = 12

export default function Coin({ spin }) {
  return (
    <div className="coin" aria-hidden="true">
      <motion.div className="coin__body" animate={{ rotateY: [0, 360] }} transition={{ ...spin, ease: 'linear' }}>
        {Array.from({ length: RIM }, (_, i) => (
          <i key={i} className="coin__rim" style={{ '--z': (i / (RIM - 1) - 0.5).toFixed(3) }} />
        ))}
        <div className="coin__face coin__face--front"><span className="coin__mark" /></div>
        <div className="coin__face coin__face--back"><span className="coin__mark" /></div>
      </motion.div>
    </div>
  )
}
