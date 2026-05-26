import { CoverageNotFoundError } from '@/modules/coverages/domain/errors/coverages.errors'
import type { ICoveragesRepository } from '@/modules/coverages/domain/repositories/coverages.repository.interface'

export class DeleteCoverageUseCase {
  constructor(private readonly repo: ICoveragesRepository) {}

  async execute(id: string): Promise<void> {
    const coverage = await this.repo.findById(id)
    if (!coverage) throw new CoverageNotFoundError()
    await this.repo.delete(id)
  }
}
