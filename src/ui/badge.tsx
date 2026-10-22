import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/cn"

const badgeVariants = cva(
  "inline-flex w-fit max-w-full min-w-0 shrink-0 items-center gap-1 overflow-hidden border whitespace-nowrap rounded-detail tabular-nums [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "border-border bg-badge-bg text-badge-fg",
        info: "border-badge-info-border bg-badge-info-bg text-badge-info-fg",
        success: "border-badge-success-border bg-badge-success-bg text-badge-success-fg",
        warning: "border-badge-warning-border bg-badge-warning-bg text-badge-warning-fg",
        danger: "border-badge-danger-border bg-badge-danger-bg text-badge-danger-fg",
      },
      size: {
        default: "type-label h-6 px-2 [&>svg]:size-3.5",
        dense: "type-label-sm h-5 px-2 [&>svg]:size-3",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
)

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

function enSegments(children: React.ReactNode) {
  const segments: React.ReactNode[] = []
  let texte: (string | number)[] = []
  const clore = () => {
    if (texte.length === 0) return
    segments.push(
      <span key={`texte-${segments.length}`} className="min-w-0 truncate">
        {texte}
      </span>
    )
    texte = []
  }
  for (const child of React.Children.toArray(children)) {
    if (typeof child === "string" || typeof child === "number") texte.push(child)
    else {
      clore()
      segments.push(child)
    }
  }
  clore()
  return segments
}

function Badge({
  className,
  variant = "neutral",
  size = "default",
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {enSegments(children)}
    </span>
  )
}

export { Badge, badgeVariants }
