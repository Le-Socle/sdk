"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { ChevronRightIcon, EllipsisIcon } from "lucide-react"

import { cn } from "../lib/cn"
import { useMessages } from "./messages"

/** Fil d'Ariane : où l'on est dans l'arborescence. Le dernier niveau est la page courante. */
function Breadcrumb({ label, ...props }: React.ComponentProps<"nav"> & { label?: string }) {
  const messages = useMessages()
  return <nav data-slot="breadcrumb" aria-label={label ?? messages.breadcrumb} {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn("type-body-sm flex flex-wrap items-center gap-1.5 text-muted-foreground wrap-anywhere", className)}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1.5", className)} {...props} />
}

function BreadcrumbLink({ asChild, className, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("focus-ring rounded-mark text-muted-foreground underline-offset-4 transition-colors duration-micro hover:text-heading hover:underline", className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="breadcrumb-page" aria-current="page" className={cn("type-label text-heading", className)} {...props} />
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
      {children ?? <ChevronRightIcon />}
    </li>
  )
}

function BreadcrumbEllipsis({ className, label, ...props }: React.ComponentProps<"span"> & { label?: string }) {
  const messages = useMessages()
  return (
    <span data-slot="breadcrumb-ellipsis" className={cn("flex size-6 items-center justify-center", className)} {...props}>
      <EllipsisIcon aria-hidden="true" className="size-4" />
      <span className="sr-only">{label ?? messages.morePath}</span>
    </span>
  )
}

export { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator }
