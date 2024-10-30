import React from "react";

const Separator = React.forwardRef(
  ({ className = "", orientation = "horizontal", decorative = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={decorative ? "presentation" : "separator"}
        aria-orientation={orientation}
        className={`shrink-0 bg-border ${orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"} ${className}`}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";

export { Separator };
