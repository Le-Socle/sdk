"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "../lib/cn"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "group/switch focus-ring peer relative inline-flex shrink-0 items-center rounded-dot transition-[background-color] duration-fast ease-out disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-6 data-[size=default]:w-10 data-[size=sm]:h-5 data-[size=sm]:w-8 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input enabled:data-[state=checked]:hover:bg-primary-hover enabled:data-[state=unchecked]:hover:bg-muted-foreground",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-dot transition-[transform,box-shadow] duration-fast ease-out motion-reduce:transition-none group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-[state=unchecked]:translate-x-1 group-data-[size=default]/switch:data-[state=checked]:translate-x-5 group-data-[size=sm]/switch:data-[state=unchecked]:translate-x-1 group-data-[size=sm]/switch:data-[state=checked]:translate-x-4 data-[state=unchecked]:bg-card data-[state=unchecked]:shadow-1 data-[state=checked]:bg-primary-foreground data-[state=checked]:shadow-none"
      />
    </SwitchPrimitive.Root>
  )
}

function SwitchValue({ on, off, className }: { on: string; off: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="switch-value"
      className={cn(
        "type-label grid text-muted-foreground peer-data-[state=checked]:[&>[data-value=off]]:opacity-0 peer-data-[state=checked]:[&>[data-value=on]]:opacity-100",
        className
      )}
    >
      <span data-value="off" className="col-start-1 row-start-1 transition-opacity duration-fast ease-out">
        {off}
      </span>
      <span data-value="on" className="col-start-1 row-start-1 opacity-0 transition-opacity duration-fast ease-out">
        {on}
      </span>
    </span>
  )
}

export { Switch, SwitchValue }
