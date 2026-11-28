import { useImperativeHandle, useRef } from 'react'
import { MARK_D, MARK_H, MARK_W } from './mark-path'

/*
 * A coin turning about its vertical axis, drawn in plain 2-D SVG so it never flickers:
 * for an angle θ the face is squeezed to |cos θ| of its width, and the milled edge
 * shows as a band |sin θ| × thickness wide beside it. A highlight sweeps across as the
 * face turns towards the light. Call ref.current.turn(θ) to set the angle.
 */
const VB_W = 240
const VB_H = 200
const C = { x: VB_W / 2, y: VB_H / 2 }
const R = 92
const T = 20 // thickness

function Face() {
  const h = 96
  const s = h / MARK_H
  const w = MARK_W * s
  const at = (dx, dy) => `translate(${100 - w / 2 + dx} ${100 - h / 2 + dy}) scale(${s})`
  return (
    <>
      <circle cx="100" cy="100" r="100" fill="url(#coin-metal)" />
      <circle cx="100" cy="100" r="94" fill="none" stroke="#f7d27a" strokeWidth="9" />
      <circle cx="100" cy="100" r="89" fill="none" stroke="#a8711d" strokeWidth="1.5" opacity=".7" />
      <circle
        cx="100"
        cy="100"
        r="82"
        fill="none"
        stroke="#a8711d"
        strokeWidth="3"
        strokeDasharray="0.1 7.2"
        strokeLinecap="round"
        opacity=".55"
      />
      <path d={MARK_D} fillRule="evenodd" transform={at(1.8, 2.2)} fill="#8a5713" opacity=".55" />
      <path d={MARK_D} fillRule="evenodd" transform={at(-1.2, -1.2)} fill="#fff4d2" opacity=".85" />
      <path d={MARK_D} fillRule="evenodd" transform={at(0, 0)} fill="url(#coin-relief)" />
    </>
  )
}

export const COIN_ASPECT = VB_W / VB_H

export default function Coin({ ref }) {
  const back = useRef(null)
  const band = useRef(null)
  const face = useRef(null)
  const shade = useRef(null)
  const shine = useRef(null)

  useImperativeHandle(ref, () => ({
    turn(theta) {
      const c = Math.cos(theta)
      const s = Math.sin(theta)
      const sx = Math.max(Math.abs(c), 0.002)
      const dx = -T * s
      back.current.setAttribute('cx', (C.x + dx).toFixed(2))
      back.current.setAttribute('rx', (R * sx).toFixed(2))
      for (const r of band.current.children) {
        r.setAttribute('x', (C.x + Math.min(0, dx)).toFixed(2))
        r.setAttribute('width', Math.abs(dx).toFixed(2))
      }
      face.current.setAttribute('transform', `translate(${C.x} ${C.y}) scale(${(sx * R) / 100} ${R / 100}) translate(-100 -100)`)
      shade.current.setAttribute('rx', (R * sx).toFixed(2))
      shade.current.style.opacity = ((1 - sx) * 0.42).toFixed(3)
      // light comes from the upper left: the face flashes as it turns towards it
      shine.current.style.opacity = (0.55 * Math.pow(Math.max(0, Math.cos(theta - 0.5)), 6)).toFixed(3)
    },
  }))

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" style={{ overflow: 'visible' }} aria-hidden="true">
      <defs>
        <radialGradient id="coin-metal" cx="36%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff0bf" />
          <stop offset=".3" stopColor="#f4c862" />
          <stop offset=".7" stopColor="#dca03a" />
          <stop offset="1" stopColor="#b47a22" />
        </radialGradient>
        <linearGradient id="coin-relief" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4ac45" />
          <stop offset="1" stopColor="#b07722" />
        </linearGradient>
        <linearGradient id="coin-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d89f3e" />
          <stop offset=".5" stopColor="#b17a23" />
          <stop offset="1" stopColor="#7f5414" />
        </linearGradient>
        <pattern id="coin-mill" width="6" height="3.4" patternUnits="userSpaceOnUse">
          <rect width="6" height="1.5" fill="#6f4710" opacity=".45" />
        </pattern>
        <radialGradient id="coin-shine" cx="40%" cy="35%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse ref={back} cx={C.x} cy={C.y} rx={R} ry={R} fill="url(#coin-edge)" />
      <g ref={band}>
        <rect x="0" y={C.y - R} width="0" height={2 * R} fill="url(#coin-edge)" />
        <rect x="0" y={C.y - R} width="0" height={2 * R} fill="url(#coin-mill)" />
      </g>
      <g ref={face} transform={`translate(${C.x - R} ${C.y - R}) scale(${R / 100})`}>
        <Face />
        <circle ref={shine} cx="100" cy="100" r="100" fill="url(#coin-shine)" style={{ opacity: 0 }} />
      </g>
      <ellipse ref={shade} cx={C.x} cy={C.y} rx={R} ry={R} fill="#3a2205" style={{ opacity: 0 }} />
    </svg>
  )
}
