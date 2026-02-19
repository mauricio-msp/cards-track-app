import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

import { Loader, PlusCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import React from 'react'
import { ptBR } from 'react-day-picker/locale'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { createDebt } from '@/api/create-debt'
import type { Member } from '@/api/get-members'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

import { CATEGORIES } from '@/helpers/categories'
import { formatPrice } from '@/helpers/format-price'
import { formatValueToCents } from '@/helpers/format-value-to-cents'
import { RELATIONSHIPS } from '@/helpers/relationships'
import { useFilterDebts } from '@/hooks/store/use-filter-debts-store'
import { useMembersStore } from '@/hooks/store/use-members-store'

const CreateDebtFormSchema = z.object({
  description: z.string().nonempty('Description cannot be empty'),

  members: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        amount: z.string({ error: 'Amount cannot be empty' }).refine(value => {
          const cents = formatValueToCents(value)
          return cents !== null && cents > 0
        }, 'Invalid amount'),
      }),
    )
    .min(1, 'At least one member is required'),

  category: z.string('Please select a category'),
  purchaseDate: z.date('Please select a purchase date'),
  installmentsCount: z
    .number({ error: 'Please enter the number of installments' })
    .positive('Installments must be greater than zero'),
})

type CreateDebtForm = z.infer<typeof CreateDebtFormSchema>

const defaultValues = {
  members: [],
  category: '',
  description: '',
  purchaseDate: undefined,
  installmentsCount: 1,
}

export function CreateDebtForm({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const { id } = useParams({ from: '/_app/credit-card/$id' })
  const { month, year } = useFilterDebts()

  const [open, setOpen] = React.useState(false)
  const [checked, setChecked] = React.useState(false)

  const anchor = useComboboxAnchor()
  const membersStore = useMembersStore(state => state.members)

  const {
    reset,
    watch,
    control,
    register,
    handleSubmit,
    clearErrors,
    formState: { isSubmitting, errors },
  } = useForm<CreateDebtForm>({
    resolver: zodResolver(CreateDebtFormSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  const { fields, replace } = useFieldArray({
    control,
    name: 'members',
    keyName: '_rhf_id',
  })

  const { mutateAsync: createDebtFn } = useMutation({
    mutationFn: createDebt,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cards', id, 'debts', month, year] }),
        queryClient.invalidateQueries({
          queryKey: ['cards', id, 'month', 'total', 'amount', month, year],
        }),
        queryClient.invalidateQueries({
          queryKey: ['cards', id, 'total', 'amount'],
        }),
      ])
    },
  })

  async function handleCreateDebt({
    category,
    description,
    members,
    purchaseDate,
    installmentsCount,
  }: CreateDebtForm) {
    const newDebt = {
      cardId: id,
      members: members.map(member => ({
        ...member,
        amount: (formatValueToCents(member.amount) ?? 0) * installmentsCount,
      })),
      category,
      description,
      purchaseDate: new Date(purchaseDate),
      installmentsCount,
    }

    try {
      await createDebtFn(newDebt)
    } catch (error) {
      console.log('🚀 ~ handleCreateDebt ~ error:', error)
    }

    reset(defaultValues)
    clearErrors(['category', 'members'])
    setChecked(false)
  }

  // Sincronizamos o que o Combobox exibe com o que está no FieldArray
  const currentMembersIds = fields.map(f => f.id)
  const selectedMembersForCombobox = membersStore.filter(m => currentMembersIds.includes(m.id))

  const watchedMembers = watch('members')
  const installmentsCount = watch('installmentsCount') || 1
  const totalAmountInCents =
    watchedMembers.reduce((sum, member) => {
      const amountInCents = member?.amount ? (formatValueToCents(member.amount) ?? 0) : 0
      return sum + amountInCents
    }, 0) * installmentsCount

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-xl" onCloseAutoFocus={() => reset(defaultValues)}>
        <form
          onSubmit={handleSubmit(handleCreateDebt)}
          className="flex flex-col justify-end flex-1 gap-4"
        >
          <DialogHeader>
            <DialogTitle>Add new debt</DialogTitle>
            <DialogDescription>
              Register a new purchase and associate it with this credit card.
            </DialogDescription>
          </DialogHeader>

          <div className="-mx-4 max-h-[70vh] overflow-y-auto px-4 py-3">
            <FieldGroup>
              <Field data-invalid={!!errors.description} className="gap-1">
                <FieldLabel>Purchase description</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="description"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.description}
                    placeholder="e.g. iPhone 15, Supermarket, Online subscription"
                    {...register('description')}
                  />
                </InputGroup>
                {errors.description && <FieldError>{errors.description.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.members?.message} className="gap-1">
                <FieldLabel>Select members</FieldLabel>
                <Combobox
                  multiple
                  items={membersStore}
                  value={selectedMembersForCombobox}
                  onValueChange={(selected: Member[]) => {
                    replace(
                      selected.map(m => ({
                        id: m.id,
                        name: m.name,
                        amount: '',
                      })),
                    )
                  }}
                >
                  <ComboboxChips ref={anchor} className="w-full">
                    <ComboboxValue>
                      {(values: Member[]) => (
                        <React.Fragment>
                          {values.map(value => (
                            <ComboboxChip key={value.id}>{value.name}</ComboboxChip>
                          ))}
                          <ComboboxChipsInput
                            placeholder="Add one or more members"
                            aria-invalid={!!errors.members?.message}
                          />
                        </React.Fragment>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>

                  <ComboboxContent anchor={anchor} className="pointer-events-auto">
                    <ComboboxEmpty>No members found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: Member) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {errors.members?.message && <FieldError>{errors.members.message}</FieldError>}
              </Field>

              {fields.length > 0 && (
                <div className="flex flex-col bg-background border rounded-lg p-4 gap-4">
                  <span className="text-muted-foreground text-sm">
                    Define how much each member is responsible for in this purchase.
                    {checked && (
                      <>
                        {' '}
                        When the purchase is split into installments, the amount entered for each
                        member represents the <strong>value of a single installment</strong>. The{' '}
                        <strong>total amount</strong> will be calculated automatically based on the
                        number of installments.
                      </>
                    )}
                  </span>

                  <Separator />

                  {fields.map((member, index) => (
                    <Field
                      key={member._rhf_id}
                      data-invalid={!!errors.members?.[index]?.amount}
                      className="gap-1"
                    >
                      <div className="flex items-start gap-4">
                        <FieldLabel className="w-48">{member.name}:</FieldLabel>
                        <div className="flex flex-col gap-1">
                          <InputGroup>
                            <InputGroupAddon>
                              <InputGroupText>R$</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              id="amount"
                              disabled={isSubmitting}
                              aria-invalid={!!errors.members?.[index]?.amount}
                              placeholder="0.00"
                              {...register(`members.${index}.amount` as const)}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupText>BRL</InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                          {errors.members?.[index]?.amount && (
                            <FieldError>{errors.members?.[index]?.amount.message}</FieldError>
                          )}
                        </div>
                      </div>
                    </Field>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field data-invalid={!!errors.purchaseDate} className="gap-1">
                  <FieldLabel>Purchase date</FieldLabel>
                  <Controller
                    name="purchaseDate"
                    control={control}
                    render={({ field }) => (
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button id="date" variant="outline" className="justify-start font-normal">
                            {field.value
                              ? field.value.toLocaleDateString()
                              : 'Select a purchase date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar
                            mode="single"
                            locale={ptBR}
                            selected={field.value}
                            defaultMonth={field.value}
                            captionLayout="dropdown"
                            // disabled={{ after: new Date() }}
                            onSelect={date => {
                              field.onChange(date)
                              setOpen(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.purchaseDate && <FieldError>{errors.purchaseDate.message}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.category} className="gap-1">
                  <FieldLabel>Category</FieldLabel>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        items={CATEGORIES}
                        value={field.value || ''}
                        onValueChange={field.onChange}
                      >
                        <ComboboxInput placeholder="Select a category" />
                        <ComboboxContent
                          className="pointer-events-auto"
                          onWheel={event => event.stopPropagation()}
                        >
                          <ComboboxEmpty>No categories found.</ComboboxEmpty>
                          <ComboboxList>
                            {(group, index) => (
                              <ComboboxGroup key={group.value} items={group.items}>
                                <ComboboxLabel>{group.value}</ComboboxLabel>
                                <ComboboxCollection>
                                  {item => (
                                    <ComboboxItem key={item} value={item}>
                                      {item}
                                    </ComboboxItem>
                                  )}
                                </ComboboxCollection>
                                {index < RELATIONSHIPS.length - 1 && <ComboboxSeparator />}
                              </ComboboxGroup>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    )}
                  />
                  {errors.category && <FieldError>{errors.category.message}</FieldError>}
                </Field>
              </div>

              <FieldLabel htmlFor="switch-purchase">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Installment purchase</FieldTitle>
                    <FieldDescription>
                      Enable this option if the purchase was made in installments.
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-purchase" checked={checked} onCheckedChange={setChecked} />
                </Field>
              </FieldLabel>

              {checked && (
                <div className="flex gap-4">
                  <Field data-invalid={!!errors.installmentsCount}>
                    <FieldLabel htmlFor="limit">Number of installments</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>In</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="installmentsCount"
                        disabled={isSubmitting}
                        aria-invalid={!!errors.installmentsCount}
                        placeholder="0"
                        {...register('installmentsCount', { valueAsNumber: true })}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>x</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {errors.installmentsCount && (
                      <FieldError>{errors.installmentsCount.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="installmentsAmount" className="text-muted-foreground">
                      Total amount
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>R$</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="installmentsAmount"
                        disabled
                        placeholder="0.00"
                        value={formatPrice(
                          Number.isNaN(totalAmountInCents)
                            ? 0
                            : Number((totalAmountInCents / 100).toFixed(2)),
                        ).replace('R$', '')}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>BRL</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                </div>
              )}
            </FieldGroup>
          </div>

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
                <PlusCircle className="size-4" />
              )}
              {isSubmitting ? 'Saving debt...' : 'Add debt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
