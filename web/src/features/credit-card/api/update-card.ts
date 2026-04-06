// TODO: Uncomment when BE endpoint is ready (PATCH /api/cards/:id)

export type UpdateCardRequest = {
  id: string
  name: string
  limit: number
  closingOffsetDays: number
  dueDay: number
}

// export async function updateCard({ id, name, limit, closingOffsetDays, dueDay }: UpdateCardRequest) {
//   const response = await fetch(`http://localhost:3333/api/cards/${id}`, {
//     method: 'PATCH',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ name, limit, closingOffsetDays, dueDay }),
//   })
//   if (!response.ok) throw new Error('Erro ao atualizar cartão.')
// }

export async function updateCard(_payload: UpdateCardRequest): Promise<void> {
  // placeholder — substituir pelo fetch real quando o endpoint estiver disponível
}
