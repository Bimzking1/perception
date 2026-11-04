import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navigation } from './Navigation'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <ScrollToTop />
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
