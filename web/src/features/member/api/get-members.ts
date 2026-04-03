import { z } from 'zod'

export const MemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  relationship: z.string(),
})

export type Member = z.infer<typeof MemberSchema>

const MembersResponse = z.object({
  members: z.array(MemberSchema),
})

export async function getMembers() {
  const response = await fetch('http://localhost:3333/api/members', {
    credentials: 'include',
  })

  if (!response.ok) throw Error('Falha ao solicitar membros.')

  const datas = await response.json()

  return MembersResponse.parse(datas)
}
