import * as React from "react"

import { cn } from "../lib/cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "focus-ring type-body-sm min-h-32 w-full resize-y rounded-md border border-input bg-card px-4 py-3 text-foreground transition-[border-color] duration-micro placeholder:text-muted-foreground hover:not-aria-invalid:border-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
