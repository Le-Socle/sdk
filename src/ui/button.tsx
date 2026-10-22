import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "../lib/cn"

/**
 * Bouton.
 *
 * Origine : shadcn/ui (style radix-lyra), lu depuis les rôles du SDK.
 * Une seule hauteur par taille : sm, md et lg lisent --control-sm, --control-md et --control-lg,
 * comme le champ (Input) et le sélecteur (SelectTrigger). Elles suivent la densité
 * (data-density) et le pointeur grossier (44 px). Les tailles `icon-*` sont les mêmes hauteurs
 * en carré, pour un bouton qui ne porte qu'une icône (son nom passe par aria-label).
 *
 * Écarts avec la source : variantes ajoutées (secondaire, discrète, danger, danger discret,
 * neutre, inverse) ; le danger de shadcn, un rouge teinté par mélange d'opacité, devient un
 * contour qui se remplit au survol ; l'anneau de focus (focus-ring) et l'appui (press) viennent
 * du thème ; aucune variante `dark:` : une surface sombre remappe les rôles.
 * Les noms de taille `app-sm`, `app`, `app-lg`, `app-icon-sm`, `app-icon` de l'ancien design
 * system restent acceptés (alias) pour que les écrans existants basculent sans retouche.
 */
const buttonVariants = cva(
  "focus-ring press type-label inline-flex rounded-md shrink-0 items-center justify-center gap-2 border border-transparent whitespace-nowrap select-none transition-[background-color,color,border-color,transform] duration-micro disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Principal : l'action de la page.
        default: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover",
        // Contour : filet et texte de l'action, fond pâle au survol.
        outline: "border-primary text-primary hover:bg-accent hover:text-accent-foreground active:bg-accent",
        // Inverse : le bouton clair, pour un fond sombre hors d'une surface data-surface.
        inverse:
          "bg-action-inverse text-action-inverse-text [--ring:var(--color-focus-inverse)] hover:bg-action-inverse-hover active:bg-action-inverse-hover",
        // Lien : souligné en permanence, la couleur ne porte pas seule le sens.
        link: "text-link underline [text-underline-offset:var(--space-1)] hover:text-primary",
        // Secondaire : remplissage neutre sans filet, pour le geste d'à côté (annuler).
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent",
        // Discrète : ni fond ni filet au repos, pour une barre d'outils ou une icône seule.
        ghost:
          "text-foreground hover:bg-muted hover:text-heading active:bg-muted aria-expanded:bg-muted aria-expanded:text-heading",
        // Danger : contour rouge au repos, fond d'erreur pâle au survol. Réservé à l'action qui détruit ou retire.
        danger:
          "border-destructive text-destructive-text hover:bg-status-error-bg hover:text-status-error-text active:bg-status-error-bg active:text-status-error-text",
        // Neutre : filet gris et texte courant. Le geste secondaire d'une application.
        neutral:
          "border-border bg-background text-foreground hover:border-border-strong hover:bg-muted hover:text-heading active:bg-muted aria-expanded:bg-muted",
        // Danger discret : texte rouge sans cadre, fond d'erreur pâle au survol.
        "danger-quiet": "text-destructive-text hover:bg-button-danger-quiet-hover-bg active:bg-button-danger-quiet-hover-bg",
      },
      size: {
        sm: "h-control-sm px-3",
        md: "h-control-md px-4",
        lg: "h-control-lg px-5",
        "icon-sm": "size-(--control-sm) p-0",
        icon: "size-(--control-md) p-0",
        "icon-lg": "size-(--control-lg) p-0",
        // Alias de l'ancien design system.
        "app-sm": "h-control-sm px-3",
        app: "h-control-md px-4",
        "app-lg": "h-control-lg px-5",
        "app-icon-sm": "size-(--control-sm) p-0",
        "app-icon": "size-(--control-md) p-0",
        // Alias de shadcn.
        default: "h-control-md px-4",
      },
    },
    compoundVariants: [{ variant: "link", className: "px-1" }],
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
