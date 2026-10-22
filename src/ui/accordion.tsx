"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "../lib/cn"

function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col border-t border-border", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group focus-ring type-heading flex flex-1 items-center justify-between gap-6 py-6 text-left text-heading transition-colors duration-micro hover:text-link disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
        <span
          data-slot="accordion-trigger-icon"
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-[background-color,border-color,color] duration-micro group-hover:border-primary group-hover:text-primary group-data-[state=open]:border-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground"
        >
          <ChevronDownIcon className="size-4 transition-transform duration-normal motion-reduce:transition-none group-data-[state=open]:rotate-180" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"
      {...props}
    >
      <div className={cn("type-body max-w-(--container-prose) pr-14 pb-6 text-foreground", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
