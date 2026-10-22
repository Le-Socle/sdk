"use client"

import * as React from "react"
import { Toaster as Sonner, toast, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, LoaderCircleIcon, OctagonXIcon, TriangleAlertIcon, XIcon } from "lucide-react"

import { cn } from "../lib/cn"
import { useMessages } from "./messages"
import { buttonVariants } from "./button"

function Toaster({ toastOptions, style, icons, ...props }: ToasterProps) {
  const messages = useMessages()
  return (
    <Sonner
      theme="light"
      containerAriaLabel={messages.notifications}
      closeButton
      icons={{
        success: <CircleCheckIcon aria-hidden="true" className="size-4 text-status-success-text" />,
        info: <InfoIcon aria-hidden="true" className="size-4 text-status-info-text" />,
        warning: <TriangleAlertIcon aria-hidden="true" className="size-4 text-status-warning-text" />,
        error: <OctagonXIcon aria-hidden="true" className="size-4 text-status-error-text" />,
        loading: <LoaderCircleIcon aria-hidden="true" className="animate-spinner size-4 text-muted-foreground" />,
        close: <XIcon aria-hidden="true" className="size-4" />,
        ...icons,
      }}
      style={{ zIndex: "var(--layer-toast)", ...style }}
      {...props}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: messages.close,
        ...toastOptions,
        style: {
          transitionDuration: "var(--duration-normal)",
          transitionTimingFunction: "var(--ease-out)",
          ...toastOptions?.style,
        },
        classNames: {
          ...toastOptions?.classNames,
          toast: cn(
            "group/toast focus-ring! flex w-(--width) flex-wrap items-start justify-end gap-3 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-2 wrap-anywhere",
            toastOptions?.classNames?.toast
          ),
          icon: cn("relative order-1 mt-0.5 flex size-4 shrink-0 [&>svg]:size-4", toastOptions?.classNames?.icon),
          content: cn("order-2 flex min-w-0 flex-1 basis-[calc(100%-var(--space-4)-2*var(--space-3)-var(--control-sm))] flex-col gap-1", toastOptions?.classNames?.content),
          title: cn("type-label text-heading", toastOptions?.classNames?.title),
          description: cn("type-body-sm text-muted-foreground", toastOptions?.classNames?.description),
          cancelButton: cn(buttonVariants({ variant: "ghost", size: "app-sm" }), "order-4", toastOptions?.classNames?.cancelButton),
          actionButton: cn(buttonVariants({ variant: "secondary", size: "app-sm" }), "order-5", toastOptions?.classNames?.actionButton),
          closeButton: cn(
            buttonVariants({ variant: "ghost", size: "app-icon-sm" }),
            "order-3 -my-1 -mr-1 text-muted-foreground",
            toastOptions?.classNames?.closeButton
          ),
        },
      }}
    />
  )
}

export { Toaster, toast }
