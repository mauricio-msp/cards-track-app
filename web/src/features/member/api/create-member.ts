type CreateMemberRequest = {
  name: string
  relationship: string
  phone?: string
}

export async function createMember({ name, relationship, phone }: CreateMemberRequest) {
  await fetch('http://localhost:3333/api/members', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      relationship,
      phone,
    }),
  })
}
