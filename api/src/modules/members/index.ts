import { db } from '@/db'
import { CreateMemberUseCase } from '@/modules/members/application/use-cases/create-member/create-member.use-case'
import { DeleteMemberUseCase } from '@/modules/members/application/use-cases/delete-member/delete-member.use-case'
import { GetMemberUseCase } from '@/modules/members/application/use-cases/get-member/get-member.use-case'
import { GetMemberPurchasesUseCase } from '@/modules/members/application/use-cases/get-member-purchases/get-member-purchases.use-case'
import { GetMembersUseCase } from '@/modules/members/application/use-cases/get-members/get-members.use-case'
import { GetPublicMemberUseCase } from '@/modules/members/application/use-cases/get-public-member/get-public-member.use-case'
import { GetPublicMemberPurchasesUseCase } from '@/modules/members/application/use-cases/get-public-member-purchases/get-public-member-purchases.use-case'
import { UpdateMemberUseCase } from '@/modules/members/application/use-cases/update-member/update-member.use-case'
import { CreateMemberController } from '@/modules/members/http/controllers/create-member.controller'
import { DeleteMemberController } from '@/modules/members/http/controllers/delete-member.controller'
import { GetMemberController } from '@/modules/members/http/controllers/get-member.controller'
import { GetMemberPurchasesController } from '@/modules/members/http/controllers/get-member-purchases.controller'
import { GetMembersController } from '@/modules/members/http/controllers/get-members.controller'
import { GetPublicMemberController } from '@/modules/members/http/controllers/get-public-member.controller'
import { GetPublicMemberPurchasesController } from '@/modules/members/http/controllers/get-public-member-purchases.controller'
import { UpdateMemberController } from '@/modules/members/http/controllers/update-member.controller'
import { membersPublicRoutes } from '@/modules/members/http/public-routes'
import { membersRoutes } from '@/modules/members/http/routes'
import { MembersRepository } from '@/modules/members/infra/members.repository'

const repository = new MembersRepository(db)

const controllers = {
  createMember: new CreateMemberController(new CreateMemberUseCase(repository)),
  getMembers: new GetMembersController(new GetMembersUseCase(repository)),
  getMember: new GetMemberController(new GetMemberUseCase(repository)),
  updateMember: new UpdateMemberController(new UpdateMemberUseCase(repository)),
  deleteMember: new DeleteMemberController(new DeleteMemberUseCase(repository)),
  getMemberPurchases: new GetMemberPurchasesController(new GetMemberPurchasesUseCase(repository)),
}

const publicControllers = {
  getPublicMember: new GetPublicMemberController(new GetPublicMemberUseCase(repository)),
  getPublicMemberPurchases: new GetPublicMemberPurchasesController(
    new GetPublicMemberPurchasesUseCase(repository),
  ),
}

export const membersModule = membersRoutes(controllers)
export const membersPublicModule = membersPublicRoutes(publicControllers)
