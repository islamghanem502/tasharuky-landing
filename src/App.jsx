import { useEffect } from 'react'
import { initSmooth } from './lib/smooth'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import Unity from './sections/Unity'

export default function App() {
  useEffect(() => initSmooth(), [])
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Unity />
      </main>
    </>
  )
}
