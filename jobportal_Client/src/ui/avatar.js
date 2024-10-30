import React from "react";

const Avatar = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className = "", src, alt = "Avatar", ...props }, ref) => (
  <img
    ref={ref}
    src={src}
    alt={alt}
    className={`aspect-square h-full w-full ${className}`}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}
    {...props}
  >
    {children}
  </div>
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
