import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-night backdrop-blur-md shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-federation rounded-lg flex items-center justify-center border-2 border-gold/30 group-hover:border-gold transition-colors duration-250">
              <span className="font-display text-gold text-xl leading-none">FHT</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-fht-white text-lg leading-none tracking-wide">FEDERAÇÃO DE HANDEBOL</p>
              <p className="font-body text-gray-soft text-xs tracking-widest uppercase">DO TOCANTINS</p>
            </div>
          </a>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-body text-gray-soft hover:text-fht-white text-sm font-medium tracking-wide transition-colors duration-250 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-250" />
                </a>
              </li>
            ))}
          </ul>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="#cadastro"
              className="hidden md:block font-display text-night bg-gold hover:bg-gold-light px-5 py-2 rounded-lg text-sm tracking-wider transition-colors duration-250"
            >
              CADASTRAR EQUIPE
            </a>
            <button
              className="lg:hidden text-fht-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-night border-l border-federation/30 transform transition-transform duration-300 z-50 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 pb-8 px-6">
          <button
            className="absolute top-4 right-4 text-fht-white"
            onClick={() => setMenuOpen(false)}
          >
            <X size={24} />
          </button>
          <ul className="flex flex-col gap-4 flex-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-body text-fht-white text-lg font-medium hover:text-gold transition-colors duration-250 block py-1 border-b border-federation/20"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#cadastro"
            onClick={() => setMenuOpen(false)}
            className="font-display text-night bg-gold hover:bg-gold-light text-center py-3 rounded-lg tracking-wider transition-colors duration-250"
          >
            CADASTRAR EQUIPE
          </a>
        </div>
      </div>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  )
}
