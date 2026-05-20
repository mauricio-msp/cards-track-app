export class CoverageNotFoundError extends Error {
  constructor() {
    super('Cobertura não encontrada')
    this.name = 'CoverageNotFoundError'
  }
}

export class InvalidRepaymentAmountError extends Error {
  constructor() {
    super('Valor de quitação não pode exceder o valor da cobertura')
    this.name = 'InvalidRepaymentAmountError'
  }
}

export class CoverageForPastPeriodError extends Error {
  constructor() {
    super('Cobertura só pode ser registrada para o mês atual ou futuros')
    this.name = 'CoverageForPastPeriodError'
  }
}
