import { db } from '@/db'
import { membersController } from '@/modules/members/members.controller'
import { MembersRepository } from '@/modules/members/members.repository'
import { MembersService } from '@/modules/members/members.service'

const repository = new MembersRepository(db)
const service = new MembersService(repository)

export const membersModule = membersController(service)
