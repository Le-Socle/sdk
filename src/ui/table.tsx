"use client"

import * as React from "react"

import { cn } from "../lib/cn"
import { useMessages } from "./messages"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  const container = React.useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = React.useState(false)
  const messages = useMessages()
  const [label, setLabel] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    const element = container.current
    if (!element) return
    const update = () => {
      setScrollable(element.scrollWidth > element.clientWidth)
      setLabel(element.querySelector("caption")?.textContent?.trim() || undefined)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={container}
      data-slot="table-container"
      {...(scrollable ? { tabIndex: 0, role: "region", "aria-label": label ?? messages.scrollableTable } : {})}
      className={cn("relative w-full overflow-x-auto rounded-md", scrollable && "focus-ring")}
    >
      <table
        data-slot="table"
        className={cn("type-body-sm w-full caption-bottom text-foreground", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b [&_tr]:border-border", className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t border-border bg-muted [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border-subtle transition-colors duration-micro hover:bg-muted data-[state=selected]:bg-accent",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "type-label h-11 px-4 text-left align-middle whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("type-body-sm mt-4 text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
