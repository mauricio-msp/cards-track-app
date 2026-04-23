import * as React from 'react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { applyBRLMask, cn } from '@/lib/utils'

interface CurrencyInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  groupClassName?: string
}

function CurrencyInput({
  onChange,
  groupClassName,
  className,
  value,
  defaultValue,
  ...props
}: CurrencyInputProps) {
  const [hasValue, setHasValue] = React.useState(false)

  React.useEffect(() => {
    if (value !== undefined) setHasValue(value !== '' && value !== '0')
  }, [value])

  // Uncontrolled (RHF register): RHF sets DOM value via ref after mount,
  // read it after next frame when RHF is done.
  const { ref: propsRef, ...restProps } = props as React.ComponentProps<'input'> & {
    ref?: React.Ref<HTMLInputElement>
  }

  const mergedRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      if (node) requestAnimationFrame(() => setHasValue(node.value !== ''))

      if (typeof propsRef === 'function') propsRef(node)
      else if (propsRef && typeof propsRef === 'object') {
        ;(propsRef as React.RefObject<HTMLInputElement | null>).current = node
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [propsRef],
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.target.value = applyBRLMask(e.target.value)
    setHasValue(e.target.value !== '')
    onChange?.(e)
  }

  return (
    <InputGroup className={cn('h-auto border-primary/50 bg-primary/5', groupClassName)}>
      <div className="flex w-full items-center gap-1 px-3 pt-3 pb-1">
        <span
          data-has-value={hasValue}
          className="font-semibold text-xl select-none leading-none text-muted-foreground/50 data-[has-value=true]:text-primary"
        >
          R$
        </span>
        <InputGroupInput
          inputMode="numeric"
          placeholder="0,00"
          className={cn(
            'p-0 font-bold border-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50',
            'md:text-xl',
            className,
          )}
          ref={mergedRef}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...restProps}
        />
      </div>
      <InputGroupAddon align="block-end">
        <InputGroupText>BRL</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { CurrencyInput }
