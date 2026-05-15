# Public Member View — Design Spec

**Data:** 2026-05-15  
**Status:** Aprovado

## Problema

A tela de membro (`/members/:id`) exige login. O dono da conta precisa mostrar o saldo devedor de cada membro presencialmente ou via prints. O objetivo é um link público e compartilhável que o membro pode acessar para acompanhar o próprio saldo por cartão e período, sem necessidade de conta.

## Decisões

| Decisão | Escolha | Motivo |
|---|---|---|
| URL | `/members/:id/public` (subpath) | Consistente com URL interna, clara a intenção |
| Auth | Nenhuma | Dados não são sensíveis para o próprio membro |
| Segurança do link | UUIDv7 como token implícito | Impossível de adivinhar por força bruta |
| Valores monetários | Exibidos abertamente | Membro vê os próprios valores |
| Telefone | Exibido | Decisão do dono da conta |
| Ações (pagamentos) | Ocultas | View-only |
| Botão de compartilhamento | Na página interna | UX: não força copiar URL manualmente |

## Arquitetura

```
/members/:id/public  (rota TanStack Router — fora do layout _app)
        │
        ↓ GET /api/public/members/:id/purchases-by-card?month=&year=
        │ (sem authMiddleware)
        │
        ↓ GetPublicMemberPurchasesUseCase
          (memberId + month + year — sem userId)
```

---

## API

### Novo endpoint

```
GET /api/public/members/:memberId/purchases-by-card
  ?month=number
  ?year=number
```

- Sem `authMiddleware`
- Querystring: `memberPeriodQueryDto` (month, year) — reutilizado
- Response 200: mesmo shape de `GET /api/members/:memberId/purchases-by-card`
- Response 404: `{ message }` se memberId não existe
- Response 500: `{ message }` em erro inesperado

### Novos arquivos (api)

```
api/src/modules/members/
  application/use-cases/get-public-member-purchases/
    get-public-member-purchases.use-case.ts
  http/controllers/
    get-public-member-purchases.controller.ts
  http/
    public-routes.ts   ← rotas públicas separadas das autenticadas
```

### Use case

`GetPublicMemberPurchasesUseCase`
- Parâmetros: `memberId: string`, `month: number`, `year: number`
- Sem `userId` na entrada — mas a query existente precisa dele

**Fluxo interno:**
1. `repo.findByIdOnly(memberId)` — novo método no repositório (sem filtro por userId)
2. Extrai `member.userId` do resultado
3. Lança `MemberNotFoundError` se membro não existe
4. Chama `repo.findPurchasesGroupedByCard(memberId, member.userId, month, year)` — reutiliza lógica existente

**Motivo:** `findPurchasesGroupedByCard` filtra por `cards.ownerUserId = userId`. Para o endpoint público não temos o userId na requisição, mas está no registro do membro — é o mesmo dono da conta. Buscar o membro primeiro resolve isso sem duplicar a query de cartões.

**Novo método no repositório:**
- Interface: `findByIdOnly(id: string): Promise<Member | null>`
- Implementação: `SELECT * FROM members WHERE id = $1 AND deletedAt IS NULL`

### Registro

`public-routes.ts` é registrado em `app.ts` separado das rotas autenticadas. Prefixo `/api/public/` torna explícito no servidor quais rotas são abertas — fácil de auditar.

---

## Web

### Nova rota

**Arquivo:** `web/src/routes/members.$id.public.tsx`

- Fora do layout `_app` — sem sidebar, sem breadcrumb, sem redirect de login
- Sem `beforeLoad` de auth
- Renderiza `MemberPublicOverview`

### Novos arquivos (web)

```
web/src/features/member/
  api/get-public-member-purchases.ts
  hooks/purchases/use-public-member-purchases.ts
  components/public-overview.tsx
```

### Componente `MemberPublicOverview`

Layout da página pública:

```
┌─────────────────────────────────────┐
│  Card Track  [Visualização pública] │  ← header simples, sem sidebar
├─────────────────────────────────────┤
│  [Details: nome, parentesco, tel]   │
│  [PurchasesFilter]                  │
├─────────────────────────────────────┤
│  [PurchasesByCard — modo público]   │
└─────────────────────────────────────┘
```

- Reutiliza `Details` (sem mudança)
- Reutiliza `PurchasesFilter` (sem mudança)
- Reutiliza `PurchasesByCard` com `showActions={false}`

### Ajuste em `PurchasesByCard`

Adiciona prop `showActions?: boolean` (default `true`):
- `false` → esconde `MemberPaymentsDialog`
- `false` → renderiza valor diretamente sem `HiddenValue`

Nenhuma outra mudança de lógica.

### Hook `usePublicMemberPurchases`

```ts
// web/src/features/member/hooks/purchases/use-public-member-purchases.ts
useSuspenseQuery({
  queryKey: ['public', 'members', memberId, 'purchases', month, year],
  queryFn: () => getPublicMemberPurchases({ id: memberId, month, year }),
  refetchOnWindowFocus: false,
})
```

Chama `GET /api/public/members/:id/purchases-by-card`.

### Botão "Copiar link público" (página interna)

Adicionado em `MemberOverview` (componente existente):

- Posicionado ao lado do `GoHomeButton` no topo
- `navigator.clipboard.writeText(`${window.location.origin}/members/${id}/public`)`
- Toast de sucesso via sonner: "Link copiado!"
- Ícone: `Share2` ou `Link` (lucide-react)

---

## Fora do escopo

- Revogação de acesso (sem token separado — UUIDv7 é suficiente)
- SEO / meta tags (não é página de descoberta)
- Rate limiting no endpoint público (pode ser adicionado depois)
- Autenticação opcional (membro logado vê a mesma view pública)
