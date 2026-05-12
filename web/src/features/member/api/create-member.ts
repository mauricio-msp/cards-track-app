import { apiRequest } from '@/lib/api-client'

type CreateMemberRequest = {
  name: string
  relationship: string
  phone?: string
}

export async function createMember({ name, relationship, phone }: CreateMemberRequest) {
  await apiRequest('/api/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, relationship, phone }),
  })
}
