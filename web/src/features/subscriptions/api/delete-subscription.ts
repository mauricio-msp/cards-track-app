export async function deleteSubscription(id: string) {
  const response = await fetch(`http://localhost:3333/api/subscriptions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Erro ao desativar assinatura')
}
