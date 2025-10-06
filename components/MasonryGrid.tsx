'use client'

import { ReactNode } from 'react'
import Masonry from 'react-masonry-css'

interface MasonryGridProps {
  children: ReactNode
  className?: string
}

const breakpointColumns = {
  default: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 1,
}

export default function MasonryGrid({ children, className = '' }: MasonryGridProps) {
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className={`flex -ml-4 md:-ml-6 w-auto ${className}`}
      columnClassName="pl-4 md:pl-6 bg-clip-padding"
    >
      {children}
    </Masonry>
  )
}
