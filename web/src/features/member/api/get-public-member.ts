import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

const GetPublicMemberResponse = z.object({
  member: z.object({
    id: z.string(),
    name: z.string(),
    relationship: z.string(),
    phone: z.string().nullable(),
  }),
})

export async function getPublicMember({ id }: { id: string }) {
  const data = await apiRequest(`/api/public/members/${id}`)
  return GetPublicMemberResponse.parse(data)
}
