import { AnimatePresence, motion } from 'motion/react'
import './Roll.css'

/*
 * A number whose digits roll into place: each digit is its own wheel, and a digit that
 * changes rises in gently while the old one fades out — no blur to speak of, and no
 * overshoot, so a figure settles rather than bounces. Places are counted from the
 * right, so a new leading digit does not shift the keys of the ones already there.
 */
export default function Roll({ text, up = true }) {
  const chars = text.split('')
  return (
    <span className="roll" aria-hidden="true" dir="ltr">
      {chars.map((c, i) => {
        const place = chars.length - 1 - i
        if (!/[0-9]/.test(c)) {
          return (
            <span key={`s${place}`} className="roll__sym">
              {c}
            </span>
          )
        }
        return (
          <span key={`p${place}`} className="roll__wheel">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={c}
                className="roll__digit"
                initial={{ y: up ? '0.16em' : '-0.16em', opacity: 0, filter: 'blur(1px)' }}
                animate={{ y: '0em', opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: up ? '-0.12em' : '0.12em', opacity: 0, filter: 'blur(1px)', transition: { duration: 0.22, ease: 'easeOut' } }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {c}
              </motion.span>
            </AnimatePresence>
          </span>
        )
      })}
    </span>
  )
}
