import { useCallback, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './providers/ThemeProvider'
import { SplashScreen } from '../components/layout/SplashScreen'
import { router } from './router'
import { STORAGE_KEYS, safeSessionGet, safeSessionSet } from '../lib/storage'

export function App() {
  const [showSplash, setShowSplash] = useState(
    () => safeSessionGet(STORAGE_KEYS.splash) !== '1',
  )

  const finishSplash = useCallback(() => {
    safeSessionSet(STORAGE_KEYS.splash, '1')
    setShowSplash(false)
  }, [])

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      {showSplash ? <SplashScreen onDone={finishSplash} /> : null}
    </ThemeProvider>
  )
}
