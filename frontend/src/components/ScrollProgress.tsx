import { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        zIndex: 9990,
        background: 'rgba(245,197,24,0.15)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          background: '#F5C518',
          transform: `scaleX(${progress / 100})`,
          transformOrigin: 'left',
          transition: 'transform 80ms linear',
        }}
      />
    </div>
  )
}
