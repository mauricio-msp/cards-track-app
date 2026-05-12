import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

type GetMemberParams = {
  id: string
}

const GetMemberResponse = z.object({
  member: z.object({
    id: z.string(),
    name: z.string(),
    relationship: z.string(),
    phone: z.string().nullish(),
  }),
})

export async function getMember({ id }: GetMemberParams) {
  const data = await apiRequest(`/api/members/${id}`)
  return GetMemberResponse.parse(data)
}
