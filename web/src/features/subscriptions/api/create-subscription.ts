export type CreateSubscriptionRequest = {
  cardId: string
  memberId: string
  name: string
  amount: number   // em centavos
  billingDay: number
}

export async function createSubscription(data: CreateSubscriptionRequest) {
  const response = await fetch('http://localhost:3333/api/subscriptions', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message ?? 'Erro ao criar assinatura')
  }
}
