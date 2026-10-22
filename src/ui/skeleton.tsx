import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/cn"
import { useMessages } from "./messages"

const skeletonVariants = cva("animate-skeleton bg-border", {
  variants: {
    shape: {
      default: "rounded-mark",
      round: "rounded-dot",
      square: "rounded-none",
    },
  },
  defaultVariants: { shape: "default" },
})

function Skeleton({
  className,
  shape,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof skeletonVariants>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(skeletonVariants({ shape }), className)}
      {...props}
    />
  )
}

function SkeletonGroup({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { label?: string }) {
  const messages = useMessages()
  return (
    <div data-slot="skeleton-group" role="status" className={className} {...props}>
      <span className="sr-only">{label ?? messages.loading}</span>
      {children}
    </div>
  )
}

export { Skeleton, SkeletonGroup, skeletonVariants }
