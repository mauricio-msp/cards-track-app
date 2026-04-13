import { db } from '@/db'
import { installmentsController } from '@/modules/installments/installments.controller'
import { InstallmentsRepository } from '@/modules/installments/installments.repository'
import { InstallmentsService } from '@/modules/installments/installments.service'

const repository = new InstallmentsRepository(db)
const service = new InstallmentsService(repository)

export const installmentsModule = installmentsController(service)
