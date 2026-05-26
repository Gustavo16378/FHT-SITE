import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './context/AuthContext'

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

import Login from './pages/Login'
import ClubeDashboard from './pages/ClubeDashboard'
import AdminDashboard from './pages/AdminDashboard'

function SitePrincipal() {
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
      {/*
        GPU fix permanente para Chrome Android / Mali-G52:
        backdrop-filter em elemento fixo full-screen força o Chrome a renderizar
        o conteúdo da página num render surface separado (caminho sem o bug de tiles).
        opacity: 0.02 = 2% — completamente imperceptível visualmente.
        blur(1px) — kernel mínimo, overhead de GPU negligenciável.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          backdropFilter: 'blur(0.5px)',
          WebkitBackdropFilter: 'blur(0.5px)',
          backgroundColor: 'rgba(0,0,0,0.012)',
          willChange: 'opacity',
        }}
      />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SitePrincipal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clube" element={
            <ProtectedRoute role="ADMIN_CLUBE">
              <ClubeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN_FHT">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
