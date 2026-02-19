import { Monitor, Moon, Sun } from 'lucide-react'

import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ModeToggle({ className, ...props }: React.ComponentProps<'div'>) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      data-theme={theme}
      className={cn(
        'w-fit mx-auto group p-0.5 border rounded-full flex items-center justify-around gap-2.5',
        className,
      )}
      {...props}
    >
      <Button
        variant="ghost"
        className="size-6 group-data-[theme=light]:bg-input group-data-[theme=light]:border hover:bg-input! rounded-full cursor-pointer"
        onClick={() => setTheme('light')}
      >
        <Sun className="text-foreground" />
      </Button>

      <Button
        variant="ghost"
        className="size-6 group-data-[theme=dark]:bg-input group-data-[theme=dark]:border hover:bg-input! rounded-full cursor-pointer"
        onClick={() => setTheme('dark')}
      >
        <Moon className="text-foreground" />
      </Button>

      <Button
        variant="ghost"
        className="size-6 group-data-[theme=system]:bg-input group-data-[theme=system]:border hover:bg-input! rounded-full cursor-pointer"
        onClick={() => setTheme('system')}
      >
        <Monitor className="text-foreground" />
      </Button>
    </div>
  )
}
