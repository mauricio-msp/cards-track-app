// TODO: Uncomment when BE endpoint is ready (PATCH /api/purchases/:pmId)

export type UpdatePurchaseRequest = {
  pmId: string
  description: string
  category: string
  purchaseDate: Date
  installmentsCount: number
  members: Array<{
    id: string
    name: string
    amount: number
    startInstallment?: number
    endInstallment?: number
  }>
}

// export async function updatePurchase({ pmId, ...body }: UpdatePurchaseRequest) {
//   const response = await fetch(`http://localhost:3333/api/purchases/${pmId}`, {
//     method: 'PATCH',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(body),
//   })
//   if (!response.ok) throw new Error('Erro ao atualizar despesa.')
// }

export async function updatePurchase(_payload: UpdatePurchaseRequest): Promise<void> {
  // placeholder — substituir pelo fetch real quando o endpoint estiver disponível
}
