import { HAND_D } from './hand-art'

/** The identity hand: arm from the left edge, palm open and up. Use inside an <svg>. */
export default function Hand({ color = 'var(--brick)' }) {
  return <path d={HAND_D} fillRule="evenodd" style={{ fill: color }} />
}
