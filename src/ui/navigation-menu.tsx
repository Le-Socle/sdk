"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "../lib/cn"

/**
 * Menu de navigation : la barre de liens d'un site ou d'une application, avec des panneaux
 * déroulants. Sur Radix Navigation Menu : clavier (flèches, Échap), focus et annonces sont les siens.
 */
function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean }) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className)}
      {...props}
    >
      {children}
      {viewport ? <NavigationMenuViewport /> : null}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props}
    />
  )
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />
}

const navigationMenuTriggerStyle = cva(
  "focus-ring type-label group inline-flex h-control-md w-max items-center justify-center gap-1 bg-transparent px-3 text-foreground transition-[background-color,color] duration-micro hover:bg-muted hover:text-heading disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[state=open]:bg-muted data-[state=open]:text-heading rounded-md"
)

function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" className={cn(navigationMenuTriggerStyle(), className)} {...props}>
      {children}
      <ChevronDownIcon aria-hidden="true" className="size-3.5 transition-transform duration-fast group-data-[state=open]:rotate-180" />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-2 md:absolute md:w-auto group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:border-border group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow-2",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-0 isolate z-layer-menu flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-2 md:w-(--radix-navigation-menu-viewport-width)",
          className
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "focus-ring-inset type-body-sm flex flex-col gap-1 rounded-md p-2 text-popover-foreground transition-colors duration-micro hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, navigationMenuTriggerStyle }
