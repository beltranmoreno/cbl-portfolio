'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

export default function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement
      const href = target.href
      const currentUrl = window.location.href

      if (href !== currentUrl) {
        NProgress.start()
      }
    }

    const handleRouteChange = () => {
      NProgress.done()
    }

    // Add click listeners to all links
    document.querySelectorAll('a[href^="/"]').forEach((anchor) => {
      anchor.addEventListener('click', handleAnchorClick as EventListener)
    })

    return () => {
      document.querySelectorAll('a[href^="/"]').forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick as EventListener)
      })
    }
  }, [pathname])

  return null
}
