export class DebtNotFoundError extends Error {
  constructor() {
    super('Despesa não encontrada!')
    this.name = 'DebtNotFoundError'
  }
}

export class DebtAlreadyAnticipatedError extends Error {
  constructor() {
    super('Debt already anticipated')
    this.name = 'DebtAlreadyAnticipatedError'
  }
}

export class DebtSharedBetweenMembersError extends Error {
  constructor() {
    super('Cannot anticipate a debt shared between members')
    this.name = 'DebtSharedBetweenMembersError'
  }
}

export class NoUnpaidInstallmentsError extends Error {
  constructor() {
    super('No unpaid installments to anticipate')
    this.name = 'NoUnpaidInstallmentsError'
  }
}

export class InvalidAnticipateInstallmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidAnticipateInstallmentError'
  }
}
