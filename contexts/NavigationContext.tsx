'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface NavigationContextType {
  isNavVisible: boolean
  navHeight: string
}

const NavigationContext = createContext<NavigationContextType>({
  isNavVisible: true,
  navHeight: 'var(--nav-height)',
})

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavVisible, setIsNavVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false)
      } else {
        setIsNavVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <NavigationContext.Provider value={{ isNavVisible, navHeight: 'var(--nav-height)' }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  return useContext(NavigationContext)
}
