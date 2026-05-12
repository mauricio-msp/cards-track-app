import { CircleQuestionMark, Layers, Repeat } from 'lucide-react'
import React from 'react'
import { ptBR } from 'react-day-picker/locale'
import type { Control, FieldArrayWithId, FieldErrors, UseFormRegister } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { CATEGORIES } from '@/features/credit-card/categories'
import type { CreatePurchaseFormValues } from '@/features/credit-card/hooks'
import type { Member } from '@/features/member/api/get-members'
import { RELATIONSHIPS } from '@/helpers/relationships'
import { applyBRLMask, cn, formatPrice } from '@/lib/utils'

export type PurchaseFormFieldsProps = {
  control: Control<CreatePurchaseFormValues>
  register: UseFormRegister<CreatePurchaseFormValues>
  errors: FieldErrors<CreatePurchaseFormValues>
  fields: FieldArrayWithId<CreatePurchaseFormValues, 'members', '_rhf_id'>[]
  isPending: boolean
  calendarOpen: boolean
  setCalendarOpen: (open: boolean) => void
  installmentsEnabled: boolean
  setInstallmentsEnabled: (enabled: boolean) => void
  installmentsCount: number
  totalAmountInCents: number
  membersStore: Member[]
  selectedMembersForCombobox: Member[]
  handleMembersChange: (selected: Member[]) => void
  isRecurring: boolean
  setIsRecurring: (value: boolean) => void
}

export function PurchaseFormFields({
  control,
  register,
  errors,
  fields,
  isPending,
  calendarOpen,
  setCalendarOpen,
  installmentsEnabled,
  setInstallmentsEnabled,
  installmentsCount,
  totalAmountInCents,
  membersStore,
  selectedMembersForCombobox,
  handleMembersChange,
  isRecurring,
  setIsRecurring,
}: PurchaseFormFieldsProps) {
  const anchor = useComboboxAnchor()

  return (
    <div className="-mx-4 max-h-[80vh] overflow-y-auto px-4 py-3">
      <FieldGroup>
        <Field data-invalid={!!errors.description} className="gap-1">
          <FieldLabel>Descrição da compra</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="description"
              disabled={isPending}
              aria-invalid={!!errors.description}
              placeholder="ex: iPhone 15, Supermercado, Assinatura"
              {...register('description')}
            />
          </InputGroup>
          {errors.description && <FieldError>{errors.description.message}</FieldError>}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field data-invalid={!!errors.purchaseDate} className="gap-1">
            <FieldLabel>Data da compra</FieldLabel>
            <Controller
              name="purchaseDate"
              control={control}
              render={({ field }) => (
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button id="date" variant="outline" className="justify-start font-normal">
                      {field.value ? field.value.toLocaleDateString('pt-BR') : 'Selecione a data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={field.value}
                      defaultMonth={field.value}
                      captionLayout="dropdown"
                      onSelect={date => {
                        field.onChange(date)
                        setCalendarOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.purchaseDate && <FieldError>{errors.purchaseDate.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.category} className="gap-1">
            <FieldLabel>Categoria</FieldLabel>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Combobox
                  items={CATEGORIES}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <ComboboxInput placeholder="Selecione uma categoria" />
                  <ComboboxContent
                    className="pointer-events-auto"
                    onWheel={event => event.stopPropagation()}
                  >
                    <ComboboxEmpty>Nenhuma categoria encontrada.</ComboboxEmpty>
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

        <div className="grid grid-cols-2 gap-3">
          <div
            className={cn(
              'border rounded-lg p-3 flex flex-col gap-3 transition-colors',
              installmentsEnabled && 'border-primary/50 bg-primary/5',
              isRecurring && 'pointer-events-none opacity-50',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium leading-tight flex items-center gap-1">
                  <Layers className="size-4" />
                  Compra parcelada
                </p>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Ative se a compra foi feita em parcelas.
                </span>
              </div>

              <Switch
                id="switch-purchase"
                checked={installmentsEnabled}
                disabled={isRecurring}
                onCheckedChange={v => {
                  setInstallmentsEnabled(v)
                  if (v) setIsRecurring(false)
                }}
              />
            </div>

            {installmentsEnabled && (
              <>
                <Separator />
                <Field data-invalid={!!errors.installmentsCount} className="gap-1 w-40">
                  <FieldLabel htmlFor="installmentsCount">Número de parcelas</FieldLabel>
                  <InputGroup className="dark:bg-background">
                    <InputGroupAddon>
                      <InputGroupText>Em</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="installmentsCount"
                      disabled={isPending}
                      placeholder="0"
                      aria-invalid={!!errors.installmentsCount}
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
              </>
            )}
          </div>

          <div
            className={cn(
              'border rounded-lg p-3 flex flex-col gap-3 transition-colors',
              isRecurring && 'border-primary/50 bg-primary/5',
              installmentsEnabled && 'pointer-events-none opacity-50',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium leading-tight flex items-center gap-1">
                  <Repeat className="size-4" />
                  Cobrança recorrente
                </p>
                <span className="text-xs text-muted-foreground mt-0.5">Repetida todo mês.</span>
              </div>

              <Switch
                id="switch-recurring"
                checked={isRecurring}
                disabled={installmentsEnabled}
                onCheckedChange={setIsRecurring}
              />
            </div>

            {isRecurring && (
              <>
                <Separator />
                <Field data-invalid={!!errors.billingDay} className="gap-1 w-28">
                  <FieldLabel htmlFor="billingDay">Dia do mês</FieldLabel>
                  <InputGroup className="dark:bg-background">
                    <InputGroupInput
                      id="billingDay"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      disabled={isPending}
                      aria-invalid={!!errors.billingDay}
                      placeholder="ex: 10"
                      className="text-right"
                      {...register('billingDay', {
                        setValueAs: v => {
                          if (v === '' || v === null || v === undefined) return undefined
                          const num = parseInt(String(v), 10)
                          return Number.isNaN(num) ? undefined : Math.min(num, 31)
                        },
                        onChange: e => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
                          const num = parseInt(raw, 10)
                          if (!raw) {
                            e.target.value = ''
                            return
                          }
                          e.target.value = num > 31 ? '31' : raw
                        },
                      })}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>/ mês</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {errors.billingDay && <FieldError>{errors.billingDay.message}</FieldError>}
                </Field>
              </>
            )}
          </div>
        </div>

        <Field data-invalid={!!errors.members?.message} className="gap-1">
          <FieldLabel>Selecionar membros</FieldLabel>
          <Combobox
            multiple
            items={membersStore}
            value={selectedMembersForCombobox}
            onValueChange={(selected: Member[]) => handleMembersChange(selected)}
          >
            <ComboboxChips ref={anchor} className="w-full">
              <ComboboxValue>
                {(values: Member[]) => (
                  <React.Fragment>
                    {values.map(value => (
                      <ComboboxChip key={value.id}>{value.name}</ComboboxChip>
                    ))}
                    <ComboboxChipsInput
                      placeholder="Adicione um ou mais membros"
                      aria-invalid={!!errors.members?.message}
                    />
                  </React.Fragment>
                )}
              </ComboboxValue>
            </ComboboxChips>

            <ComboboxContent anchor={anchor} className="pointer-events-auto">
              <ComboboxEmpty>Nenhum membro encontrado.</ComboboxEmpty>
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
            <p className="text-muted-foreground text-xs flex gap-1">
              <CircleQuestionMark className="size-4" />
              <span>
                Defina quanto cada membro paga por <strong>parcela</strong>. Total calculado
                automaticamente.
              </span>
            </p>

            <Separator />

            {fields.map((member, index) => {
              const { onChange: onAmountChange, ...amountRegister } = register(
                `members.${index}.amount`,
              )

              return (
                <Field
                  key={member._rhf_id}
                  data-invalid={!!errors.members?.[index]?.amount}
                  className="gap-1"
                >
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`item-${index}`} className="border-none">
                      <div className="flex items-start justify-between p-4 gap-4">
                        <div className="flex flex-col items-start min-w-30">
                          <FieldLabel className="text-white font-bold">{member.name}:</FieldLabel>
                          <AccordionTrigger className="flex items-center border px-0.5 py-0 text-[10px] text-zinc-500 hover:text-zinc-300 hover:no-underline uppercase tracking-wider">
                            Detalhar parcelas
                          </AccordionTrigger>
                        </div>

                        <div className="flex flex-col gap-1">
                          <InputGroup>
                            <InputGroupAddon>
                              <InputGroupText>R$</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              id={`amount-${index}`}
                              disabled={isPending}
                              aria-invalid={!!errors.members?.[index]?.amount}
                              placeholder="0,00"
                              inputMode="numeric"
                              onChange={e => {
                                e.target.value = applyBRLMask(e.target.value)
                                onAmountChange(e)
                              }}
                              {...amountRegister}
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

                      <AccordionContent className="px-4 pb-4 pt-2 border-t border-zinc-800/50 bg-zinc-900/20">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <FieldLabel className="text-[10px] uppercase text-zinc-500 font-bold">
                              Parcela inicial
                            </FieldLabel>
                            <InputGroupInput
                              placeholder="1"
                              {...register(`members.${index}.startInstallment`, {
                                valueAsNumber: true,
                              })}
                              className="h-8 border rounded-md"
                            />
                            {errors.members?.[index]?.startInstallment && (
                              <FieldError className="text-[12px] font-medium">
                                {errors.members[index].startInstallment.message}
                              </FieldError>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <FieldLabel className="text-[10px] uppercase text-zinc-500 font-bold">
                              Parcela final
                            </FieldLabel>
                            <InputGroupInput
                              placeholder="10"
                              {...register(`members.${index}.endInstallment`, {
                                setValueAs: v => (v === '' ? undefined : parseInt(v, 10)),
                              })}
                              className="h-8 border rounded-md"
                            />
                            {errors.members?.[index]?.endInstallment && (
                              <FieldError className="text-[12px] font-medium">
                                {errors.members[index].endInstallment.message}
                              </FieldError>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-[10px] text-zinc-600 italic">
                          Define o intervalo de parcelas sob responsabilidade deste membro.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Field>
              )
            })}
          </div>
        )}
      </FieldGroup>

      <Separator className="my-4" />

      <div className="rounded-lg border bg-muted/40 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total da compra</span>
          <span className="font-semibold tabular-nums">
            {formatPrice(totalAmountInCents / 100)}
          </span>
        </div>

        {installmentsEnabled && installmentsCount > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Valor por parcela</span>
            <span className="font-semibold tabular-nums">
              {formatPrice(Math.round(totalAmountInCents / installmentsCount) / 100)}
              <span className="text-muted-foreground font-normal ml-1 text-xs">
                x{installmentsCount}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
