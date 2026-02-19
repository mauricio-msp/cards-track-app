import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Loader, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { createCard } from '@/api/create-card'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { creditCards } from '@/helpers/credit-cards'
import { formatValueToCents } from '@/helpers/format-value-to-cents'

const CreateCreditCardFormSchema = z.object({
  name: z.string().min(1, 'Credit card name cannot be empty'),
  limit: z.string({ error: 'Limit cannot be empty' }).refine(value => {
    const cents = formatValueToCents(value)
    return cents !== null && cents > 0
  }, 'Invalid limit amount'),
  closingOffsetDays: z.number().positive('Closing offset must be greater than zero'),
  dueDay: z.number().positive('Due day must be greater than zero'),
})

type CreateCreditCardForm = z.infer<typeof CreateCreditCardFormSchema>

const defaultValues = {
  name: '',
  limit: '',
  closingOffsetDays: 0,
  dueDay: 0,
}

export function CreateCreditCardForm({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<CreateCreditCardForm>({
    resolver: zodResolver(CreateCreditCardFormSchema),
    defaultValues,
  })

  const { mutateAsync: createCreditCardFn } = useMutation({
    mutationFn: createCard,
  })

  async function handleCreateCreditCard({
    name,
    limit,
    closingOffsetDays,
    dueDay,
  }: CreateCreditCardForm) {
    const limitInCents = formatValueToCents(limit) ?? 0

    try {
      await createCreditCardFn({
        name,
        limit: limitInCents,
        closingOffsetDays,
        dueDay,
      })

      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
    } catch (error) {
      console.log('🚀 ~ handleCreateCreditCard ~ error:', error)
    }

    reset(defaultValues)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-sm" onCloseAutoFocus={() => reset(defaultValues)}>
        <form
          onSubmit={handleSubmit(handleCreateCreditCard)}
          className="flex flex-col justify-end flex-1 gap-4"
        >
          <DialogHeader>
            <DialogTitle>Create credit card</DialogTitle>
            <DialogDescription>
              Add a new credit card to track limits, expenses, and installments.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel>Credit card</FieldLabel>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Select
                    disabled={isSubmitting}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-invalid={!!errors.name}>
                      <SelectValue placeholder="Select a credit card" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {creditCards
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(c => (
                            <SelectItem key={c.name} value={c.name.toLowerCase()}>
                              {c.icon({})}
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.limit}>
              <FieldLabel htmlFor="limit">Credit limit</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>R$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="limit"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.limit}
                  placeholder="0.00"
                  {...register('limit')}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>BRL</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.limit && <FieldError>{errors.limit.message}</FieldError>}
            </Field>

            {/* INLINE FIELDS */}
            <div className="flex gap-4">
              <Field data-invalid={!!errors.closingOffsetDays} className="flex-1">
                <FieldLabel htmlFor="closingOffsetDays">Closing offset (days)</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="closingOffsetDays"
                    disabled={isSubmitting}
                    placeholder="7"
                    aria-invalid={!!errors.closingOffsetDays}
                    {...register('closingOffsetDays', { valueAsNumber: true })}
                  />
                </InputGroup>
                {errors.closingOffsetDays && (
                  <FieldError>{errors.closingOffsetDays.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.dueDay} className="flex-1">
                <FieldLabel htmlFor="dueDay">Due day</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="dueDay"
                    disabled={isSubmitting}
                    placeholder="10"
                    aria-invalid={!!errors.dueDay}
                    {...register('dueDay', { valueAsNumber: true })}
                  />
                </InputGroup>
                {errors.dueDay && <FieldError>{errors.dueDay.message}</FieldError>}
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isSubmitting} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {isSubmitting ? 'Creating card...' : 'Create card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
