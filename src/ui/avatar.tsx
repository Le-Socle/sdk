"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/cn"

/**
 * Avatar : l'image d'une personne ou d'une organisation, ou ses initiales à défaut.
 * Les tailles lisent les hauteurs de contrôle, pour s'aligner sur un bouton ou un champ.
 */
const avatarVariants = cva(
  "relative flex shrink-0 select-none overflow-hidden bg-secondary text-secondary-foreground",
  {
    variants: {
      size: {
        sm: "size-(--control-sm)",
        md: "size-(--control-md)",
        lg: "size-(--control-lg)",
      },
      shape: { round: "rounded-dot", square: "rounded-md" },
    },
    defaultVariants: { size: "md", shape: "round" },
  }
)

function Avatar({
  className,
  size = "md",
  shape = "round",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(avatarVariants({ size, shape }), className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />
}

/** Initiales affichées tant que l'image charge ou si elle manque. */
function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("type-label-sm flex size-full items-center justify-center", className)}
      {...props}
    />
  )
}

/** Plusieurs avatars côte à côte, qui se recouvrent d'un liseré de la couleur du fond. */
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      role="group"
      className={cn("flex items-center *:data-[slot=avatar]:-ml-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background first:*:data-[slot=avatar]:ml-0", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarGroup, AvatarImage, avatarVariants }
