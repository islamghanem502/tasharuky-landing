import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export let lenis = null
const listeners = new Set()
export const onScroll = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }

export function initSmooth() {
  if (lenis) return () => {}
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 })
  lenis.on('scroll', (e) => { ScrollTrigger.update(); listeners.forEach((fn) => fn(e)) })
  const tick = (t) => { if (lenis) lenis.raf(t * 1000) }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => { gsap.ticker.remove(tick); if (lenis) lenis.destroy(); lenis = null }
}

export const scrollToTarget = (target) => {
  if (lenis) lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4), offset: -10 })
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
}
