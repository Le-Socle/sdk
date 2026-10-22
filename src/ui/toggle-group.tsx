"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "../lib/cn"
import { toggleVariants } from "./toggle"

type Spacing = 0 | 1 | 2

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants> & { spacing: Spacing }>({
  size: "default",
  variant: "default",
  spacing: 2,
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
        spacing?: Spacing
  }) {
  const context = React.useMemo(() => ({ variant, size, spacing }), [variant, size, spacing])
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      orientation={orientation}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        spacing === 0 && "gap-0",
        spacing === 1 && "gap-1",
        spacing === 2 && "gap-2",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={context}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)
  const variante = context.variant ?? variant
  const taille = context.size ?? size
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={variante}
      data-size={taille}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({ variant: variante, size: taille }),
        "focus-visible:z-10 data-[state=on]:z-10",
        "group-data-[spacing=0]/toggle-group:group-data-[orientation=horizontal]/toggle-group:not-first:-ml-px",
        "group-data-[spacing=0]/toggle-group:group-data-[orientation=vertical]/toggle-group:not-first:-mt-px",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
