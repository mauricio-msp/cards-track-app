export class SubscriptionNotFoundError extends Error {
  constructor() {
    super('Assinatura não encontrada')
    this.name = 'SubscriptionNotFoundError'
  }
}

export class SubscriptionCardNotFoundError extends Error {
  constructor() {
    super('Cartão não encontrado ou não pertence ao usuário')
    this.name = 'SubscriptionCardNotFoundError'
  }
}

export class SubscriptionMemberNotFoundError extends Error {
  constructor() {
    super('Membro não encontrado ou excluído')
    this.name = 'SubscriptionMemberNotFoundError'
  }
}
