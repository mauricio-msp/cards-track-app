export type UpdateCardRequest = {
  id: string
  limit: number
  closingOffsetDays: number
  dueDay: number
}

export async function updateCard({ id, limit, closingOffsetDays, dueDay }: UpdateCardRequest) {
  const response = await fetch(`http://localhost:3333/api/cards/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit, closingOffsetDays, dueDay }),
  })

  if (!response.ok) throw new Error('Erro ao atualizar cartão.')
}
