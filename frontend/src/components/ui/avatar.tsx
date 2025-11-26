"use client"

import * as React from "react"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  fallback?: string
  alt?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({ children, className, ...props }, ref) => (
  <div ref={ref} className={["inline-flex items-center justify-center overflow-hidden rounded-full bg-muted", className].filter(Boolean).join(' ')} {...props}>
    {children}
  </div>
))
Avatar.displayName = "Avatar"

const AvatarImage = ({ src, alt }: { src?: string | null, alt?: string }) => {
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt || "avatar"} className="h-full w-full object-cover" />
  )
}

const AvatarFallback = ({ children }: { children?: React.ReactNode }) => (
  <span className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">{children}</span>
)

export { Avatar, AvatarImage, AvatarFallback }
