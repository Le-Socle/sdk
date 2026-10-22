"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "../lib/cn"
import { useFocusReturn } from "../lib/use-focus-return"
import { Button } from "./button"

function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

type AlertDialogMotion = "default" | "none"

function AlertDialogOverlay({
  className,
  motion = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay> & { motion?: AlertDialogMotion }) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-layer-dialog bg-dialog-overlay",
        motion === "default" && "data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  motion = "default",
  container,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  motion?: AlertDialogMotion
  container?: React.ComponentProps<typeof AlertDialogPrimitive.Portal>["container"]
}) {
  const retourDuFocus = useFocusReturn({ onOpenAutoFocus, onCloseAutoFocus })
  return (
    <AlertDialogPortal container={container}>
      <AlertDialogOverlay motion={motion} />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-motion={motion}
        className={cn(
          "focus-ring fixed inset-0 z-layer-dialog m-auto flex h-fit max-h-[calc(100%-var(--space-8))] w-[calc(100%-var(--space-8))] max-w-120 flex-col gap-4 overflow-y-auto rounded-lg border border-border bg-popover p-6 text-popover-foreground shadow-3",
          motion === "default" && "data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out",
          className
        )}
        {...props}
        {...retourDuFocus}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-1 text-left", className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("type-heading text-heading wrap-anywhere text-balance", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("type-body-sm text-muted-foreground wrap-anywhere [&>a]:text-link [&>a]:underline", className)}
      {...props}
    />
  )
}

type ButtonProps = React.ComponentProps<typeof Button>

function AlertDialogAction({
  className,
  variant = "default",
  size = "app",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> & Pick<ButtonProps, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} className={className} asChild>
      <AlertDialogPrimitive.Action data-slot="alert-dialog-action" {...props} />
    </Button>
  )
}

function AlertDialogCancel({
  className,
  variant = "secondary",
  size = "app",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & Pick<ButtonProps, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} className={className} asChild>
      <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" {...props} />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
