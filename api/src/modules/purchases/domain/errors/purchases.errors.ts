export class PurchaseNotFoundError extends Error {
  constructor() {
    super('Compra não encontrada!')
    this.name = 'PurchaseNotFoundError'
  }
}

export class PurchaseAlreadyAnticipatedError extends Error {
  constructor() {
    super('Esta compra já foi antecipada')
    this.name = 'PurchaseAlreadyAnticipatedError'
  }
}

export class PurchaseSharedBetweenMembersError extends Error {
  constructor() {
    super('Não é possível antecipar uma compra compartilhada entre membros')
    this.name = 'PurchaseSharedBetweenMembersError'
  }
}

export class NoUnpaidInstallmentsError extends Error {
  constructor() {
    super('Não há parcelas em aberto para antecipar')
    this.name = 'NoUnpaidInstallmentsError'
  }
}

export class InvalidAnticipateInstallmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidAnticipateInstallmentError'
  }
}

export class CardDoesNotSupportAnticipationError extends Error {
  constructor() {
    super('Este cartão não permite antecipação de parcelas')
    this.name = 'CardDoesNotSupportAnticipationError'
  }
}
