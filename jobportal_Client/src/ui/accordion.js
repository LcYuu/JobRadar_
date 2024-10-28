import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils/utils";

const Accordion = ({ children, className, ...props }) => (
  <div className={cn("AccordionRoot", className)} {...props}>
    {children}
  </div>
);

const AccordionItem = React.forwardRef(function AccordionItem(
  { className, ...props },
  ref
) {
  return (
    <div ref={ref} className={cn("border-b AccordionItem", className)} {...props} />
  );
});

const AccordionTrigger = React.forwardRef(function AccordionTrigger(
  { className, children, ...props },
  ref
) {
  return (
    <div className="flex AccordionHeader">
      <button
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline AccordionTrigger",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 AccordionChevron" />
      </button>
    </div>
  );
});

const AccordionContent = React.forwardRef(function AccordionContent(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all AccordionContent",
        className
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
});

Accordion.displayName = "Accordion";
AccordionItem.displayName = "AccordionItem";
AccordionTrigger.displayName = "AccordionTrigger";
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
