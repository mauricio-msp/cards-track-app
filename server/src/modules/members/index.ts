import { db } from '@/db'
import { CreateMemberUseCase } from '@/modules/members/application/use-cases/create-member/create-member.use-case'
import { DeleteMemberUseCase } from '@/modules/members/application/use-cases/delete-member/delete-member.use-case'
import { GetMemberUseCase } from '@/modules/members/application/use-cases/get-member/get-member.use-case'
import { GetMemberDebtsUseCase } from '@/modules/members/application/use-cases/get-member-debts/get-member-debts.use-case'
import { GetMembersUseCase } from '@/modules/members/application/use-cases/get-members/get-members.use-case'
import { UpdateMemberUseCase } from '@/modules/members/application/use-cases/update-member/update-member.use-case'
import { CreateMemberController } from '@/modules/members/http/controllers/create-member.controller'
import { DeleteMemberController } from '@/modules/members/http/controllers/delete-member.controller'
import { GetMemberController } from '@/modules/members/http/controllers/get-member.controller'
import { GetMemberDebtsController } from '@/modules/members/http/controllers/get-member-debts.controller'
import { GetMembersController } from '@/modules/members/http/controllers/get-members.controller'
import { UpdateMemberController } from '@/modules/members/http/controllers/update-member.controller'
import { membersRoutes } from '@/modules/members/http/routes'
import { MembersRepository } from '@/modules/members/infra/members.repository'

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
