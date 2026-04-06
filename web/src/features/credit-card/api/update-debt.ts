// TODO: Uncomment when BE endpoint is ready (PATCH /api/debts/:id)

export type UpdateDebtRequest = {
  debtId: string
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

// export async function updateDebt({ debtId, ...body }: UpdateDebtRequest) {
//   const response = await fetch(`http://localhost:3333/api/debts/${debtId}`, {
//     method: 'PATCH',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(body),
//   })
//   if (!response.ok) throw new Error('Erro ao atualizar despesa.')
// }

export async function updateDebt(_payload: UpdateDebtRequest): Promise<void> {
  // placeholder — substituir pelo fetch real quando o endpoint estiver disponível
}
