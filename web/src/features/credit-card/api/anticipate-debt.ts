type AnticipateDebtParams = {
  debtId: string
}

type AnticipateDebtRequest = {
  anticipateFromInstallment: number
}

export async function anticipateDebt({
  debtId,
  anticipateFromInstallment,
}: AnticipateDebtParams & AnticipateDebtRequest) {
  const response = await fetch(`http://localhost:3333/api/debts/${debtId}/anticipate`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ anticipateFromInstallment }),
  })

  if (!response.ok) throw new Error('Erro ao antecipar dívida')

  return response.json()
}
