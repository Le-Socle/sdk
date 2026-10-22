"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "../lib/cn"

const toggleVariants = cva(
  "focus-ring press type-label relative rounded-md inline-flex shrink-0 items-center justify-center gap-2 border border-transparent text-foreground whitespace-nowrap select-none transition-[background-color,color,border-color,transform] duration-micro disabled:pointer-events-none disabled:opacity-50 data-[state=off]:hover:bg-muted data-[state=off]:hover:text-heading data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-input bg-transparent data-[state=off]:hover:border-muted-foreground",
      },
      size: {
        sm: "h-control-sm min-w-(--control-sm) px-2",
        default: "h-control-md min-w-(--control-md) px-3",
        lg: "h-control-lg min-w-(--control-lg) px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      data-variant={variant}
      data-size={size}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
