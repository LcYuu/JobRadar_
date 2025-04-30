import React, { useEffect, useState } from "react";
import * as Progress from '@radix-ui/react-progress';
import { cn } from "../lib/utils";

/**
 * Progress Bar Component
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - The progress value between 0-100
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Optional child elements
 * @returns {JSX.Element} Progress bar component
 */
const ProgressBar = React.forwardRef(({ className, value = 0, ...props }, ref) => {
  // Animate progress value for smoother transitions
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Delay before animation to make it visible
    const timer = setTimeout(() => {
      setProgress(value);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [value]);

  // Ensure value is between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, progress));

  // Choose color based on progress
  const getProgressColor = () => {
    if (progress < 30) return "bg-blue-400";
    if (progress < 60) return "bg-blue-500";
    if (progress < 90) return "bg-blue-600";
    return "bg-blue-700";
  };

  return (
    <Progress.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
      {...props}
    >
      <Progress.Indicator
        className={cn(
          "h-full transition-all duration-500 ease-out flex",
          getProgressColor()
        )}
        style={{ 
          transform: `translateX(-${100 - clampedValue}%)`,
          backgroundImage: progress > 20 ? "linear-gradient(to right, rgba(255,255,255,0.15), rgba(255,255,255,0))" : undefined
        }}
      >
        {progress > 20 && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-0 -translate-x-1/2 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        )}
      </Progress.Indicator>
    </Progress.Root>
  );
});

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
