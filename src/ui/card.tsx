import * as React from "react"

import { cn } from "../lib/cn"

function Card({
  className,
  framed = true,
  ...props
}: React.ComponentProps<"div"> & { framed?: boolean }) {
  return (
    <div
      data-slot="card"
      data-framed={framed}
      className={cn(
        "flex min-w-0 flex-col gap-4 text-card-foreground",
        framed && "rounded-lg border border-border bg-card p-6",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-1", className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("type-heading text-heading", className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("type-body-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("type-body-sm", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center gap-4", className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
