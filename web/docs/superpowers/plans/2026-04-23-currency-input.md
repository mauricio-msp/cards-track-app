# CurrencyInput Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a reusable `CurrencyInput` UI component with fixed inline R$ prefix and large font, replacing inline patterns in both card forms.

**Architecture:** Single component in `src/components/ui/currency-input.tsx` wrapping `InputGroup` + addons. Applies `applyBRLMask` internally. Used in `create-card-form.tsx` and `update-card-form.tsx`.

**Tech Stack:** React, Tailwind CSS, existing `InputGroup` primitives, `applyBRLMask` from `@/lib/utils`

---

### Task 1: Create `CurrencyInput` component

**Files:**
- Create: `src/components/ui/currency-input.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type * as React from 'react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { applyBRLMask } from '@/lib/utils'

interface CurrencyInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  groupClassName?: string
}

function CurrencyInput({ onChange, groupClassName, className, ...props }: CurrencyInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.target.value = applyBRLMask(e.target.value)
    onChange?.(e)
  }

  return (
    <InputGroup className={cn('border-primary/50 bg-primary/5 h-auto', groupClassName)}>
      <InputGroupAddon align="inline-start">
        <InputGroupText className="text-primary font-semibold text-2xl">R$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        inputMode="numeric"
        placeholder="0,00"
        className={cn('text-2xl font-bold py-3', className)}
        onChange={handleChange}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>BRL</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { CurrencyInput }
```

---

### Task 2: Use `CurrencyInput` in `create-card-form.tsx`

**Files:**
- Modify: `src/features/credit-card/components/forms/create-card-form.tsx`

- [ ] **Step 1: Replace limit field InputGroup block**

Remove imports `InputGroup, InputGroupAddon, InputGroupInput, InputGroupText` if no longer used elsewhere in the file.

Add import:
```tsx
import { CurrencyInput } from '@/components/ui/currency-input'
```

Replace the entire `<Field data-invalid={!!errors.limit}>` block (lines 88–111) with:

```tsx
<Field data-invalid={!!errors.limit}>
  <FieldLabel htmlFor="limit">Credit limit</FieldLabel>
  <CurrencyInput
    id="limit"
    disabled={isPending}
    aria-invalid={!!errors.limit}
    onChange={e => {
      e.target.value = applyBRLMask(e.target.value)
      onLimitChange(e)
    }}
    {...limitRegister}
  />
  {errors.limit && <FieldError>{errors.limit.message}</FieldError>}
</Field>
```

Wait — `CurrencyInput` already calls `applyBRLMask` internally. The `onChange` passed here goes through `handleChange` which applies the mask then calls the provided `onChange`. So simplify to:

```tsx
<Field data-invalid={!!errors.limit}>
  <FieldLabel htmlFor="limit">Credit limit</FieldLabel>
  <CurrencyInput
    id="limit"
    disabled={isPending}
    aria-invalid={!!errors.limit}
    onChange={onLimitChange}
    {...limitRegister}
  />
  {errors.limit && <FieldError>{errors.limit.message}</FieldError>}
</Field>
```

Also remove `applyBRLMask` import if unused after this change. Remove the `const { onChange: onLimitChange, ...limitRegister } = register('limit')` destructuring only if `onLimitChange` is no longer needed elsewhere — keep the destructure, just simplify the onChange prop.

---

### Task 3: Use `CurrencyInput` in `update-card-form.tsx`

**Files:**
- Modify: `src/features/credit-card/components/forms/update-card-form.tsx`

- [ ] **Step 1: Replace limit field InputGroup block**

Add import:
```tsx
import { CurrencyInput } from '@/components/ui/currency-input'
```

Replace the `<Field data-invalid={!!errors.limit}>` block (lines 82–111) with:

```tsx
<Field data-invalid={!!errors.limit}>
  <FieldLabel
    htmlFor="limit"
    className="text-primary/70 text-xs uppercase tracking-wider"
  >
    Limite do cartão
  </FieldLabel>
  <CurrencyInput
    id="limit"
    disabled={isPending}
    aria-invalid={!!errors.limit}
    onChange={onLimitChange}
    {...limitRegister}
  />
  {errors.limit && <FieldError>{errors.limit.message}</FieldError>}
</Field>
```

Remove `InputGroup, InputGroupAddon, InputGroupInput, InputGroupText` imports if unused. Remove `applyBRLMask` import if unused.
