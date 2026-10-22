import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "lucide-react"

import { cn } from "../lib/cn"
import { buttonVariants, type Button } from "./button"
import { useMessages } from "./messages"

/** Pagination : passer d'une page de résultats à l'autre. Les liens sont de vrais liens. */
function Pagination({ className, label, ...props }: React.ComponentProps<"nav"> & { label?: string }) {
  const messages = useMessages()
  return <nav data-slot="pagination" aria-label={label ?? messages.pagination} className={cn("mx-auto flex w-full justify-center", className)} {...props} />
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-row items-center gap-1", className)} {...props} />
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = { isActive?: boolean } & Pick<React.ComponentProps<typeof Button>, "size"> & React.ComponentProps<"a">

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <a
      data-slot="pagination-link"
      aria-current={isActive ? "page" : undefined}
      data-active={isActive}
      className={cn(
        buttonVariants({ variant: isActive ? "neutral" : "ghost", size }),
        "tabular-nums",
        isActive && "border-primary bg-accent text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, label, ...props }: React.ComponentProps<typeof PaginationLink> & { label?: string }) {
  const messages = useMessages()
  return (
    <PaginationLink aria-label={label ?? messages.previous} size="md" className={cn("gap-1 px-2.5", className)} {...props}>
      <ChevronLeftIcon aria-hidden="true" />
      <span className="hidden sm:block">{label ?? messages.previous}</span>
    </PaginationLink>
  )
}

function PaginationNext({ className, label, ...props }: React.ComponentProps<typeof PaginationLink> & { label?: string }) {
  const messages = useMessages()
  return (
    <PaginationLink aria-label={label ?? messages.next} size="md" className={cn("gap-1 px-2.5", className)} {...props}>
      <span className="hidden sm:block">{label ?? messages.next}</span>
      <ChevronRightIcon aria-hidden="true" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, label, ...props }: React.ComponentProps<"span"> & { label?: string }) {
  const messages = useMessages()
  return (
    <span data-slot="pagination-ellipsis" className={cn("flex size-(--control-md) items-center justify-center", className)} {...props}>
      <EllipsisIcon aria-hidden="true" className="size-4" />
      <span className="sr-only">{label ?? messages.morePages}</span>
    </span>
  )
}

export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious }
