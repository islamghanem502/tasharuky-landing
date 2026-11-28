import { Progress as ProgressPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

// shadcn/ui Progress. Fills from the reading start, so it runs right-to-left in Arabic.
function Progress({ className, indicatorClassName, value, ...props }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('h-full w-full flex-1 bg-primary transition-all', indicatorClassName)}
        style={{ transform: `translateX(calc(var(--progress-dir, -1) * ${100 - (value || 0)}%))` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
