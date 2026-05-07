type AnticipateDebtParams = {
  debtId: string
}

type AnticipateDebtRequest = {
  anticipateCount: number
}

export async function anticipateDebt({
  debtId,
  anticipateCount,
}: AnticipateDebtParams & AnticipateDebtRequest) {
  const response = await fetch(`http://localhost:3333/api/debts/${debtId}/anticipate`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ anticipateCount }),
  })

  if (!response.ok) throw new Error('Erro ao antecipar dívida')

  return response.json()
}
