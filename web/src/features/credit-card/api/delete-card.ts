export async function deleteCard(cardId: string) {
  const response = await fetch(`http://localhost:3333/api/cards/${cardId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Falha ao deletar cartão')
  }
}
