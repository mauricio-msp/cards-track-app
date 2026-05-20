import Groq from 'groq-sdk'
import { env } from '@/env'

type Member = { id: string; name: string }

export type ParsePurchaseInput = {
  text: string
  members: Member[]
}

export type ParsedPurchase = {
  description?: string
  purchaseDate?: string
  category?: string
  installmentsCount?: number
  isRecurring?: boolean
  members?: {
    id: string
    name: string
    amount: string
    startInstallment?: number
    endInstallment?: number
  }[]
}

export type ParsePurchaseOutput = {
  parsed: ParsedPurchase
  missing: string[]
  unknownMemberNames: string[]
}

const PURCHASE_CATEGORIES = [
  'Alimentacao',
  'Supermercado',
  'Mercado',
  'Restaurantes',
  'FastFood',
  'Lanchonete',
  'Cafeteria',
  'Delivery',
  'Padaria',
  'Bares',
  'Acougue',
  'Hortifruti',
  'Mercearia',
  'Doceria',
  'Transporte',
  'Combustivel',
  'Estacionamento',
  'Pedagio',
  'ManutencaoVeiculo',
  'TransportePublico',
  'AplicativosDeTransporte',
  'AluguelDeCarro',
  'LavagemVeiculo',
  'Mototaxi',
  'Bicicleta',
  'Onibus',
  'Mecanico',
  'Casa',
  'Aluguel',
  'Condominio',
  'Energia',
  'Agua',
  'Gas',
  'Internet',
  'Telefone',
  'Limpeza',
  'Reforma',
  'Jardinagem',
  'Seguranca',
  'SeguroCasa',
  'Dedetizacao',
  'Saude',
  'Farmacia',
  'PlanoDeSaude',
  'Consultas',
  'Exames',
  'Academia',
  'Dentista',
  'Psicologia',
  'Nutricionista',
  'Fisioterapia',
  'Otica',
  'SaudeAnimal',
  'Vacinas',
  'Salao',
  'Barbearia',
  'Manicure',
  'Estetica',
  'Spa',
  'Massagem',
  'Cosmeticos',
  'Perfumaria',
  'Higiene',
  'Educacao',
  'Cursos',
  'Faculdade',
  'Livros',
  'AssinaturasEducacionais',
  'Idiomas',
  'MaterialEscolar',
  'Papelaria',
  'CursosOnline',
  'Treinamentos',
  'Lazer',
  'Viagens',
  'Hospedagem',
  'Passagens',
  'Eventos',
  'Streaming',
  'Jogos',
  'Cinema',
  'Shows',
  'Parques',
  'Esportes',
  'ClubeEAssociacao',
  'Turismo',
  'Ingressos',
  'Vestuario',
  'Calcados',
  'Eletronicos',
  'Moveis',
  'Decoracao',
  'Eletrodomesticos',
  'Brinquedos',
  'Ferramentas',
  'MaterialDeConstrucao',
  'Informatica',
  'Acessorios',
  'Joias',
  'Artesanato',
  'PetShop',
  'RacaoEPetFood',
  'VeterinariaConsulta',
  'BanhoEtosa',
  'BrinquedosPet',
  'MedicamentoPet',
  'Assinaturas',
  'ServicosDigitais',
  'Manutencao',
  'Consertos',
  'Encomendas',
  'Freelancers',
  'Correios',
  'Cartorio',
  'Despachante',
  'Impostos',
  'Taxas',
  'Juros',
  'TarifasBancarias',
  'Seguros',
  'Emprestimos',
  'Financiamentos',
  'Anuidade',
  'Investimentos',
  'Previdencia',
  'Presentes',
  'Doacoes',
  'Outros',
]

const SYSTEM_PROMPT = `Você é um extrator de dados de compras para um app brasileiro de controle de gastos. Responda APENAS com JSON válido, sem markdown, sem explicações.

Shape esperado:
{
  "description": string | null,
  "purchaseDate": string | null,
  "category": string | null,
  "installmentsCount": number | null,
  "isRecurring": boolean | null,
  "members": [
    {
      "id": string,
      "name": string,
      "amount": string,
      "startInstallment": number | null,
      "endInstallment": number | null
    }
  ] | null
}`

export class ParsePurchaseUseCase {
  private readonly groq: Groq

  constructor() {
    this.groq = new Groq({ apiKey: env.GROQ_API_KEY })
  }

  async execute({ text, members }: ParsePurchaseInput): Promise<ParsePurchaseOutput> {
    const today = new Date().toISOString().split('T')[0]

    const membersContext =
      members.length > 0
        ? `Membros disponíveis (correspondência por nome, aproximada):\n${members.map(m => `  - nome: "${m.name}", id: "${m.id}"`).join('\n')}`
        : 'Nenhum membro disponível.'

    const userPrompt = `Hoje é ${today}. Extraia as informações de compra do texto abaixo e retorne JSON.

Regras:

- description: nome do estabelecimento ou produto. Use "Loja | Produto" só quando ambos forem claramente identificáveis. Null se não identificável.

- purchaseDate: formato YYYY-MM-DD. Suporta pt-BR ("18 de maio de 2026", "18/05/2026"). Null se não mencionada.

- category: exatamente um valor desta lista: [${PURCHASE_CATEGORIES.join(', ')}]. Infira pelo contexto. Se incerto, use "Outros".

- installmentsCount: inteiro. Padrões: "Nx", "em N parcelas", "N vezes". Null se não mencionado.

- isRecurring: true somente se explicitamente recorrente/mensal. Null caso contrário.

- members: case nomes com a lista abaixo (aproximado). Para cada membro: use id e name exatos da lista.
  - amount: valor POR PARCELA em formato BRL com vírgula (ex: "46,50"). Se installmentsCount null/1, amount = valor total do membro. Se installmentsCount > 1, amount = parte_do_membro / installmentsCount. Se sem valor, use "".
  - startInstallment: parcela inicial do membro (inteiro, base 1). Null = começa na 1ª.
  - endInstallment: parcela final do membro (inteiro). Null = vai até a última.

CENÁRIOS — identifique e aplique:

CENÁRIO 1 — Simples (1 membro):
  Ex: "Maurício comprou shorts na SHEIN 93,00 em 2x"
  → amount="46,50", startInstallment=null, endInstallment=null

CENÁRIO 2 — Dividida igualmente (N membros, mesmas parcelas):
  Ex: "Maurício e Nardin compraram 93,00 em 2x e vão dividir igualmente"
  → cada um: amount=(93/2)/2="23,25", startInstallment=null, endInstallment=null

CENÁRIO 3 — Dividida com intervalos distintos (cada membro cobre um intervalo):
  Ex: "Maurício paga a 1ª parcela e Nardin a última" (93,00 em 2x)
  → Maurício: amount="46,50", startInstallment=1, endInstallment=1
  → Nardin: amount="46,50", startInstallment=2, endInstallment=2

CENÁRIO 4 — Dividida com valores distintos (cada membro tem seu valor total):
  Ex: "parte do Maurício é 50,00 e do Nardin 43,00" (em 2x)
  → Maurício: amount="25,00", startInstallment=null, endInstallment=null
  → Nardin: amount="21,50", startInstallment=null, endInstallment=null

${membersContext}

Texto: "${text}"`

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const raw = JSON.parse(completion.choices[0].message.content ?? '{}')
    const parsed: ParsedPurchase = raw

    // Sanitize members — remove hallucinated entries (null fields or id not in the input list)
    const aiRawMembers: { name?: unknown }[] = Array.isArray(raw.members) ? raw.members : []
    const unknownMemberNames: string[] = []

    if (Array.isArray(parsed.members)) {
      for (const m of aiRawMembers) {
        const isValid =
          m &&
          typeof (m as { id?: unknown }).id === 'string' &&
          (m as { id?: unknown }).id &&
          members.some(a => a.id === (m as { id?: unknown }).id)
        if (!isValid && m && typeof m.name === 'string' && m.name) {
          unknownMemberNames.push(m.name)
        }
      }
      parsed.members = parsed.members.filter(
        m => m && typeof m.id === 'string' && m.id && members.some(a => a.id === m.id),
      )
    }

    const missing: string[] = []
    if (!parsed.description) missing.push('description')
    if (!parsed.purchaseDate) missing.push('purchaseDate')
    if (!parsed.category) missing.push('category')

    if (unknownMemberNames.length > 0) {
      missing.push('unknownMembers')
    }

    if (!parsed.members || parsed.members.length === 0) {
      delete parsed.members
      if (unknownMemberNames.length === 0) missing.push('members')
    }

    if (!parsed.description) delete parsed.description
    if (!parsed.purchaseDate) delete parsed.purchaseDate
    if (!parsed.category) delete parsed.category
    if (!parsed.installmentsCount) delete parsed.installmentsCount
    if (!parsed.isRecurring) delete parsed.isRecurring

    return { parsed, missing, unknownMemberNames }
  }
}
