import { Info } from 'lucide-react'
import type { ComponentProps } from 'react'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ClosingOffsetDaysInputProps extends ComponentProps<typeof InputGroupInput> {
  error?: string
}

export function ClosingOffsetDaysInput({ error, ...inputProps }: ClosingOffsetDaysInputProps) {
  return (
    <Field data-invalid={!!error} className="flex-1">
      <FieldLabel htmlFor="closingOffsetDays">Offset de fechamento (dias)</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <Popover>
            <PopoverTrigger asChild>
              <InputGroupButton variant="secondary" size="icon-xs" type="button" className="rounded-full">
                <Info className="size-3.5" />
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent align="start" className="flex flex-col gap-1 rounded-xl text-sm">
              <p className="font-medium">O que é offset de fechamento?</p>
              <p className="text-muted-foreground">
                Dias antes do vencimento em que a fatura fecha. Ex: vencimento dia 10 com offset 7 →
                fatura fecha dia 3.
              </p>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
        <InputGroupInput
          id="closingOffsetDays"
          placeholder="7"
          aria-invalid={!!error}
          {...inputProps}
        />
      </InputGroup>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
