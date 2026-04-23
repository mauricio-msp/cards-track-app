type UpdateMemberParams = {
  memberId: string
}

type UpdateMemberBody = {
  relationship: string
  phone?: string
}

export async function updateMember({
  memberId,
  relationship,
  phone,
}: UpdateMemberParams & UpdateMemberBody) {
  await fetch(`http://localhost:3333/api/members/${memberId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      relationship,
      phone,
    }),
  })
}
