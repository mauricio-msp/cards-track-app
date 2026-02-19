type CreateMemberRequest = {
  name: string
  relationship: string
}

export async function createMember({ name, relationship }: CreateMemberRequest) {
  await fetch('http://localhost:3333/api/members', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      relationship,
    }),
  })
}
