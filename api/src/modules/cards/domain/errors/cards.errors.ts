export class CardNotFoundError extends Error {
  constructor() {
    super('Cartão não encontrado')
    this.name = 'CardNotFoundError'
  }
}

export class CardHasActiveDebtsError extends Error {
  constructor() {
    super(
      'Não é possível excluir um cartão com despesas ativas. Quite todas as parcelas antes de excluir.',
    )
    this.name = 'CardHasActiveDebtsError'
  }
}
