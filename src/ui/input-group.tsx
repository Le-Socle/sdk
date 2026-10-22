"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/cn"
import { Button } from "./button"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group focus-ring-within rounded-md type-body-sm relative flex h-control-md w-full min-w-0 items-center border border-input bg-card text-foreground transition-[border-color] duration-micro hover:not-has-[[aria-invalid=true]]:border-muted-foreground has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed has-[[data-slot=input-group-control]:disabled]:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 has-[>[data-align^=block]]:h-auto has-[>[data-align^=block]]:flex-col has-[>textarea]:h-auto",
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "type-body-sm flex cursor-text items-center justify-center gap-2 text-muted-foreground select-none [&>kbd]:rounded-mark [&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 has-[>button]:-ml-2",
        "inline-end": "order-last pr-3 has-[>button]:-mr-2",
        "block-start": "order-first w-full justify-start px-3 pt-2",
        "block-end": "order-last w-full justify-start px-3 pb-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  onClick,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || (event.target as HTMLElement).closest("button")) return
        event.currentTarget.parentElement?.querySelector<HTMLElement>("[data-slot=input-group-control]")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva("", {
  variants: {
    size: {
      sm: "h-[calc(var(--control-md)-var(--space-1))] px-2",
      "icon-sm": "size-[calc(var(--control-md)-var(--space-1))] p-0",
    },
  },
  defaultVariants: {
    size: "sm",
  },
})

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "sm",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> & VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      variant={variant}
      size="app-sm"
      data-size={size}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        "type-body-sm flex items-center gap-2 text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        "type-body-sm h-full w-full min-w-0 flex-1 bg-transparent px-3 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed group-has-[>[data-align=inline-start]]/input-group:pl-2 group-has-[>[data-align=inline-end]]/input-group:pr-2 group-has-[>[data-align^=block]]/input-group:h-control-md",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        "type-body-sm min-h-16 w-full min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  inputGroupAddonVariants,
  inputGroupButtonVariants,
}
