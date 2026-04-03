type CreateCardRequest = {
  name: string
  limit: number
  closingOffsetDays: number
  dueDay: number
}

export async function createCard({ name, limit, closingOffsetDays, dueDay }: CreateCardRequest) {
  await fetch('http://localhost:3333/api/cards', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      limit,
      closingOffsetDays,
      dueDay,
    }),
  })
}
