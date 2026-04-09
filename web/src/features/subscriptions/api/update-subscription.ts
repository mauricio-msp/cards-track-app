export type UpdateSubscriptionRequest = {
  id: string
  name?: string
  amount?: number
  billingDay?: number
  cardId?: string
  active?: boolean
}

export async function updateSubscription({ id, ...body }: UpdateSubscriptionRequest) {
  const response = await fetch(`http://localhost:3333/api/subscriptions/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message ?? 'Erro ao atualizar assinatura')
  }
}
