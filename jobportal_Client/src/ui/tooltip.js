import React, { forwardRef } from 'react';
import { cn } from '../utils/utils';

const Tooltip = ({ children, content, className, ...props }) => {
  return (
    <div className="relative group inline-block" {...props}>
      {children}
      <div 
        className={cn(
          "absolute z-50 scale-0 group-hover:scale-100 transition-all duration-300 ease-in-out",
          "bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow-lg",
          "absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1",
          "opacity-0 group-hover:opacity-100",
          className
        )}
      >
        {content}
        <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 rotate-45 w-3 h-3 bg-gray-800"></div>
      </div>
    </div>
  );
};

const TooltipTrigger = forwardRef(({ children, asChild, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button';
  return (
    <Comp ref={ref} {...props}>
      {children}
    </Comp>
  );
});

const TooltipContent = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div 
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

TooltipTrigger.displayName = 'TooltipTrigger';
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent }; 