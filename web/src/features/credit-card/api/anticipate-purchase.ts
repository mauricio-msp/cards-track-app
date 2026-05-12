type AnticipatePurchaseParams = {
  purchaseMemberId: string
}

type AnticipatePurchaseRequest = {
  anticipateCount: number
}

export async function anticipatePurchase({
  purchaseMemberId,
  anticipateCount,
}: AnticipatePurchaseParams & AnticipatePurchaseRequest) {
  const response = await fetch(`http://localhost:3333/api/purchases/${purchaseMemberId}/anticipate`, {
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
