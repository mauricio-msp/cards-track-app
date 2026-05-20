import { Check, Info, Loader, Sparkles, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import type { ParsedPurchaseAI } from '@/features/credit-card/api/parse-purchase-with-ai'

const BADGE_LABELS: Record<string, string> = {
  description: 'Descrição',
  purchaseDate: 'Data',
  category: 'Categoria',
  installmentsCount: 'Parcelas',
  members: 'Membros',
  unknownMembers: 'Membro não encontrado',
}

function formatParsedBadges(parsed: ParsedPurchaseAI) {
  type BadgeDefinition = {
    key: string
    label: string
    getValue: () => string | undefined
  }

  const definitions: BadgeDefinition[] = [
    {
      key: 'members',
      label: 'Valor',
      getValue: () => {
        if (!parsed.members?.length) return undefined

        const hasAmounts = parsed.members.some(m => m.amount)

        if (!hasAmounts) return undefined

        const total = parsed.members.reduce((sum, m) => {
          const n = parseFloat(m.amount.replace(/\./g, '').replace(',', '.')) || 0
          return sum + n
        }, 0)

        if (total === 0) return undefined

        return `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
    },
    {
      key: 'installmentsCount',
      label: 'Parcelas',
      getValue: () => (parsed.installmentsCount ? `${parsed.installmentsCount}x` : undefined),
    },
    {
      key: 'purchaseDate',
      label: 'Data',
      getValue: () => {
        if (!parsed.purchaseDate) return undefined
        const [y, m, d] = parsed.purchaseDate.split('-')
        return `${d}/${m}/${y}`
      },
    },
    {
      key: 'description',
      label: 'Descrição',
      getValue: () => parsed.description,
    },
    {
      key: 'category',
      label: 'Categoria',
      getValue: () => parsed.category,
    },
  ]

  return definitions.flatMap(({ key, label, getValue }) => {
    const value = getValue()
    return value ? [{ key, label, value }] : []
  })
}

type AiFieldProps = {
  aiText: string
  setAiText: (v: string) => void
  isParsing: boolean
  isPending: boolean
  missingFields: string[]
  parsedFields: ParsedPurchaseAI | null
  unknownMemberNames: string[]
  handleParsePurchase: () => void
}

export function AiField({
  aiText,
  setAiText,
  isParsing,
  isPending,
  missingFields,
  parsedFields,
  unknownMemberNames,
  handleParsePurchase,
}: AiFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="block-end-textarea" className="uppercase text-xs text-muted-foreground">
        Descreva a compra
      </FieldLabel>
      <InputGroup>
        <InputGroupTextarea
          id="block-end-textarea"
          rows={3}
          value={aiText}
          onChange={e => setAiText(e.target.value)}
          disabled={isParsing || isPending}
          placeholder="Ex.: Jhonny fez uma compra no dia 18 de maio de 2026 no valor de 1.400,00 em 4x"
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            variant="default"
            size="sm"
            disabled={!aiText.trim() || isParsing || isPending}
            onClick={handleParsePurchase}
            className="ml-auto"
          >
            {isParsing ? (
              <>
                <Loader className="size-3.5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                Preencher com IA
              </>
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription className="flex items-center gap-1 text-xs">
        <Info className="size-3.5" />A IA preenche valor, parcelas, data, estabelecimento e
        categoria
      </FieldDescription>

      {(parsedFields || missingFields.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {parsedFields &&
            formatParsedBadges(parsedFields).map(b => (
              <Badge
                key={b.key}
                className="bg-green-500/5 border-green-500/30 gap-1"
                variant="outline"
              >
                <Check className="size-3.5 text-green-700 dark:text-green-400" />
                <span className="text-muted-foreground">{b.label}</span>
                <span className="text-foreground">·</span>
                <span className="font-medium">{b.value}</span>
              </Badge>
            ))}

          {missingFields
            .filter(f => !parsedFields || !(f in (parsedFields as Record<string, unknown>)))
            .map(f => (
              <Badge
                key={f}
                className="bg-yellow-500/10 border-amber-500/30 gap-1"
                variant="outline"
              >
                <TriangleAlert className="size-3.5 text-amber-700 dark:text-amber-400" />
                <span className="text-muted-foreground">{BADGE_LABELS[f] ?? f}</span>
                <span className="text-foreground">·</span>
                <span className="font-medium">
                  {f === 'unknownMembers' && unknownMemberNames.length > 0
                    ? unknownMemberNames.join(', ')
                    : 'definir'}
                </span>
              </Badge>
            ))}
        </div>
      )}
    </Field>
  )
}
