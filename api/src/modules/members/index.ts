import { db } from '@/db'
import { MembersRepository } from '@/modules/members/members.repository'
import { membersRoutes } from '@/modules/members/members.routes'
import { CreateMemberController } from './use-cases/create-member/create-member.controller'
import { CreateMemberUseCase } from './use-cases/create-member/create-member.use-case'
import { DeleteMemberController } from './use-cases/delete-member/delete-member.controller'
import { DeleteMemberUseCase } from './use-cases/delete-member/delete-member.use-case'
import { GetMemberController } from './use-cases/get-member/get-member.controller'
import { GetMemberUseCase } from './use-cases/get-member/get-member.use-case'
import { GetMemberDebtsController } from './use-cases/get-member-debts/get-member-debts.controller'
import { GetMemberDebtsUseCase } from './use-cases/get-member-debts/get-member-debts.use-case'
import { GetMembersController } from './use-cases/get-members/get-members.controller'
import { GetMembersUseCase } from './use-cases/get-members/get-members.use-case'
import { UpdateMemberController } from './use-cases/update-member/update-member.controller'
import { UpdateMemberUseCase } from './use-cases/update-member/update-member.use-case'

const repository = new MembersRepository(db)

const controllers = {
  createMember: new CreateMemberController(new CreateMemberUseCase(repository)),
  getMembers: new GetMembersController(new GetMembersUseCase(repository)),
  getMember: new GetMemberController(new GetMemberUseCase(repository)),
  updateMember: new UpdateMemberController(new UpdateMemberUseCase(repository)),
  deleteMember: new DeleteMemberController(new DeleteMemberUseCase(repository)),
  getMemberDebts: new GetMemberDebtsController(new GetMemberDebtsUseCase(repository)),
}

export const membersModule = membersRoutes(controllers)
