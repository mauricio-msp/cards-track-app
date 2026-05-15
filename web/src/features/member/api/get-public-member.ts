import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

type GetPublicMemberParams = {
  id: string
}

const GetPublicMemberResponse = z.object({
  member: z.object({
    id: z.string(),
    name: z.string(),
    relationship: z.string(),
    phone: z.string().nullable(),
  }),
})

export async function getPublicMember({ id }: GetPublicMemberParams) {
  const data = await apiRequest(`/api/public/members/${id}`)
  return GetPublicMemberResponse.parse(data)
}
