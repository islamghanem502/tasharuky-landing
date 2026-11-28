import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import Give from './sections/Give'
import Campaigns from './sections/Campaigns'

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Give />
        <Campaigns />
      </main>
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
