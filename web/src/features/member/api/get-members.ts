import { z } from 'zod'
import { apiRequest } from '@/lib/api-client'

export const MemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  relationship: z.string(),
  phone: z.string().nullish(),
})

export type Member = z.infer<typeof MemberSchema>

const MembersResponse = z.object({
  members: z.array(MemberSchema),
})

export async function getMembers() {
  const data = await apiRequest('/api/members')
  return MembersResponse.parse(data)
}
