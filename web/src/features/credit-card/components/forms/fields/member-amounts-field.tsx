import { CircleQuestionMark } from 'lucide-react'
import type { FieldArrayWithId, FieldErrors, UseFormRegister } from 'react-hook-form'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import type { CreatePurchaseFormValues } from '@/features/credit-card/hooks'
import { applyBRLMask } from '@/lib/utils'

type MemberAmountsFieldProps = {
  fields: FieldArrayWithId<CreatePurchaseFormValues, 'members', '_rhf_id'>[]
  register: UseFormRegister<CreatePurchaseFormValues>
  errors: FieldErrors<CreatePurchaseFormValues>
  isPending: boolean
}

export function MemberAmountsField({
  fields,
  register,
  errors,
  isPending,
}: MemberAmountsFieldProps) {
  return (
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
        const { onChange: onAmountChange, ...amountRegister } = register(`members.${index}.amount`)

        return (
          <Field
            key={member._rhf_id}
            data-invalid={!!errors.members?.[index]?.amount}
            className="gap-1 border-b last:border-0"
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={`item-${index}`}>
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
                          setValueAs: (v: string) => (v === '' ? undefined : parseInt(v, 10)),
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
  )
}
