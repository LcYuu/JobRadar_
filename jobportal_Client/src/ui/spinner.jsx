import React from "react";
import { cn } from "../lib/utils";

const Spinner = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-4 border-gray-200 border-t-purple-600",
        className
      )}
      {...props}
    />
  );
};

export { Spinner }; 