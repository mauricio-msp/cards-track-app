import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Position, useChatStore } from '@/features/ai-chat/store/use-chat-store'

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'bottom-right', label: 'Inferior direito' },
  { value: 'bottom-left', label: 'Inferior esquerdo' },
  { value: 'top-right', label: 'Superior direito' },
  { value: 'top-left', label: 'Superior esquerdo' },
]

export function ChatSettings() {
  const position = useChatStore(s => s.position)
  const shortcut = useChatStore(s => s.shortcut)
  const setPosition = useChatStore(s => s.setPosition)
  const setShortcut = useChatStore(s => s.setShortcut)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <Settings2 className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3" align="end">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase text-muted-foreground">Posição</span>
            <Select value={position} onValueChange={v => setPosition(v as Position)}>
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {POSITIONS.map(p => (
                  <SelectItem key={p.value} value={p.value} className="text-xs">
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase text-muted-foreground">Atalho</span>
            <Input
              value={shortcut}
              onChange={e => setShortcut(e.target.value)}
              placeholder="ex: ctrl+k"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
