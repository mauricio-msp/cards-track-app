import { z } from 'zod'

type GetMemberParams = {
  id: string
}

const GetMemberResponse = z.object({
  member: z.object({
    name: z.string(),
    relationship: z.string(),
  }),
})

export async function getMember({ id }: GetMemberParams) {
  const response = await fetch(`http://localhost:3333/api/members/${id}`, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to request member by id.')

  const data = await response.json()

  return GetMemberResponse.parse(data)
}
