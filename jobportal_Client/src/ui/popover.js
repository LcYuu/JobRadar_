import React, { useState, useRef, useEffect } from 'react';

// Custom Popover Component
export function Popover({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  // Toggles the popover visibility
  const togglePopover = () => {
    setIsOpen(!isOpen);
  };

  // Closes the popover when clicking outside
  const popoverRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverRef]);

  return (
    <div ref={popoverRef} className="relative inline-block">
      {React.Children.map(children, (child) => {
        // Wrap the trigger element to handle click
        if (child.type === PopoverTrigger) {
          return React.cloneElement(child, { onClick: togglePopover });
        }
        // Render content element based on open/close state
        if (child.type === PopoverContent && isOpen) {
          return child;
        }
        return child;
      })}
    </div>
  );
}

// Trigger for Popover
export function PopoverTrigger({ children, ...props }) {
  return (
    <button {...props}>
      {children}
    </button>
  );
}

// Popover content that appears when trigger is clicked
export function PopoverContent({ children, className, ...props }) {
  return (
    <div
      className={`absolute z-50 w-72 rounded-md border bg-white p-4 shadow-md ${className}`}
      style={{ top: '100%', left: '50%', transform: 'translateX(-50%)' }}
      {...props}
    >
      {children}
    </div>
  );
}
