/**
 * A jigsaw piece. `sides` = { t, r, b, l } where 1 = tab, -1 = socket, 0 = flat.
 * Built from a rounded square + circular knobs so it stays crisp and fully animatable.
 * Origin is the top-left corner, size S.
 */
export const S = 200
const NECK = 12   // half height of the neck
const D = 30      // knob centre distance from the edge
const KR = 25     // knob radius

const ROT = { r: 0, b: 90, l: 180, t: 270 }

const Knob = ({ side, fill }) => (
  <g transform={`rotate(${ROT[side]} ${S / 2} ${S / 2})`} fill={fill}>
    <rect x={S - 4} y={S / 2 - NECK} width={D + 4} height={NECK * 2} />
    <circle cx={S + D} cy={S / 2} r={KR} />
  </g>
)
// socket = the neighbour's knob, pushed inwards (cut from the body through a mask)
const Socket = ({ side }) => (
  <g transform={`rotate(${ROT[side]} ${S / 2} ${S / 2})`} fill="#000">
    <rect x={S - D} y={S / 2 - NECK - 0.5} width={D + 6} height={NECK * 2 + 1} />
    <circle cx={S - D} cy={S / 2} r={KR + 0.5} />
  </g>
)

export default function Piece({ id, fill, sides, className = '', children }) {
  const entries = Object.entries(sides)
  return (
    <g className={`piece ${className}`}>
      <defs>
        <mask id={`m-${id}`} maskUnits="userSpaceOnUse" x={-90} y={-90} width={S + 180} height={S + 180}>
          <rect x={-90} y={-90} width={S + 180} height={S + 180} fill="#fff" />
          {entries.filter(([, v]) => v === -1).map(([k]) => <Socket key={k} side={k} />)}
        </mask>
        <linearGradient id={`s-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".26" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
      </defs>
      {entries.filter(([, v]) => v === 1).map(([k]) => <Knob key={k} side={k} fill={fill} />)}
      <g mask={`url(#m-${id})`}>
        <rect width={S} height={S} rx="26" fill={fill} />
        <rect width={S} height={S} rx="26" fill={`url(#s-${id})`} />
        <rect x="6" y="6" width={S - 12} height={S - 12} rx="21" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="2" />
      </g>
      {entries.filter(([, v]) => v === 1).map(([k]) => (
        <g key={`h${k}`} transform={`rotate(${ROT[k]} ${S / 2} ${S / 2})`}>
          <circle cx={S + D} cy={S / 2} r={KR} fill={`url(#s-${id})`} />
        </g>
      ))}
      {children}
    </g>
  )
}
