import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createMember } from '@/routes/members/create-member'
import { getMember } from '@/routes/members/get-member'
import { getMemberDebts } from '@/routes/members/get-member-debts'
import { getMembers } from '@/routes/members/get-members'

export const memberRoutes: FastifyPluginAsyncZod = async app => {
  app.register(createMember)
  app.register(getMembers)
  app.register(getMember)
  app.register(getMemberDebts)
}
