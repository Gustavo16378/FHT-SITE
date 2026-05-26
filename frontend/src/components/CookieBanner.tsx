import { useState } from 'react'
import { Cookie } from 'lucide-react'

export default function CookieBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('fht_cookies') === 'accepted' } catch { return false }
  })

  function accept() {
    try { localStorage.setItem('fht_cookies', 'accepted') } catch {}
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-night border border-federation/40 rounded-lg p-4 shadow-2xl z-50 flex items-start gap-3">
      <Cookie size={20} className="text-gold flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-body text-fht-white text-sm font-semibold mb-1">Usamos cookies</p>
        <p className="font-body text-gray-soft text-xs leading-relaxed">
          Este site utiliza cookies para melhorar sua experiência. Seus dados são protegidos pela LGPD.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={accept}
            className="font-display text-night bg-gold hover:bg-gold-light px-4 py-1.5 rounded text-sm tracking-wider transition-colors duration-250"
          >
            ACEITAR
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="font-body text-gray-soft text-xs hover:text-fht-white transition-colors duration-250 px-2"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
