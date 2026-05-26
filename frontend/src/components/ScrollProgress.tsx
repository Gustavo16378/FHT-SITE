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
        right: 0,
        top: 0,
        width: '3px',
        height: '100vh',
        zIndex: 9990,
        background: 'rgba(245,197,24,0.12)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: `${progress}%`,
          background: '#F5C518',
          boxShadow: '0 0 10px rgba(245,197,24,0.6)',
          transition: 'height 80ms linear',
        }}
      />
    </div>
  )
}
