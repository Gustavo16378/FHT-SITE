import { IconInstagram, IconFacebook, IconYoutube } from './SocialIcons'

const quickLinks = [
  { label: 'Competições', href: '#competicoes' },
  { label: 'Cadastro', href: '#cadastro' },
  { label: 'Notícias', href: '#noticias' },
  { label: 'Sobre a FHT', href: '#sobre' },
  { label: 'Clubes', href: '#clubes' },
  { label: 'Árbitros', href: '#arbitros' },
  { label: 'Documentos', href: '#documentos' },
  { label: 'Contato', href: '#contato' },
]

const institutionalLinks = [
  { label: 'CBHb — Confederação Brasileira de Handebol', href: 'https://cbhb.org.br', external: true },
  { label: 'COB — Comitê Olímpico do Brasil', href: 'https://cob.org.br', external: true },
  { label: 'Governo do Tocantins', href: 'https://to.gov.br', external: true },
]

export default function Footer() {
  return (
    <footer className="bg-night border-t border-federation/20 relative">
      {/* Linha amarela no topo */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-federation rounded-lg flex items-center justify-center border-2 border-gold/30">
                <span className="font-display text-gold text-2xl leading-none">FHT</span>
              </div>
              <div>
                <p className="font-display text-fht-white text-base leading-none">FEDERAÇÃO DE HANDEBOL</p>
                <p className="font-body text-gray-soft text-xs tracking-widest uppercase">DO TOCANTINS</p>
              </div>
            </div>
            <p className="font-body text-gray-soft text-xs leading-relaxed">
              Entidade oficial que regula e desenvolve o handebol no estado do Tocantins. Filiada à CBHb.
            </p>
            <div className="flex gap-2 mt-4">
              {[
                { icon: IconInstagram, href: '#', label: 'Instagram' },
                { icon: IconFacebook, href: '#', label: 'Facebook' },
                { icon: IconYoutube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 bg-federation/20 rounded-lg flex items-center justify-center text-gray-soft hover:text-gold hover:bg-federation/40 transition-colors duration-250"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-display text-fht-white text-xl mb-4">LINKS RÁPIDOS</h4>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-body text-gray-soft text-sm hover:text-gold transition-colors duration-250"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links institucionais */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h4 className="font-display text-fht-white text-xl mb-4">LINKS INSTITUCIONAIS</h4>
            <ul className="flex flex-col gap-2">
              {institutionalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="font-body text-gray-soft text-sm hover:text-gold transition-colors duration-250"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-federation/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-gray-soft text-xs">
            FHT — Federação de Handebol do Tocantins © 2025 · Palmas, TO
          </p>
          <p className="font-body text-gray-soft text-xs">
            Dados protegidos pela{' '}
            <span className="text-fht-white">LGPD</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
