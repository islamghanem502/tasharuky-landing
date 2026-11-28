import { motion } from 'motion/react'
import { MARK_D, MARK_H, MARK_W } from './mark-path'
import './Coin.css'

/*
 * A 3-D coin: two struck faces and a stack of rim layers between them, so the edge
 * shows as it turns. Each face is drawn like a minted coin — a raised rim, a ring of
 * beads, and the Tasharuky mark in relief (lit from the top left).
 */
const RIM = 14

function Face({ id }) {
  const h = 96
  const s = h / MARK_H
  const w = MARK_W * s
  const at = (dx, dy) => `translate(${100 - w / 2 + dx} ${100 - h / 2 + dy}) scale(${s})`
  return (
    <svg viewBox="0 0 200 200" className="coin__svg">
      <defs>
        <radialGradient id={`${id}-metal`} cx="36%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff0bf" />
          <stop offset=".3" stopColor="#f4c862" />
          <stop offset=".7" stopColor="#dca03a" />
          <stop offset="1" stopColor="#b47a22" />
        </radialGradient>
        <linearGradient id={`${id}-relief`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4ac45" />
          <stop offset="1" stopColor="#b07722" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill={`url(#${id}-metal)`} />
      {/* raised rim */}
      <circle cx="100" cy="100" r="94" fill="none" stroke="#f7d27a" strokeWidth="9" />
      <circle cx="100" cy="100" r="89" fill="none" stroke="#a8711d" strokeWidth="1.5" opacity=".7" />
      {/* beads */}
      <circle cx="100" cy="100" r="82" fill="none" stroke="#a8711d" strokeWidth="3" strokeDasharray="0.1 7.2" strokeLinecap="round" opacity=".55" />
      {/* the mark, struck in relief */}
      <path d={MARK_D} fillRule="evenodd" transform={at(1.8, 2.2)} fill="#8a5713" opacity=".55" />
      <path d={MARK_D} fillRule="evenodd" transform={at(-1.2, -1.2)} fill="#fff4d2" opacity=".85" />
      <path d={MARK_D} fillRule="evenodd" transform={at(0, 0)} fill={`url(#${id}-relief)`} />
    </svg>
  )
}

export default function Coin({ spin }) {
  return (
    <div className="coin" aria-hidden="true">
      <motion.div className="coin__body" animate={{ rotateY: [0, 360] }} transition={{ ...spin, ease: 'linear' }}>
        {Array.from({ length: RIM }, (_, i) => (
          <i key={i} className="coin__rim" style={{ '--z': (i / (RIM - 1) - 0.5).toFixed(3) }} />
        ))}
        <div className="coin__face coin__face--front"><Face id="cf" /></div>
        <div className="coin__face coin__face--back"><Face id="cb" /></div>
      </motion.div>
    </div>
  )
}
