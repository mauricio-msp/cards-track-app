# Public Member View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma página pública `/members/:id/public` que exibe compras de um membro por cartão sem exigir autenticação, acessível via link compartilhável.

**Architecture:** Dois novos endpoints sob `/api/public/` (sem `authMiddleware`) alimentam hooks React Query dedicados. Uma rota TanStack Router fora do layout `_app` renderiza a view pública com componentes reutilizados ajustados. O `memberId` UUIDv7 funciona como token implícito de acesso.

**Tech Stack:** Fastify 5, Drizzle ORM, Zod, fastify-type-provider-zod (API) · React 19, TanStack Router, TanStack Query, nuqs, Tailwind CSS v4, shadcn/ui (Web)

---

## Mapa de arquivos

### API — Novos
| Arquivo | Responsabilidade |
|---|---|
| `api/src/modules/members/application/use-cases/get-public-member/get-public-member.use-case.ts` | Busca membro por ID sem userId |
| `api/src/modules/members/application/use-cases/get-public-member-purchases/get-public-member-purchases.use-case.ts` | Busca compras públicas por card |
| `api/src/modules/members/http/controllers/get-public-member.controller.ts` | Handler HTTP para GET público do membro |
| `api/src/modules/members/http/controllers/get-public-member-purchases.controller.ts` | Handler HTTP para GET público das compras |
| `api/src/modules/members/http/public-routes.ts` | Registro das rotas públicas sem authMiddleware |

### API — Modificados
| Arquivo | O que muda |
|---|---|
| `api/src/modules/members/domain/repositories/members.repository.interface.ts` | Adiciona `findByIdOnly(id)` |
| `api/src/modules/members/infra/members.repository.ts` | Implementa `findByIdOnly` |
| `api/src/modules/members/index.ts` | Wires up e exporta `membersPublicModule` |
| `api/src/app.ts` | Registra `membersPublicModule` |

### Web — Novos
| Arquivo | Responsabilidade |
|---|---|
| `web/src/features/member/api/get-public-member.ts` | Chama `GET /api/public/members/:id` |
| `web/src/features/member/api/get-public-member-purchases.ts` | Chama `GET /api/public/members/:id/purchases-by-card` |
| `web/src/features/member/hooks/use-public-member.ts` | Query hook do membro público |
| `web/src/features/member/hooks/use-public-member-purchases.ts` | Query hook das compras públicas |
| `web/src/features/member/components/public-details.tsx` | Cabeçalho do membro sem botão de editar e sem HiddenValue |
| `web/src/features/credit-card/components/purchases/public-purchases-filter.tsx` | Filtro de período sem endpoint de anos autenticado |
| `web/src/features/member/components/public-overview.tsx` | Layout da página pública completa |
| `web/src/routes/members.$id.public.tsx` | Rota TanStack Router fora do layout `_app` |

### Web — Modificados
| Arquivo | O que muda |
|---|---|
| `web/src/features/member/api/index.ts` | Exporta `getPublicMember` e `getPublicMemberPurchases` |
| `web/src/features/member/components/purchases-by-card.tsx` | Extrai `PurchasesByCardView` interno, adiciona `PublicPurchasesByCard` export |
| `web/src/features/member/components/overview.tsx` | Adiciona botão "Copiar link público" |

---

## Task 1: Adicionar `findByIdOnly` ao repositório

**Files:**
- Modify: `api/src/modules/members/domain/repositories/members.repository.interface.ts`
- Modify: `api/src/modules/members/infra/members.repository.ts`

- [ ] **Step 1: Adicionar `findByIdOnly` à interface**

Abrir `api/src/modules/members/domain/repositories/members.repository.interface.ts` e adicionar o método após `findById`:

```ts
export interface IMembersRepository {
  findById(id: string, userId: string): Promise<Member | null>
  findByIdOnly(id: string): Promise<Member | null>   // ← adicionar esta linha
  findAll(
    userId: string,
  ): Promise<Pick<Member, 'id' | 'name' | 'relationship' | 'phone' | 'createdAt'>[]>
  findByName(userId: string, name: string): Promise<{ id: string } | null>
  create(userId: string, data: CreateMemberInput): Promise<Member>
  update(id: string, data: UpdateMemberInput): Promise<Member>
  softDelete(id: string): Promise<void>
  findPurchasesGroupedByCard(
    memberId: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<MemberPurchasesByCard[]>
}
```

- [ ] **Step 2: Implementar `findByIdOnly` no repositório**

Abrir `api/src/modules/members/infra/members.repository.ts` e adicionar o método após `findById` (linha 44):

```ts
async findByIdOnly(id: string): Promise<Member | null> {
  const [member] = await this.db
    .select()
    .from(members)
    .where(and(eq(members.id, id), isNull(members.deletedAt)))
    .limit(1)

  return member ?? null
}
```

- [ ] **Step 3: Verificar compilação TypeScript**

```powershell
cd api; npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 4: Commit**

```bash
git add api/src/modules/members/domain/repositories/members.repository.interface.ts
git add api/src/modules/members/infra/members.repository.ts
git commit -m "feat(members): add findByIdOnly repository method for public queries"
```

---

## Task 2: Use cases públicos

**Files:**
- Create: `api/src/modules/members/application/use-cases/get-public-member/get-public-member.use-case.ts`
- Create: `api/src/modules/members/application/use-cases/get-public-member-purchases/get-public-member-purchases.use-case.ts`

- [ ] **Step 1: Criar `GetPublicMemberUseCase`**

Criar o arquivo `api/src/modules/members/application/use-cases/get-public-member/get-public-member.use-case.ts`:

```ts
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type { IMembersRepository } from '@/modules/members/domain/repositories/members.repository.interface'

export class GetPublicMemberUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(memberId: string) {
    const member = await this.repo.findByIdOnly(memberId)
    if (!member) throw new MemberNotFoundError()
    return {
      id: member.id,
      name: member.name,
      relationship: member.relationship,
      phone: member.phone,
    }
  }
}
```

- [ ] **Step 2: Criar `GetPublicMemberPurchasesUseCase`**

Criar o arquivo `api/src/modules/members/application/use-cases/get-public-member-purchases/get-public-member-purchases.use-case.ts`:

```ts
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type {
  IMembersRepository,
  MemberPurchasesByCard,
} from '@/modules/members/domain/repositories/members.repository.interface'

export class GetPublicMemberPurchasesUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(memberId: string, month?: number, year?: number): Promise<MemberPurchasesByCard[]> {
    const member = await this.repo.findByIdOnly(memberId)
    if (!member) throw new MemberNotFoundError()
    return this.repo.findPurchasesGroupedByCard(memberId, member.userId, month, year)
  }
}
```

- [ ] **Step 3: Verificar compilação**

```powershell
cd api; npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 4: Commit**

```bash
git add api/src/modules/members/application/use-cases/get-public-member/
git add api/src/modules/members/application/use-cases/get-public-member-purchases/
git commit -m "feat(members): add public use cases for member and purchases"
```

---

## Task 3: Controllers públicos

**Files:**
- Create: `api/src/modules/members/http/controllers/get-public-member.controller.ts`
- Create: `api/src/modules/members/http/controllers/get-public-member-purchases.controller.ts`

- [ ] **Step 1: Criar `GetPublicMemberController`**

Criar `api/src/modules/members/http/controllers/get-public-member.controller.ts`:

```ts
import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetPublicMemberUseCase } from '@/modules/members/application/use-cases/get-public-member/get-public-member.use-case'
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'

export class GetPublicMemberController {
  constructor(private readonly useCase: GetPublicMemberUseCase) {}

  async handle(memberId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const member = await this.useCase.execute(memberId)
      return reply.send({ member })
    } catch (err) {
      if (err instanceof MemberNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar membro' })
    }
  }
}
```

- [ ] **Step 2: Criar `GetPublicMemberPurchasesController`**

Criar `api/src/modules/members/http/controllers/get-public-member-purchases.controller.ts`:

```ts
import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetPublicMemberPurchasesUseCase } from '@/modules/members/application/use-cases/get-public-member-purchases/get-public-member-purchases.use-case'
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type { MemberPeriodQuery } from '@/modules/members/http/dto/members.dto'

export class GetPublicMemberPurchasesController {
  constructor(private readonly useCase: GetPublicMemberPurchasesUseCase) {}

  async handle(
    memberId: string,
    query: MemberPeriodQuery,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const cardsWithPurchases = await this.useCase.execute(memberId, query.month, query.year)
      return reply.send({ cardsWithPurchases })
    } catch (err) {
      if (err instanceof MemberNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar despesas do membro' })
    }
  }
}
```

- [ ] **Step 3: Verificar compilação**

```powershell
cd api; npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 4: Commit**

```bash
git add api/src/modules/members/http/controllers/get-public-member.controller.ts
git add api/src/modules/members/http/controllers/get-public-member-purchases.controller.ts
git commit -m "feat(members): add public HTTP controllers"
```

---

## Task 4: Rotas públicas

**Files:**
- Create: `api/src/modules/members/http/public-routes.ts`
- Modify: `api/src/modules/members/index.ts`
- Modify: `api/src/app.ts`

- [ ] **Step 1: Criar `public-routes.ts`**

Criar `api/src/modules/members/http/public-routes.ts`:

```ts
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { GetPublicMemberController } from '@/modules/members/http/controllers/get-public-member.controller'
import type { GetPublicMemberPurchasesController } from '@/modules/members/http/controllers/get-public-member-purchases.controller'
import { memberPeriodQueryDto } from '@/modules/members/http/dto/members.dto'

type PublicControllers = {
  getPublicMember: GetPublicMemberController
  getPublicMemberPurchases: GetPublicMemberPurchasesController
}

export const membersPublicRoutes =
  (controllers: PublicControllers): FastifyPluginAsyncZod =>
  async app => {
    app.get(
      '/api/public/members/:memberId',
      {
        schema: {
          summary: 'Obter dados públicos do membro',
          tags: ['Public'],
          params: z.object({ memberId: z.string().uuid() }),
          response: {
            200: z.object({
              member: z.object({
                id: z.string(),
                name: z.string(),
                relationship: z.string(),
                phone: z.string().nullable(),
              }),
            }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.getPublicMember.handle(req.params.memberId, reply, req.log),
    )

    app.get(
      '/api/public/members/:memberId/purchases-by-card',
      {
        schema: {
          summary: 'Obter despesas públicas do membro por cartão',
          tags: ['Public'],
          params: z.object({ memberId: z.string().uuid() }),
          querystring: memberPeriodQueryDto,
          response: {
            200: z.object({
              cardsWithPurchases: z.array(
                z.object({
                  card: z.object({
                    id: z.string(),
                    name: z.string(),
                    dueDay: z.number(),
                    targetYear: z.number(),
                    targetMonth: z.number(),
                  }),
                  purchases: z.array(
                    z.object({
                      id: z.string(),
                      description: z.string(),
                      purchaseDate: z.string(),
                      amount: z.number(),
                      installmentsCount: z.number(),
                      installmentsAmount: z.number(),
                      elapsedInstallments: z.number(),
                      remainingInstallments: z.number(),
                      anticipatedAt: z.string().nullable(),
                      anticipatedInstallmentsCount: z.number().nullish(),
                      anticipateFromInstallment: z.number().nullish(),
                    }),
                  ),
                }),
              ),
            }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.getPublicMemberPurchases.handle(
          req.params.memberId,
          req.query,
          reply,
          req.log,
        ),
    )
  }
```

- [ ] **Step 2: Atualizar `index.ts` para expor `membersPublicModule`**

Substituir o conteúdo de `api/src/modules/members/index.ts` por:

```ts
import { db } from '@/db'
import { CreateMemberUseCase } from '@/modules/members/application/use-cases/create-member/create-member.use-case'
import { DeleteMemberUseCase } from '@/modules/members/application/use-cases/delete-member/delete-member.use-case'
import { GetMemberUseCase } from '@/modules/members/application/use-cases/get-member/get-member.use-case'
import { GetMemberPurchasesUseCase } from '@/modules/members/application/use-cases/get-member-purchases/get-member-purchases.use-case'
import { GetMembersUseCase } from '@/modules/members/application/use-cases/get-members/get-members.use-case'
import { GetPublicMemberUseCase } from '@/modules/members/application/use-cases/get-public-member/get-public-member.use-case'
import { GetPublicMemberPurchasesUseCase } from '@/modules/members/application/use-cases/get-public-member-purchases/get-public-member-purchases.use-case'
import { UpdateMemberUseCase } from '@/modules/members/application/use-cases/update-member/update-member.use-case'
import { CreateMemberController } from '@/modules/members/http/controllers/create-member.controller'
import { DeleteMemberController } from '@/modules/members/http/controllers/delete-member.controller'
import { GetMemberController } from '@/modules/members/http/controllers/get-member.controller'
import { GetMemberPurchasesController } from '@/modules/members/http/controllers/get-member-purchases.controller'
import { GetMembersController } from '@/modules/members/http/controllers/get-members.controller'
import { GetPublicMemberController } from '@/modules/members/http/controllers/get-public-member.controller'
import { GetPublicMemberPurchasesController } from '@/modules/members/http/controllers/get-public-member-purchases.controller'
import { UpdateMemberController } from '@/modules/members/http/controllers/update-member.controller'
import { membersPublicRoutes } from '@/modules/members/http/public-routes'
import { membersRoutes } from '@/modules/members/http/routes'
import { MembersRepository } from '@/modules/members/infra/members.repository'

const repository = new MembersRepository(db)

const controllers = {
  createMember: new CreateMemberController(new CreateMemberUseCase(repository)),
  getMembers: new GetMembersController(new GetMembersUseCase(repository)),
  getMember: new GetMemberController(new GetMemberUseCase(repository)),
  updateMember: new UpdateMemberController(new UpdateMemberUseCase(repository)),
  deleteMember: new DeleteMemberController(new DeleteMemberUseCase(repository)),
  getMemberPurchases: new GetMemberPurchasesController(new GetMemberPurchasesUseCase(repository)),
}

const publicControllers = {
  getPublicMember: new GetPublicMemberController(new GetPublicMemberUseCase(repository)),
  getPublicMemberPurchases: new GetPublicMemberPurchasesController(
    new GetPublicMemberPurchasesUseCase(repository),
  ),
}

export const membersModule = membersRoutes(controllers)
export const membersPublicModule = membersPublicRoutes(publicControllers)
```

- [ ] **Step 3: Registrar `membersPublicModule` em `app.ts`**

Em `api/src/app.ts`, atualizar o import de members e registrar o módulo público:

```ts
// Linha do import (substituir):
import { membersModule, membersPublicModule } from '@/modules/members'

// Após app.register(membersModule), adicionar:
app.register(membersPublicModule)
```

- [ ] **Step 4: Iniciar API e verificar endpoints**

```powershell
pnpm --filter api dev
```

Em outro terminal:

```powershell
# Deve retornar 200 com { member: { id, name, relationship, phone } }
curl http://localhost:3333/api/public/members/SEU_MEMBER_ID

# Deve retornar 200 com { cardsWithPurchases: [...] }
curl "http://localhost:3333/api/public/members/SEU_MEMBER_ID/purchases-by-card"

# Deve retornar 404 com { message: "..." }
curl http://localhost:3333/api/public/members/00000000-0000-0000-0000-000000000000
```

Substituir `SEU_MEMBER_ID` por um ID real do banco (ex: `019c28e2-8967-7390-a901-a8100a43a950`).

- [ ] **Step 5: Commit**

```bash
git add api/src/modules/members/http/public-routes.ts
git add api/src/modules/members/index.ts
git add api/src/app.ts
git commit -m "feat(members): add public routes and wire up module"
```

---

## Task 5: Web — API functions e hooks

**Files:**
- Create: `web/src/features/member/api/get-public-member.ts`
- Create: `web/src/features/member/api/get-public-member-purchases.ts`
- Modify: `web/src/features/member/api/index.ts`
- Create: `web/src/features/member/hooks/use-public-member.ts`
- Create: `web/src/features/member/hooks/use-public-member-purchases.ts`

- [ ] **Step 1: Criar `get-public-member.ts`**

Criar `web/src/features/member/api/get-public-member.ts`:

```ts
import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

const GetPublicMemberResponse = z.object({
  member: z.object({
    id: z.string(),
    name: z.string(),
    relationship: z.string(),
    phone: z.string().nullable(),
  }),
})

export async function getPublicMember({ id }: { id: string }) {
  const data = await apiRequest(`/api/public/members/${id}`)
  return GetPublicMemberResponse.parse(data)
}
```

- [ ] **Step 2: Criar `get-public-member-purchases.ts`**

Criar `web/src/features/member/api/get-public-member-purchases.ts`:

```ts
import { z } from 'zod'
import { apiRequest, apiUrl } from '@/lib/api-client'

const GetPublicMemberPurchasesResponse = z.object({
  cardsWithPurchases: z.array(
    z.object({
      card: z.object({
        id: z.string(),
        name: z.string(),
        dueDay: z.coerce.number(),
        targetYear: z.coerce.number(),
        targetMonth: z.coerce.number(),
      }),
      purchases: z.array(
        z.object({
          id: z.string(),
          description: z.string(),
          purchaseDate: z.string(),
          amount: z.coerce.number(),
          installmentsCount: z.coerce.number(),
          installmentsAmount: z.coerce.number(),
          elapsedInstallments: z.coerce.number(),
          remainingInstallments: z.coerce.number(),
          anticipatedAt: z.string().nullish(),
          anticipatedInstallmentsCount: z.coerce.number().nullish(),
          anticipateFromInstallment: z.coerce.number().nullish(),
        }),
      ),
    }),
  ),
})

export async function getPublicMemberPurchases({
  id,
  month,
  year,
}: {
  id: string
  month?: number
  year?: number
}) {
  const url = apiUrl(`/api/public/members/${id}/purchases-by-card`)
  if (year !== undefined) url.searchParams.set('year', String(year))
  if (month !== undefined) url.searchParams.set('month', String(month))
  const data = await apiRequest(url)
  return GetPublicMemberPurchasesResponse.parse(data)
}
```

- [ ] **Step 3: Exportar novas funções em `index.ts`**

Adicionar ao final de `web/src/features/member/api/index.ts`:

```ts
export { getPublicMember } from '@/features/member/api/get-public-member'
export { getPublicMemberPurchases } from '@/features/member/api/get-public-member-purchases'
```

- [ ] **Step 4: Criar `use-public-member.ts`**

Criar `web/src/features/member/hooks/use-public-member.ts`:

```ts
import { useSuspenseQuery } from '@tanstack/react-query'
import { getPublicMember } from '@/features/member/api/get-public-member'

export function usePublicMember(memberId: string) {
  return useSuspenseQuery({
    queryKey: ['public', 'members', memberId],
    queryFn: () => getPublicMember({ id: memberId }),
    refetchOnWindowFocus: false,
  })
}
```

- [ ] **Step 5: Criar `use-public-member-purchases.ts`**

Criar `web/src/features/member/hooks/use-public-member-purchases.ts`:

```ts
import { useSuspenseQuery } from '@tanstack/react-query'
import { getPublicMemberPurchases } from '@/features/member/api/get-public-member-purchases'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

export function usePublicMemberPurchases(memberId: string) {
  const { month, year } = usePurchasesFilter()

  return useSuspenseQuery({
    queryKey: ['public', 'members', memberId, 'purchases', month, year],
    queryFn: () => getPublicMemberPurchases({ id: memberId, month, year }),
    refetchOnWindowFocus: false,
  })
}
```

- [ ] **Step 6: Verificar compilação TypeScript do web**

```powershell
cd web; npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 7: Commit**

```bash
git add web/src/features/member/api/get-public-member.ts
git add web/src/features/member/api/get-public-member-purchases.ts
git add web/src/features/member/api/index.ts
git add web/src/features/member/hooks/use-public-member.ts
git add web/src/features/member/hooks/use-public-member-purchases.ts
git commit -m "feat(members): add public API functions and query hooks"
```

---

## Task 6: Refatorar `purchases-by-card.tsx` para suportar view pública

**Files:**
- Modify: `web/src/features/member/components/purchases-by-card.tsx`

**Problema:** Hooks React não podem ser chamados condicionalmente. Não é possível fazer `isPublic ? usePublicMemberPurchases() : useMemberPurchases()`.

**Solução:** Extrair a lógica de renderização para uma função interna `PurchasesByCardView` que recebe `cardsWithPurchases` como prop. `PurchasesByCard` continua usando `useMemberPurchases`. `PublicPurchasesByCard` (novo export) usa `usePublicMemberPurchases`. Ambos delegam para `PurchasesByCardView`.

- [ ] **Step 1: Adicionar `isPublic` em `PurchaseItemProps` e ajustar o JSX de `PurchaseItem`**

Em `web/src/features/member/components/purchases-by-card.tsx`, atualizar `PurchaseItemProps`:

```tsx
type PurchaseItemProps = {
  id: string
  description: string
  purchaseDate: string
  amount: number
  installmentsCount: number
  installmentsAmount: number
  elapsedInstallments: number
  remainingInstallments: number
  anticipatedAt?: string | null
  anticipatedInstallmentsCount?: number | null
  anticipateFromInstallment?: number | null
  isPublic?: boolean  // ← adicionar
}
```

No corpo de `PurchaseItem`, substituir o bloco de valores (parte direita do card):

```tsx
<div className="ml-auto flex flex-col text-right gap-1 shrink-0">
  {purchase.isPublic ? (
    <>
      <p className="text-sm font-semibold">
        {formatPrice(purchase.installmentsAmount / 100)}
      </p>
      <span className="text-xs text-muted-foreground">
        Total: {formatPrice(purchase.amount / 100)}
      </span>
    </>
  ) : (
    <>
      <HiddenValue className="w-20 h-5 dark:bg-muted-foreground/20">
        <p className="text-sm font-semibold">
          {formatPrice(purchase.installmentsAmount / 100)}
        </p>
      </HiddenValue>
      <span className="text-xs text-muted-foreground">
        Total:{' '}
        <HiddenValue placeholder="****">
          {formatPrice(purchase.amount / 100)}
        </HiddenValue>
      </span>
    </>
  )}
</div>
```

- [ ] **Step 2: Extrair `PurchasesByCardView` e criar `PublicPurchasesByCard`**

Substituir a função `PurchasesByCard` exportada por uma função interna `PurchasesByCardView` + dois exports:

```tsx
// Adicionar import
import { usePublicMemberPurchases } from '@/features/member/hooks/use-public-member-purchases'

// Renomear a lógica principal para PurchasesByCardView (não exportada):
function PurchasesByCardView({
  memberId,
  cardsWithPurchases,
  isPublic = false,
}: {
  memberId: string
  cardsWithPurchases: ReturnType<typeof useMemberPurchases>['data']['cardsWithPurchases']
  isPublic?: boolean
}) {
  const sortedCards = useMemo(
    () => cardsWithPurchases.slice().sort((a, b) => a.card.dueDay - b.card.dueDay),
    [cardsWithPurchases],
  )

  if (!cardsWithPurchases.length) {
    return (
      <Empty className="px-2 py-4 border border-dashed md:p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BanknoteX />
          </EmptyMedia>
          <EmptyTitle>Não há compras ainda</EmptyTitle>
          <EmptyDescription>
            Você não registrou nenhuma <br /> despesa para este membro.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ScrollArea
      type="auto"
      className="flex-1 min-h-0 -mx-4 sm:mx-0"
      viewportClassName={cn(
        '[&>div]:h-full [&>div]:![display:unset]',
        'px-4 scroll-px-4 lg:px-0 lg:scroll-px-0 snap-x snap-mandatory lg:snap-none',
      )}
    >
      <div className="flex h-full gap-4 pb-3 lg:pb-0 after:content-[''] after:block after:w-0.5 after:shrink-0 lg:after:hidden">
        {sortedCards.map(cwd => (
          <Card
            key={cwd.card.name}
            className="w-xs md:w-md shrink-0 flex flex-col h-full gap-0 snap-start"
          >
            <CardHeader className="flex items-center gap-2 shrink-0 border-b justify-between">
              <Competence
                cardName={cwd.card.name}
                targetMonth={cwd.card.targetMonth}
                targetYear={cwd.card.targetYear}
              />
              {!isPublic && (
                <MemberPaymentsDialog
                  memberId={memberId}
                  cardId={cwd.card.id}
                  cardName={cwd.card.name}
                  targetMonth={cwd.card.targetMonth}
                  targetYear={cwd.card.targetYear}
                />
              )}
            </CardHeader>

            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="size-full" viewportClassName="[&>div]:![display:unset]">
                <div className="px-4 py-4 w-full">
                  {cwd.purchases
                    .sort(
                      (a, b) =>
                        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
                    )
                    .map(purchase => (
                      <PurchaseItem key={purchase.id} purchase={{ ...purchase, isPublic }} />
                    ))}
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="border-t gap-4 justify-between shrink-0">
              <div className="flex flex-col">
                <span className="text-sm">Total da compra</span>
                <span className="text-xs text-muted-foreground">{cwd.card.name}</span>
              </div>
              {isPublic ? (
                <span className="text-lg text-destructive font-semibold">
                  {formatPrice(
                    cwd.purchases.reduce(
                      (sum, purchase) => sum + purchase.installmentsAmount,
                      0,
                    ) / 100,
                  )}
                </span>
              ) : (
                <HiddenValue className="w-24 h-7 dark:bg-muted-foreground/20">
                  <span className="text-lg text-destructive font-semibold">
                    {formatPrice(
                      cwd.purchases.reduce(
                        (sum, purchase) => sum + purchase.installmentsAmount,
                        0,
                      ) / 100,
                    )}
                  </span>
                </HiddenValue>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

// PurchasesByCard (autenticado) — sem mudança de interface para quem já usa
export function PurchasesByCard({ memberId }: { memberId: string }) {
  const {
    data: { cardsWithPurchases },
  } = useMemberPurchases(memberId)

  return <PurchasesByCardView memberId={memberId} cardsWithPurchases={cardsWithPurchases} />
}

// PublicPurchasesByCard — novo export para a view pública
export function PublicPurchasesByCard({ memberId }: { memberId: string }) {
  const {
    data: { cardsWithPurchases },
  } = usePublicMemberPurchases(memberId)

  return (
    <PurchasesByCardView memberId={memberId} cardsWithPurchases={cardsWithPurchases} isPublic />
  )
}
```

O tipo de `cardsWithPurchases` em `PurchasesByCardView` pode ser importado do hook ou inferido. Usar o tipo do repositório:

```tsx
import type { MemberPurchasesByCard } from '@/features/member/hooks/use-member-purchases'
// ou simplesmente usar:
// cardsWithPurchases: Array<{ card: {...}; purchases: Array<{...}> }>
```

Na prática, anotar como o tipo retornado pelo hook:
```tsx
type CardWithPurchases = ReturnType<typeof useMemberPurchases>['data']['cardsWithPurchases'][number]

function PurchasesByCardView({
  memberId,
  cardsWithPurchases,
  isPublic = false,
}: {
  memberId: string
  cardsWithPurchases: CardWithPurchases[]
  isPublic?: boolean
})
```

- [ ] **Step 3: Verificar compilação**

```powershell
cd web; npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 4: Commit**

```bash
git add web/src/features/member/components/purchases-by-card.tsx
git commit -m "feat(member): extract PurchasesByCardView and add PublicPurchasesByCard"
```

---

## Task 7: Componente `PublicDetails`

**Files:**
- Create: `web/src/features/member/components/public-details.tsx`

`PublicDetails` é o equivalente de `Details` sem `UpdateMemberForm` e sem `HiddenValue` no total. Usa `usePublicMember` + `usePublicMemberPurchases`.

- [ ] **Step 1: Criar `public-details.tsx`**

Criar `web/src/features/member/components/public-details.tsx`:

```tsx
import { Dot, Phone, User, UserStar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { usePublicMember } from '@/features/member/hooks/use-public-member'
import { usePublicMemberPurchases } from '@/features/member/hooks/use-public-member-purchases'
import { cn, formatPhone, formatPrice } from '@/lib/utils'

export function PublicDetails({ memberId }: { memberId: string }) {
  const {
    data: { member },
  } = usePublicMember(memberId)

  const {
    data: { cardsWithPurchases },
  } = usePublicMemberPurchases(memberId)

  const totalAmount = cardsWithPurchases
    .flatMap(cwd => cwd.purchases)
    .reduce((total, p) => total + p.installmentsAmount, 0)

  return (
    <header className="flex items-center gap-2 flex-wrap shrink-0">
      <div className="bg-muted/50 rounded-xl size-12 grid place-items-center">
        {['titular', 'Titular'].includes(member.relationship) ? <UserStar /> : <User />}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-2xl">{member.name}</span>
        <div className="flex items-center gap-0.5">
          <Badge variant="outline">{member.relationship.toLowerCase()}</Badge>
          {member.phone && (
            <>
              <Dot />
              <Badge variant="outline">
                <Phone className="size-2" />
                {formatPhone(member.phone)}
              </Badge>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          'ml-auto flex flex-col items-start shrink-0',
          'dark:bg-muted/40 bg-muted border rounded-2xl p-4 w-full',
          'md:w-auto md:dark:bg-transparent md:bg-transparent md:items-end md:border-0',
        )}
      >
        <span className="text-3xl text-destructive font-semibold">
          {formatPrice(totalAmount / 100)}
        </span>
        <span className="text-sm text-muted-foreground mt-0.5">Total de compras</span>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verificar compilação**

```powershell
cd web; npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 3: Commit**

```bash
git add web/src/features/member/components/public-details.tsx
git commit -m "feat(member): add PublicDetails component for public view"
```

---

## Task 8: `PublicPurchasesFilter`

**Files:**
- Create: `web/src/features/credit-card/components/purchases/public-purchases-filter.tsx`

`PurchasesFilter` usa `usePurchasesYears` que chama um endpoint autenticado. `PublicPurchasesFilter` usa uma lista estática de anos (ano atual ± 1) para evitar qualquer chamada autenticada.

- [ ] **Step 1: Criar `public-purchases-filter.tsx`**

Criar `web/src/features/credit-card/components/purchases/public-purchases-filter.tsx`:

```tsx
import { BrushCleaning, ListFilter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MONTHS } from '@/helpers/months'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

function getStaticYears() {
  const current = new Date().getFullYear()
  return [current - 1, current, current + 1]
}

export function PublicPurchasesFilter() {
  const isMobile = useIsMobile()
  const { month, year, setFilters, clearFilters } = usePurchasesFilter()
  const years = getStaticYears()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter />
          {!isMobile && 'Filtros'}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-w-60">
        <PopoverHeader>
          <PopoverTitle>Filtrar despesas</PopoverTitle>
          <PopoverDescription>Filtre as despesas por mês e ano</PopoverDescription>
        </PopoverHeader>

        <div className="flex flex-col gap-4 mt-3">
          <Select
            value={month?.toString()}
            onValueChange={value => setFilters({ month: Number(value) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um mês" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>Meses</SelectLabel>
                {MONTHS.map((m, index) => (
                  <SelectItem key={m.toLowerCase()} value={index.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={year?.toString()}
            onValueChange={value => setFilters({ year: Number(value) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um ano" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>Anos</SelectLabel>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button variant="ghost" onClick={clearFilters} className="self-start">
            <BrushCleaning />
            Limpar filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 2: Verificar compilação**

```powershell
cd web; npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 3: Commit**

```bash
git add web/src/features/credit-card/components/purchases/public-purchases-filter.tsx
git commit -m "feat(member): add PublicPurchasesFilter with static year range"
```

---

## Task 9: `MemberPublicOverview` + rota pública

**Files:**
- Create: `web/src/features/member/components/public-overview.tsx`
- Create: `web/src/routes/members.$id.public.tsx`

- [ ] **Step 1: Criar `public-overview.tsx`**

Criar `web/src/features/member/components/public-overview.tsx`:

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { BanknoteArrowDown, User } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PublicPurchasesFilter } from '@/features/credit-card/components/purchases/public-purchases-filter'
import { MemberError } from '@/features/member/components/error'
import { PublicDetails } from '@/features/member/components/public-details'
import { PublicPurchasesByCard } from '@/features/member/components/purchases-by-card'
import { DetailsSkeleton, PurchasesByCardSkeleton } from '@/features/member/components/skeleton'

export function MemberPublicOverview() {
  const { id } = useParams({ from: '/members/$id/public' })

  return (
    <div className="flex flex-col min-h-svh">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 border-b">
        <span className="font-semibold">cards.tracks</span>
        <Badge variant="secondary">Visualização pública</Badge>
      </header>

      <div className="flex flex-col flex-1 gap-4 p-4 overflow-hidden min-w-0">
        <div className="flex items-center justify-end shrink-0">
          <PublicPurchasesFilter />
        </div>

        <div className="shrink-0">
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={props => (
                  <MemberError title="Detalhes do Membro" icon={User} {...props} />
                )}
              >
                <Suspense fallback={<DetailsSkeleton />}>
                  <PublicDetails memberId={id} />
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </div>

        <Separator className="shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col">
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={props => (
                  <MemberError title="Dívidas por Cartão" icon={BanknoteArrowDown} {...props} />
                )}
              >
                <Suspense fallback={<PurchasesByCardSkeleton />}>
                  <PublicPurchasesByCard memberId={id} />
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar rota `members.$id.public.tsx`**

Criar `web/src/routes/members.$id.public.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MemberPublicOverview } from '@/features/member/components/public-overview'

export const Route = createFileRoute('/members/$id/public')({
  head: () => ({
    meta: [{ title: 'Visualização pública' }],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <TooltipProvider>
      <MemberPublicOverview />
    </TooltipProvider>
  )
}
```

- [ ] **Step 3: Verificar compilação**

```powershell
cd web; npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 4: Testar no browser**

```powershell
pnpm dev
```

Acessar `http://localhost:5173/members/SEU_MEMBER_ID/public` (substituir pelo ID real).

Verificar:
- Página carrega sem exigir login
- Header mostra "cards.tracks" + badge "Visualização pública"
- Nome, parentesco, telefone do membro aparecem
- Total de compras aparece (sem HiddenValue)
- Cards com compras aparecem com valores abertos
- `MemberPaymentsDialog` não aparece nos cards
- Filtro de período funciona (muda dados ao selecionar mês/ano)

- [ ] **Step 5: Commit**

```bash
git add web/src/features/member/components/public-overview.tsx
git add web/src/routes/members.$id.public.tsx
git commit -m "feat(member): add public overview component and route"
```

---

## Task 10: Botão "Copiar link público" em `MemberOverview`

**Files:**
- Modify: `web/src/features/member/components/overview.tsx`

- [ ] **Step 1: Adicionar botão de cópia**

Em `web/src/features/member/components/overview.tsx`, adicionar o botão ao lado de `GoHomeButton`:

```tsx
// Adicionar imports
import { Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

// Dentro de MemberOverview, adicionar função:
function CopyPublicLinkButton({ id }: { id: string }) {
  function handleCopy() {
    const url = `${window.location.origin}/members/${id}/public`
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copiado!')
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <Link2 />
      Copiar link público
    </Button>
  )
}
```

Atualizar o JSX de `MemberOverview` para incluir o botão na linha do filtro:

```tsx
<div className="flex items-center justify-between mb-2 shrink-0">
  <div className="flex items-center gap-2">
    <GoHomeButton />
    <CopyPublicLinkButton id={id} />
  </div>
  <PurchasesFilter />
</div>
```

- [ ] **Step 2: Verificar compilação**

```powershell
cd web; npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 3: Testar no browser**

Com o dev server rodando, navegar para `http://localhost:5173/members/SEU_MEMBER_ID` (rota autenticada, com login).

Verificar:
- Botão "Copiar link público" aparece ao lado do GoHomeButton
- Ao clicar, aparece toast "Link copiado!"
- Colar o link copiado abre a view pública sem login

- [ ] **Step 4: Commit**

```bash
git add web/src/features/member/components/overview.tsx
git commit -m "feat(member): add copy public link button to internal overview"
```

---

## Checklist final

Antes de considerar a feature completa, verificar:

- [ ] `GET /api/public/members/:id` retorna 200 sem cookie de sessão
- [ ] `GET /api/public/members/:id/purchases-by-card` retorna 200 sem cookie de sessão
- [ ] ID inexistente retorna 404 em ambos os endpoints
- [ ] `/members/:id/public` carrega sem login, sem sidebar
- [ ] Valores monetários aparecem abertos (sem HiddenValue)
- [ ] `MemberPaymentsDialog` não aparece na view pública
- [ ] Filtro de período funciona na view pública
- [ ] Rota interna `/members/:id` ainda funciona normalmente
- [ ] Botão "Copiar link público" gera URL correta e abre toast
