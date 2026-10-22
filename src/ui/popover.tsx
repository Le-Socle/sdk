"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "../lib/cn"

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverClose({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

const TitleContext = React.createContext<{ id: string; declare: (present: boolean) => void } | null>(null)

function PopoverContent({
  className,
  children,
  align = "start",
  sideOffset = 4,
  collisionPadding = 8,
  container,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  container?: React.ComponentProps<typeof PopoverPrimitive.Portal>["container"]
}) {
  const id = React.useId()
  const [hasTitle, setHasTitle] = React.useState(false)
  const context = React.useMemo(() => ({ id, declare: setHasTitle }), [id])
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        aria-labelledby={hasTitle ? id : undefined}
        className={cn(
          "focus-ring type-body-sm relative z-layer-menu flex w-80 max-w-(--radix-popover-content-available-width) flex-col gap-3 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-2 wrap-anywhere data-[state=open]:animate-popper-in",
          className
        )}
        {...props}
      >
        <TitleContext.Provider value={context}>{children}</TitleContext.Provider>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("flex flex-col gap-1", className)} {...props} />
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"div">) {
  const title = React.useContext(TitleContext)
  const declare = title?.declare
  React.useLayoutEffect(() => {
    declare?.(true)
    return () => declare?.(false)
  }, [declare])
  return (
    <div
      data-slot="popover-title"
      id={title?.id}
      className={cn("type-label text-heading", className)}
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("type-body-sm text-muted-foreground [&>a]:text-link [&>a]:underline", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
