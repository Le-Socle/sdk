"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { cn } from "../lib/cn"
import { useMessages } from "./messages"
import { useFocusReturn } from "../lib/use-focus-return"
import { useScrollable } from "../lib/use-scrollable"
import { Button } from "./button"

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

type DialogMotion = "default" | "none"

function DialogOverlay({
  className,
  motion = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> & { motion?: DialogMotion }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-layer-dialog bg-dialog-overlay",
        motion === "default" && "data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel,
  motion = "default",
  container,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  closeLabel?: string
  motion?: DialogMotion
  container?: React.ComponentProps<typeof DialogPrimitive.Portal>["container"]
}) {
  const retourDuFocus = useFocusReturn({ onOpenAutoFocus, onCloseAutoFocus })
  const messages = useMessages()
  return (
    <DialogPortal container={container}>
      <DialogOverlay motion={motion} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-motion={motion}
        data-has-close={showCloseButton ? "" : undefined}
        className={cn(
          "group/dialog focus-ring fixed inset-0 z-layer-dialog m-auto flex h-fit max-h-[calc(100%-var(--space-8))] w-[calc(100%-var(--space-8))] max-w-120 flex-col gap-4 rounded-lg border border-border bg-popover p-6 text-popover-foreground shadow-3",
          motion === "default" && "data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out",
          className
        )}
        {...props}
        {...retourDuFocus}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="app-icon-sm" className="absolute top-3 right-3" aria-label={closeLabel ?? messages.close}>
              <XIcon aria-hidden="true" />
            </Button>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1 text-left group-data-[has-close]/dialog:pr-8", className)}
      {...props}
    />
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  const [ref, defile] = useScrollable<HTMLDivElement>()
  const messages = useMessages()
  return (
    <div
      ref={ref}
      data-slot="dialog-body"
      {...(defile ? { tabIndex: 0, role: "region", "aria-label": messages.dialogContent } : {})}
      className={cn(
        "focus-ring-inset -mx-6 -my-1 min-h-0 flex-1 overflow-y-auto px-6 py-1 wrap-anywhere",
        defile && "border-y border-divider",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("type-heading text-heading wrap-anywhere text-balance", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("type-body-sm text-muted-foreground [&>a]:text-link [&>a]:underline", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
