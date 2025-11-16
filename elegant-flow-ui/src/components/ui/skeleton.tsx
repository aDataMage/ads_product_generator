/**
 * Skeleton Component
 * 
 * Loading placeholder component for content that is being loaded
 * Based on shadcn/ui skeleton component
 */

import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

export { Skeleton }
