import { useEffect, useState } from 'react'
import { fileUrl } from '../services/api'

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  /** Classe(s) do gradiente exibido quando não há imagem OU a imagem falha ao carregar. */
  fallbackClassName?: string
}

/**
 * <img> resiliente: se a URL estiver vazia, quebrada, com hotlink bloqueado ou o
 * arquivo local tiver sumido, cai num gradiente em vez de mostrar o ícone de imagem
 * quebrada do browser. Aplica fileUrl() internamente.
 */
export default function SafeImage({ src, alt, className, fallbackClassName }: SafeImageProps) {
  const [falhou, setFalhou] = useState(false)

  // Reseta o estado de erro quando a fonte muda (ex.: lista reordenada/atualizada).
  useEffect(() => setFalhou(false), [src])

  if (!src || falhou) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className ?? ''} ${fallbackClassName ?? 'bg-gradient-to-br from-federation to-night'}`}
      />
    )
  }

  return (
    <img
      src={fileUrl(src)}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFalhou(true)}
    />
  )
}
