"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value))

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800",
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
