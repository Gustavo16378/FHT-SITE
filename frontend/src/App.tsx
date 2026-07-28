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
import Noticias from './pages/Noticias'
import NoticiaPost from './pages/NoticiaPost'

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
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SitePrincipal />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:slug" element={<NoticiaPost />} />
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
