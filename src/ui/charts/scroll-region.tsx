"use client"

import * as React from "react"

import { cn } from "../../lib/cn"
import { useMessages } from "../messages"

/**
 * Zone qui défile en largeur quand son contenu ne tient pas (un tableau large sur un écran étroit).
 * Tant qu'elle défile, elle prend un arrêt de tabulation, un rôle de région et un nom : sans cela
 * le clavier ne peut pas la lire (WCAG 2.1.1). Quand tout tient, elle n'ajoute rien.
 */
function ScrollRegion({ label, className, children, ...props }: React.ComponentProps<"div"> & { label: string }) {
  const messages = useMessages()
  const ref = React.useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScrollable(el.scrollWidth > el.clientWidth + 1)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      {...(scrollable ? { tabIndex: 0, role: "region", "aria-label": label || messages.scrollableTable } : {})}
      className={cn("relative w-full min-w-0 overflow-x-auto", scrollable && "focus-ring", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { ScrollRegion }
