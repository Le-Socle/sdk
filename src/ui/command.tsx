"use client"

import * as React from "react"
import { Command as CommandPrimitive, useCommandState } from "cmdk"
import { CheckIcon, SearchIcon } from "lucide-react"

import { cn } from "../lib/cn"
import { useMessages } from "./messages"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"

function Command({
  className,
  label,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  const messages = useMessages()
  return (
    <CommandPrimitive
      data-slot="command"
      label={label ?? messages.commandLabel}
      className={cn("flex size-full min-w-0 flex-col overflow-hidden bg-popover text-popover-foreground", className)}
      {...props}
    />
  )
}

function CommandDialog({
  title,
  description,
  children,
  className,
  showCloseButton = false,
  motion = "none",
  container,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  motion?: React.ComponentProps<typeof DialogContent>["motion"]
  container?: React.ComponentProps<typeof DialogContent>["container"]
}) {
  const messages = useMessages()
  return (
    <Dialog {...props}>
      <DialogContent
        data-command-dialog=""
        className={cn("top-1/5 bottom-auto max-h-[calc(80%-var(--space-4))] max-w-140 gap-0 overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
        motion={motion}
        container={container}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title ?? messages.commandTitle}</DialogTitle>
          <DialogDescription>{description ?? messages.commandDescription}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center gap-2 border-b border-border px-3 transition-[border-color] duration-micro focus-within:border-ring group-data-[has-close]/dialog:pr-12"
    >
      <SearchIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "type-body-sm h-control-md w-full min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 in-data-[command-dialog]:h-control-lg",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, label, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  const messages = useMessages()
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      label={label ?? messages.commandResults}
      className={cn("max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none", className)}
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  const vide = useCommandState((state) => state.filtered.count === 0)
  if (!vide) return null
  return (
    <div
      data-slot="command-empty"
      role="option"
      aria-disabled="true"
      aria-selected="false"
      className={cn("type-body-sm px-4 py-6 text-center text-muted-foreground", className)}
      {...props}
    />
  )
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:type-label-sm **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1 **:[[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  alwaysRender = false,
  ...props
}: React.ComponentProps<"div"> & { alwaysRender?: boolean }) {
  const recherche = useCommandState((state) => state.search)
  if (!alwaysRender && recherche) return null
  return (
    <div
      data-slot="command-separator"
      role="none"
      className={cn("h-(--border-width-thin) bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item> & {
    checked?: boolean
}) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      data-checked={checked}
      aria-checked={checked}
      className={cn(
        "group/command-item type-body-sm relative flex min-h-control-md cursor-default items-center gap-2 rounded-sm px-2 py-1 text-popover-foreground wrap-anywhere select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground data-[selected=true]:[&_svg]:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon
        aria-hidden="true"
        className="invisible ml-auto group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:visible"
      />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "type-caption ml-auto shrink-0 text-muted-foreground tabular-nums group-data-[selected=true]/command-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
