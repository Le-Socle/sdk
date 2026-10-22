"use client"

import * as React from "react"
import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { TriangleAlertIcon } from "lucide-react"

import { cn } from "../lib/cn"
import { useMessages } from "./messages"
import { Label } from "./label"

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field-group" className={cn("flex w-full flex-col gap-6", className)} {...props} />
}

const fieldVariants = cva("group/field flex w-full gap-2", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal: "min-h-11 flex-row items-center gap-3 [&>[data-slot=field-label]]:self-stretch",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "relative flex min-w-0 flex-1 flex-col gap-1 [&_[data-slot=field-label]]:after:absolute [&_[data-slot=field-label]]:after:inset-0 [&_[data-slot=field-description]_a]:relative [&_[data-slot=field-description]_a]:z-10",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  children,
  required = false,
  requiredLabel,
  ...props
}: React.ComponentProps<typeof Label> & { required?: boolean; requiredLabel?: string }) {
  const messages = useMessages()
  return (
    <Label data-slot="field-label" className={cn("w-fit gap-2", className)} {...props}>
      {children}
      {required ? (
        <span className="type-body-sm text-muted-foreground [line-height:var(--leading-heading)]">{requiredLabel ?? messages.required}</span>
      ) : null}
    </Label>
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("type-body-sm text-muted-foreground [&>a]:text-link [&>a]:underline", className)}
      {...props}
    />
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("type-body-sm flex items-start gap-2 text-destructive-text", className)}
      {...props}
    >
      <TriangleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{content}</div>
    </div>
  )
}

export { Field, FieldContent, FieldLabel, FieldDescription, FieldError, FieldGroup, fieldVariants }
