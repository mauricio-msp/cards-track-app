export async function deleteCard(cardId: string) {
  const response = await fetch(`http://localhost:3333/api/cards/${cardId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Falha ao deletar cartão')
}
