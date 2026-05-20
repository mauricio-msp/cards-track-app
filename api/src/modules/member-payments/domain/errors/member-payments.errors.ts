export class MemberPaymentNotFoundError extends Error {
  constructor() {
    super('Pagamento não encontrado')
    this.name = 'MemberPaymentNotFoundError'
  }
}

export class PaymentForPastPeriodError extends Error {
  constructor() {
    super('Adiantamento só pode ser registrado para o mês atual ou futuros')
    this.name = 'PaymentForPastPeriodError'
  }
}
