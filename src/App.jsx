import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import Give from './sections/Give'
import Campaigns from './sections/Campaigns'
import About from './sections/About'
import Notice from './sections/Notice'
import Impact from './sections/Impact'
import Footer from './components/Footer'

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Give />
        <Campaigns />
        <About />
        <Notice />
        <Impact />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
