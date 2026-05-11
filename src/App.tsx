import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Competitions from './components/Competitions'
import Registration from './components/Registration'
import News from './components/News'
import About from './components/About'
import Clubs from './components/Clubs'
import Referees from './components/Referees'
import Gallery from './components/Gallery'
import Documents from './components/Documents'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CookieBanner from './components/CookieBanner'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Competitions />
        <Registration />
        <News />
        <About />
        <Clubs />
        <Referees />
        <Gallery />
        <Documents />
        <Contact />
      </main>
      <Footer />
      <CookieBanner />
    </>
  )
}
