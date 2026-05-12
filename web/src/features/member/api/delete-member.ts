import { apiRequest } from '@/lib/api-client'

export async function deleteMember(memberId: string) {
  await apiRequest(`/api/members/${memberId}`, { method: 'DELETE' })
}
