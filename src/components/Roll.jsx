import { AnimatePresence, motion } from 'motion/react'
import './Roll.css'

/*
 * A number whose digits roll into place: each digit is its own wheel, and a digit that
 * changes drops in, soft, while the old one fades out. Places are counted from the
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
                initial={{ y: up ? '0.32em' : '-0.32em', opacity: 0, filter: 'blur(3px)' }}
                animate={{ y: '0em', opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: up ? '-0.24em' : '0.24em', opacity: 0, filter: 'blur(3px)', transition: { duration: 0.14 } }}
                transition={{ duration: 0.42, ease: [0.34, 1.45, 0.64, 1], delay: i * 0.03 }}
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
