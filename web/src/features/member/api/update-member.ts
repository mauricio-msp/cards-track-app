import { apiRequest } from '@/lib/api-client'

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
  await apiRequest(`/api/members/${memberId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ relationship, phone }),
  })
}
