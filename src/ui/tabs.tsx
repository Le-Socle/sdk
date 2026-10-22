"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "../lib/cn"

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  variant = "line",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: "line" | "pill" }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "group/tabs-list flex w-full items-stretch",
        variant === "line" ? "flex-wrap gap-x-8 border-b border-border" : "items-center gap-1 overflow-x-auto",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "focus-ring type-label -mb-px inline-flex min-h-11 items-center gap-2 border-b-2 border-transparent px-1 text-muted-foreground whitespace-nowrap transition-colors duration-micro hover:text-heading disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary data-[state=active]:text-heading [&_svg]:size-4 [&_svg]:shrink-0",
        "group-data-[variant=pill]/tabs-list:mb-0 group-data-[variant=pill]/tabs-list:min-h-0 group-data-[variant=pill]/tabs-list:h-control-sm group-data-[variant=pill]/tabs-list:shrink-0 group-data-[variant=pill]/tabs-list:rounded-md group-data-[variant=pill]/tabs-list:border-0 group-data-[variant=pill]/tabs-list:px-3 group-data-[variant=pill]/tabs-list:hover:bg-muted group-data-[variant=pill]/tabs-list:data-[state=active]:bg-primary group-data-[variant=pill]/tabs-list:data-[state=active]:text-primary-foreground group-data-[variant=pill]/tabs-list:data-[state=active]:hover:bg-primary-hover",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("focus-ring type-body flex-1 text-foreground", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
