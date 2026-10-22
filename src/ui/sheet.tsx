"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { cn } from "../lib/cn"
import { useMessages } from "./messages"
import { useFocusReturn } from "../lib/use-focus-return"
import { useScrollable } from "../lib/use-scrollable"
import { Button } from "./button"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

type SheetMotion = "default" | "none"

function SheetOverlay({
  className,
  motion = "default",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay> & { motion?: SheetMotion }) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-layer-sheet bg-dialog-overlay",
        motion === "default" && "data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  size = "default",
  showCloseButton = true,
  closeLabel,
  motion = "default",
  container,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "right" | "left"
  size?: "default" | "wide"
  showCloseButton?: boolean
  closeLabel?: string
  motion?: SheetMotion
  container?: React.ComponentProps<typeof SheetPrimitive.Portal>["container"]
}) {
  const retourDuFocus = useFocusReturn({ onOpenAutoFocus, onCloseAutoFocus })
  const messages = useMessages()
  return (
    <SheetPortal container={container}>
      <SheetOverlay motion={motion} />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        data-size={size}
        data-motion={motion}
        data-has-close={showCloseButton ? "" : undefined}
        className={cn(
          "group/sheet focus-ring fixed inset-y-0 z-layer-sheet flex h-full w-full max-w-full flex-col bg-popover text-popover-foreground shadow-3 sm:data-[size=default]:w-120 sm:data-[size=wide]:w-160 data-[side=right]:right-0 data-[side=right]:border-l data-[side=left]:left-0 data-[side=left]:border-r",
          "border-border",
          motion === "default" &&
            "data-[side=right]:data-[state=open]:animate-sheet-in-right data-[side=right]:data-[state=closed]:animate-sheet-out-right data-[side=left]:data-[state=open]:animate-sheet-in-left data-[side=left]:data-[state=closed]:animate-sheet-out-left",
          className
        )}
        {...props}
        {...retourDuFocus}
      >
        {children}
        {showCloseButton ? (
          <SheetPrimitive.Close asChild>
            <Button variant="ghost" size="app-icon-sm" className="absolute top-4 right-4" aria-label={closeLabel ?? messages.close}>
              <XIcon aria-hidden="true" />
            </Button>
          </SheetPrimitive.Close>
        ) : null}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col gap-1 border-b border-border-subtle p-6 text-left group-data-[has-close]/sheet:pr-14",
        className
      )}
      {...props}
    />
  )
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  const [ref, defile] = useScrollable<HTMLDivElement>()
  const messages = useMessages()
  return (
    <div
      ref={ref}
      data-slot="sheet-body"
      {...(defile ? { tabIndex: 0, role: "region", "aria-label": messages.sheetContent } : {})}
      className={cn("focus-ring-inset min-h-0 flex-1 overflow-y-auto p-6 wrap-anywhere", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col-reverse gap-2 border-t border-border-subtle p-6 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("type-heading text-heading wrap-anywhere text-balance", className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("type-body-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
