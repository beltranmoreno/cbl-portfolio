import { ReactNode } from 'react'

interface MasonryGridProps {
  children: ReactNode
  className?: string
}

/**
 * CSS-columns masonry. Renders identically on the server and the client (no
 * JS) so the page paints with the correct column count from the first frame
 * — no flash from N → M columns on hydration.
 *
 * Breakpoints match the prior JS-based config:
 *   <1280 → 2 cols   1280–1535 → 3 cols   ≥1536 → 4 cols
 *
 * Children need `break-inside-avoid` so they're not split across columns
 * (applied via Tailwind's arbitrary descendant selector). Children also get
 * a small horizontal padding so images don't sit edge-to-edge with the
 * column clip box — that 1-2px buffer is what stops Safari from showing a
 * sub-pixel column-clip artifact on rounded edges or on hover.
 */
export default function MasonryGrid({ children, className = '' }: MasonryGridProps) {
  return (
    <div
      className={`columns-2 xl:columns-3 2xl:columns-4 gap-4 md:gap-6 [&>*]:break-inside-avoid [&>*]:px-px ${className}`}
    >
      {children}
    </div>
  )
}
