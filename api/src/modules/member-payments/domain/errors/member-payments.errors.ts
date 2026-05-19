export class MemberPaymentNotFoundError extends Error {
  constructor() {
    super('Pagamento não encontrado')
    this.name = 'MemberPaymentNotFoundError'
  }
}
