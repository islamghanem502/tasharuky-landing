import { HAND } from './hand-paths'

/**
 * The identity hand, in the box's 655×352 coordinate space.
 * Fingers and thumb carry a knockout edge in the page colour, so they read as
 * separate without any outline; the arm-and-palm shape is drawn over their roots.
 */
export default function Hand({ color = 'var(--brick)', ground = 'var(--paper)' }) {
  const knock = { fill: color, stroke: ground, strokeWidth: 7, paintOrder: 'stroke', strokeLinejoin: 'round' }
  return (
    <g>
      {['f4', 'f3', 'f2', 'f1'].map((k) => <path key={k} d={HAND[k]} style={knock} />)}
      <path d={HAND.thumb} style={knock} />
      <path d={HAND.armpalm} style={{ fill: color }} />
      {/* wrist creases and the thumbnail — the only details */}
      <path d="M690 396q10 7 20 0M710 396q10 7 20 0" style={{ fill: 'none', stroke: ground, strokeWidth: 3, strokeLinecap: 'round' }} />
      <ellipse cx="514" cy="302" rx="9.5" ry="6" transform="rotate(-50 514 302)" style={{ fill: ground }} />
    </g>
  )
}
