import React from "react";

const labelStyles = "text-sm font-medium leading-none cursor-default opacity-100";

const Label = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`${labelStyles} ${className}`}
      {...props}
    />
  );
});

Label.displayName = "Label";

export { Label };
