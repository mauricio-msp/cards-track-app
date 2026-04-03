import { Loader, PlusCircle } from 'lucide-react'
import React, { type ReactNode } from 'react'
import { ptBR } from 'react-day-picker/locale'
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

import { CATEGORIES } from '@/features/credit-card/categories'
import { useCreateDebtForm } from '@/features/credit-card/hooks'
import type { Member } from '@/features/member/api/get-members'
import { RELATIONSHIPS } from '@/helpers/relationships'
import { formatPrice } from '@/lib/utils'

export function CreateDebtForm({ children }: { children: ReactNode }) {
  const {
    form,
    fields,
    isPending,
    calendarOpen,
    setCalendarOpen,
    installmentsEnabled,
    setInstallmentsEnabled,
    totalAmountInCents,
    selectedMembersForCombobox,
    membersStore,
    handleMembersChange,
    onSubmit,
  } = useCreateDebtForm()

  const {
    control,
    register,
    formState: { errors },
  } = form

  const anchor = useComboboxAnchor()

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-xl" onCloseAutoFocus={() => form.reset()}>
        <form onSubmit={onSubmit} className="flex flex-col justify-end flex-1 gap-4">
          <DialogHeader>
            <DialogTitle>Adicionar despesa</DialogTitle>
            <DialogDescription>
              Registre uma nova compra e associe ao cartão de crédito.
            </DialogDescription>
          </DialogHeader>

          <div className="-mx-4 max-h-[70vh] overflow-y-auto px-4 py-3">
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
                  <span className="text-muted-foreground text-sm">
                    Defina quanto cada membro é responsável nesta compra.
                    {installmentsEnabled && (
                      <>
                        {' '}
                        O valor informado representa o valor de <strong>uma única parcela</strong>.
                        O <strong>valor total</strong> será calculado automaticamente.
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
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`item-${index}`} className="border-none">
                          <div className="flex items-start justify-between p-4 gap-4">
                            <div className="flex flex-col items-start min-w-30">
                              <FieldLabel className="text-white font-bold">
                                {member.name}:
                              </FieldLabel>
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
                                  placeholder="0.00"
                                  {...register(`members.${index}.amount`)}
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
                  ))}
                </div>
              )}

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
                            {field.value
                              ? field.value.toLocaleDateString('pt-BR')
                              : 'Selecione a data'}
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

              <FieldLabel htmlFor="switch-purchase">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Compra parcelada</FieldTitle>
                    <FieldDescription>
                      Ative esta opção se a compra foi feita em parcelas.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-purchase"
                    checked={installmentsEnabled}
                    onCheckedChange={setInstallmentsEnabled}
                  />
                </Field>
              </FieldLabel>

              {installmentsEnabled && (
                <div className="flex gap-4">
                  <Field data-invalid={!!errors.installmentsCount}>
                    <FieldLabel htmlFor="installmentsCount">Número de parcelas</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>Em</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="installmentsCount"
                        disabled={isPending}
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
                      Valor total
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
              <Button disabled={isPending} variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer" disabled={isPending}>
              {isPending ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <PlusCircle className="size-4" />
              )}
              {isPending ? 'Salvando...' : 'Adicionar despesa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
