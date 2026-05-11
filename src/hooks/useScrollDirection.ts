import { useEffect, useRef, useState } from 'react'

export function useScrollDirection(threshold = 8) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      const diff = current - lastScrollY.current

      if (Math.abs(diff) < threshold) return

      setHidden(current > 80 && diff > 0)
      lastScrollY.current = current
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return hidden
}
