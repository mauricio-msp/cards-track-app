import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createMember } from '@/routes/members/create-member'
import { deleteMember } from '@/routes/members/delete-member'
import { getMember } from '@/routes/members/get-member'
import { getMemberDebts } from '@/routes/members/get-member-debts'
import { getMembers } from '@/routes/members/get-members'
import { updateMember } from '@/routes/members/update-member'

export const memberRoutes: FastifyPluginAsyncZod = async app => {
  app.register(createMember)
  app.register(deleteMember)
  app.register(updateMember)
  app.register(getMembers)
  app.register(getMember)
  app.register(getMemberDebts)
}
