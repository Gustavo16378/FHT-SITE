import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, LogIn } from 'lucide-react'
import { useScrollDirection } from '../hooks/useScrollDirection'
import logo from '../assets/logo.png'

const navLinks = [
  { label: 'Competições', href: '#competicoes' },
  { label: 'Notícias', href: '#noticias' },
  { label: 'Sobre a FHT', href: '#sobre' },
  { label: 'Clubes', href: '#clubes' },
  { label: 'Árbitros', href: '#arbitros' },
  { label: 'Transparência', href: '#documentos' },
  { label: 'Contato', href: '#contato' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollYRef = useRef(0)
  const navHidden = useScrollDirection()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll lock compatível com iOS Safari
  useEffect(() => {
    if (menuOpen) {
      scrollYRef.current = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollYRef.current}px`
      document.body.style.width = '100%'
      document.body.style.overflowY = 'scroll'
    } else {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflowY = ''
      window.scrollTo(0, scrollYRef.current)
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflowY = ''
    }
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  // Portal sempre no DOM — overlay e painel controlados por opacity/transform
  const mobilePortal = createPortal(
    <>
      {/* Overlay escuro sem blur */}
      <div
        onClick={closeMenu}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.72)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Painel lateral — desliza da direita via translateX */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '18rem',
          maxWidth: '85vw',
          background: '#070D1E',
          borderLeft: '1px solid rgba(26,58,143,0.4)',
          zIndex: 9999,
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '5rem',
          paddingBottom: '2rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          overflowY: 'auto',
        }}
      >
        {/* Botão fechar */}
        <button
          onClick={closeMenu}
          aria-label="Fechar menu"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            color: '#F8F9FC',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={24} />
        </button>

        {/* Links de navegação */}
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1, listStyle: 'none', padding: 0, margin: 0 }}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={closeMenu}
                style={{
                  display: 'block',
                  padding: '0.75rem 0',
                  color: '#F8F9FC',
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(26,58,143,0.25)',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F5C518')}
                onMouseLeave={e => (e.currentTarget.style.color = '#F8F9FC')}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
          <a
            href="/login"
            onClick={closeMenu}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.65rem',
              background: 'transparent',
              color: '#A0A8C0',
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.95rem',
              border: '1px solid rgba(26,58,143,0.35)',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'color 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F8F9FC'; e.currentTarget.style.borderColor = 'rgba(245,197,24,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#A0A8C0'; e.currentTarget.style.borderColor = 'rgba(26,58,143,0.35)' }}
          >
            Entrar
          </a>
          <a
            href="#cadastro"
            onClick={closeMenu}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.75rem',
              background: '#F5C518',
              color: '#070D1E',
              fontFamily: '"Bebas Neue", cursive',
              fontSize: '1rem',
              letterSpacing: '0.1em',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FFD94A')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F5C518')}
          >
            CADASTRAR EQUIPE
          </a>
        </div>
      </div>
    </>,
    document.body
  )

  return (
    <>
      <nav
        className="fixed left-0 right-0 z-50"
        style={{
          top: navHidden && !menuOpen ? '-80px' : '0',
          backgroundColor: scrolled ? 'rgba(7,13,30,0.95)' : 'transparent',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
          transition: 'top 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <a href="#hero" className="flex items-center gap-2">
              <img src={logo} alt="Logo FHT" className="w-20 h-20 object-contain" />
              <div className="hidden sm:block">
                <p className="font-display text-fht-white text-lg leading-none tracking-wide">FEDERAÇÃO DE HANDEBOL</p>
                <p className="font-body text-gray-soft text-xs tracking-widest uppercase">DO TOCANTINS</p>
              </div>
            </a>

            {/* Links desktop */}
            <ul className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-body text-gray-soft hover:text-fht-white text-sm font-medium tracking-wide transition-colors duration-250 relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-full h-px bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
                  </a>
                </li>
              ))}
            </ul>

            {/* CTA + hambúrguer */}
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="hidden md:flex items-center gap-1.5 font-body text-gray-soft hover:text-fht-white border border-federation/30 hover:border-gold/40 px-3 py-2 rounded-lg text-sm transition-colors duration-250"
              >
                <LogIn size={15} /> Entrar
              </a>
              <a
                href="#cadastro"
                className="hidden md:block font-display text-night bg-gold hover:bg-gold-light px-5 py-2 rounded-lg text-sm tracking-wider transition-colors duration-250"
              >
                CADASTRAR EQUIPE
              </a>

              <button
                className="lg:hidden text-fht-white p-2"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobilePortal}
    </>
  )
}
