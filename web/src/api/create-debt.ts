type CreateDebtRequest = {
  cardId: string
  members: Array<{
    id: string
    name: string
    amount: number
  }>
  category: string
  description: string
  installmentsCount: number
  purchaseDate: Date
}

export async function createDebt({
  cardId,
  members,
  category,
  description,
  purchaseDate,
  installmentsCount,
}: CreateDebtRequest) {
  await fetch('http://localhost:3333/api/debts', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cardId,
      members,
      category,
      description,
      purchaseDate,
      installmentsCount,
    }),
  })
}
