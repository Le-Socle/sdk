import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/cn"

/**
 * Champ texte.
 *
 * Même hauteur que le bouton et le sélecteur pour une taille et une densité données : sm, md et lg
 * lisent --control-sm, --control-md et --control-lg (44 px sous un doigt). Fond --card, bordure
 * --input (3:1 au moins), anneau de focus du thème. Une erreur (aria-invalid) passe la bordure au
 * rouge ; le message se pose à côté, dans FieldError.
 */
const inputVariants = cva(
  "focus-ring w-full min-w-0 rounded-md border border-input bg-card text-foreground transition-[border-color] duration-micro file:type-label file:me-4 file:border-0 file:bg-transparent placeholder:text-muted-foreground hover:not-aria-invalid:border-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
  {
    variants: {
      size: {
        sm: "type-body-sm h-control-sm px-3",
        md: "type-body-sm h-control-md px-3",
        lg: "type-body h-control-lg px-4",
      },
    },
    defaultVariants: { size: "md" },
  }
)

function Input({
  className,
  type,
  size = "md",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>) {
  return <input type={type} data-slot="input" data-size={size} className={cn(inputVariants({ size }), className)} {...props} />
}

export { Input, inputVariants }
