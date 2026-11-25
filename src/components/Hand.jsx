/**
 * A stylised hand built from capsules with round caps — the same construction
 * as the Tasharuky logo. Local origin = the pinch point; the arm extends towards −x.
 * Draw order creates the separation lines between fingers.
 */
const L = ({ d, w, c, deep }) => (
  <>
    <path d={d} stroke={deep} strokeWidth={Number(w) + 7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
)

export default function Hand({ skin = '#1b2234', deep = '#0f1422', hi = '#2d3752', cuff, cuffDeep }) {
  return (
    <g className="hand" transform="scale(.82)">
      {/* curled fingers, tucked under the palm */}
      <L d="M-160 112 C-140 120 -126 134 -128 152" w="38" c={hi} deep={deep} />
      <L d="M-198 118 C-178 126 -164 140 -166 158" w="36" c={skin} deep={deep} />
      <L d="M-234 122 C-216 130 -204 142 -206 158" w="32" c={hi} deep={deep} />
      {/* forearm */}
      <L d="M-1200 52 H-340" w="116" c={skin} deep={deep} />
      {/* sleeve */}
      <path d="M-1200 52 H-470" stroke={cuffDeep} strokeWidth="150" fill="none" />
      <path d="M-1200 52 H-478" stroke={cuff} strokeWidth="138" fill="none" />
      <path d="M-470 -23 V127" stroke="#fff" strokeOpacity=".5" strokeWidth="7" />
      {/* palm */}
      <L d="M-340 50 L-200 44" w="138" c={skin} deep={deep} />
      {/* index + thumb pinching */}
      <L d="M-206 -4 C-140 -20 -70 -12 -6 14" w="40" c={hi} deep={deep} />
      <L d="M-206 76 C-140 90 -62 72 -8 40" w="42" c={skin} deep={deep} />
      <path d="M-150 -14 C-110 -22 -70 -16 -34 -2" stroke="#fff" strokeOpacity=".16" strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  )
}
