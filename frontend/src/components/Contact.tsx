import { useState } from 'react'
import { MessageCircle, Mail, Send, MapPin } from 'lucide-react'
import { IconInstagram, IconFacebook, IconYoutube } from './SocialIcons'
import { useInView } from '../hooks/useInView'

const subjects = ['Atleta', 'Clube', 'Arbitragem', 'Imprensa', 'Outros']

export default function Contact() {
  const ref = useInView()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contato" className="py-20 bg-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref as React.RefObject<HTMLDivElement>} className="animate-ready mb-12">
          <p className="font-body text-gold text-sm font-semibold tracking-widest uppercase mb-2">Canal oficial</p>
          <h2 className="font-display text-fht-white text-5xl sm:text-6xl leading-none mb-4">FALE COM A FHT</h2>
          <div className="w-16 h-1 bg-gold" />
        </div>

        {/* 3 CTAs rápidos */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <a
            href="https://wa.me/556300000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 rounded-lg p-5 hover:border-green-500/60 hover:bg-green-500/20 transition-all duration-250 group"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle size={22} className="text-green-400" />
            </div>
            <div>
              <p className="font-display text-fht-white text-xl leading-none">SOU ATLETA OU CLUBE</p>
              <p className="font-body text-gray-soft text-xs mt-1">WhatsApp da FHT</p>
            </div>
          </a>
          <a
            href="mailto:imprensa@fht.org.br"
            className="flex items-center gap-4 bg-federation/10 border border-federation/30 rounded-lg p-5 hover:border-federation/60 hover:bg-federation/20 transition-all duration-250 group"
          >
            <div className="w-12 h-12 bg-federation/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail size={22} className="text-blue-300" />
            </div>
            <div>
              <p className="font-display text-fht-white text-xl leading-none">IMPRENSA</p>
              <p className="font-body text-gray-soft text-xs mt-1">imprensa@fht.org.br</p>
            </div>
          </a>
          <a
            href="#form-contato"
            className="flex items-center gap-4 bg-gold/10 border border-gold/30 rounded-lg p-5 hover:border-gold/60 hover:bg-gold/20 transition-all duration-250 group"
          >
            <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Send size={22} className="text-gold" />
            </div>
            <div>
              <p className="font-display text-fht-white text-xl leading-none">OUTROS ASSUNTOS</p>
              <p className="font-body text-gray-soft text-xs mt-1">Formulário abaixo</p>
            </div>
          </a>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Formulário */}
          <div id="form-contato">
            <h3 className="font-display text-fht-white text-3xl mb-6">ENVIE SUA MENSAGEM</h3>
            {sent ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 text-center">
                <p className="font-display text-green-400 text-2xl mb-2">MENSAGEM ENVIADA!</p>
                <p className="font-body text-gray-soft text-sm">Nossa equipe retornará em breve pelo e-mail ou telefone informado.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    required
                    type="text"
                    name="name"
                    placeholder="Seu nome"
                    value={form.name}
                    onChange={handleChange}
                    className="font-body bg-night/60 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250"
                  />
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="Seu e-mail"
                    value={form.email}
                    onChange={handleChange}
                    className="font-body bg-night/60 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telefone / WhatsApp"
                    value={form.phone}
                    onChange={handleChange}
                    className="font-body bg-night/60 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250"
                  />
                  <select
                    required
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="font-body bg-night/60 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white text-sm outline-none transition-colors duration-250 appearance-none"
                  >
                    <option value="" disabled>Assunto</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <textarea
                  required
                  name="message"
                  placeholder="Sua mensagem..."
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="font-body bg-night/60 border border-federation/20 focus:border-gold rounded-lg px-4 py-3 text-fht-white placeholder-gray-soft text-sm outline-none transition-colors duration-250 resize-none"
                />
                <button
                  type="submit"
                  className="font-display text-night bg-gold hover:bg-gold-light py-3.5 rounded-lg text-lg tracking-wider transition-colors duration-250 shadow-lg shadow-gold/20"
                >
                  ENVIAR MENSAGEM
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="font-display text-fht-white text-3xl mb-4">ONDE ESTAMOS</h3>
              <div className="flex items-start gap-3 text-gray-soft">
                <MapPin size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <div className="font-body text-sm leading-relaxed">
                  <p className="text-fht-white font-semibold">FHT — Federação de Handebol do Tocantins</p>
                  <p>Palmas, Tocantins — Brasil</p>
                  <p>CEP: 77000-000</p>
                  <p className="mt-2">contato@fht.org.br</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-fht-white text-3xl mb-4">REDES SOCIAIS</h3>
              <div className="flex gap-3">
                {[
                  { icon: IconInstagram, label: 'Instagram', href: '#' },
                  { icon: IconFacebook, label: 'Facebook', href: '#' },
                  { icon: IconYoutube, label: 'YouTube', href: '#' },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-12 h-12 bg-federation/20 border border-federation/30 rounded-lg flex items-center justify-center text-gray-soft hover:text-gold hover:border-gold/40 transition-all duration-250"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
