import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  valueClassName?: string;
}

export const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(({ value, size = 120, strokeWidth = 8, className, showValue = true, valueClassName }, ref) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="fill-none stroke-primary transition-all duration-1000 ease-out"
          style={{
            stroke: `url(#gradient-${value})`,
          }}
        />
        <defs>
          <linearGradient id={`gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
          </linearGradient>
        </defs>
      </svg>
      {showValue && (
        <div className={cn("absolute inset-0 flex flex-col items-center justify-center", valueClassName)}>
          <span className="text-3xl font-bold">{Math.round(value)}</span>
        </div>
      )}
    </div>
  );
});

CircularProgress.displayName = "CircularProgress";
